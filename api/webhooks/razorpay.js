import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration for webhook handler');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Razorpay Webhook Handler for HackFest Portal
 * Processes payment events and updates database accordingly
 */
export default async function handler(req, res) {
  // Set CORS headers for webhook requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-razorpay-signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.log(`❌ Invalid method: ${req.method}`);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    console.log('🔔 Webhook received from Razorpay');
    console.log('Headers:', req.headers);
    
    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(req);
    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ 
        error: 'Invalid signature',
        message: 'Webhook signature verification failed'
      });
    }

    console.log('✅ Webhook signature verified');

    // Parse webhook payload
    const event = req.body;
    console.log('📦 Webhook event:', {
      event: event.event,
      entity: event.payload?.payment?.entity?.id || event.payload?.order?.entity?.id,
      created_at: event.created_at
    });

    // Process webhook event based on type
    const result = await processWebhookEvent(event);

    if (result.success) {
      console.log('✅ Webhook processed successfully');
      return res.status(200).json({ 
        status: 'success',
        message: 'Webhook processed successfully',
        event: event.event
      });
    } else {
      console.error('❌ Webhook processing failed:', result.error);
      return res.status(500).json({ 
        error: 'Processing failed',
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Webhook processing failed due to server error'
    });
  }
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(req) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('❌ RAZORPAY_WEBHOOK_SECRET not configured');
      return false;
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      console.error('❌ No signature header found');
      return false;
    }

    // Get raw body for signature verification
    const body = JSON.stringify(req.body);
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    console.log('🔐 Signature verification:', isValid ? 'PASSED' : 'FAILED');
    return isValid;

  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

/**
 * Process different types of webhook events
 */
async function processWebhookEvent(event) {
  try {
    const eventType = event.event;
    const payload = event.payload;

    console.log(`🔄 Processing event: ${eventType}`);

    switch (eventType) {
      case 'payment.captured':
        return await handlePaymentCaptured(payload.payment.entity);
        
      case 'payment.failed':
        return await handlePaymentFailed(payload.payment.entity);
        
      case 'payment.authorized':
        return await handlePaymentAuthorized(payload.payment.entity);
        
      case 'order.paid':
        return await handleOrderPaid(payload.order.entity);
        
      default:
        console.log(`ℹ️ Unhandled event type: ${eventType}`);
        return { 
          success: true, 
          message: `Event ${eventType} acknowledged but not processed`
        };
    }

  } catch (error) {
    console.error('❌ Event processing error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Handle payment.captured event
 * This is triggered when a payment is successfully captured
 */
async function handlePaymentCaptured(payment) {
  try {
    console.log('💰 Processing payment.captured:', payment.id);

    const updateData = {
      status: 'paid',
      transaction_id: payment.id,
      payment_gateway_response: payment,
      updated_at: new Date().toISOString(),
      captured_at: new Date(payment.created_at * 1000).toISOString()
    };

    // Update payment record by order ID
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('transaction_id', payment.order_id)
      .select();

    if (error) {
      console.error('❌ Database update error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No payment record found for order:', payment.order_id);
      return { success: false, error: 'Payment record not found' };
    }

    console.log('✅ Payment captured and database updated:', data[0].id);

    // Update team status to approved
    await updateTeamStatus(data[0].team_id, 'approved', 'paid');

    return { success: true, paymentId: data[0].id };

  } catch (error) {
    console.error('❌ Payment captured handler error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payment) {
  try {
    console.log('❌ Processing payment.failed:', payment.id);

    const updateData = {
      status: 'failed',
      payment_gateway_response: payment,
      updated_at: new Date().toISOString(),
      failed_at: new Date(payment.created_at * 1000).toISOString(),
      failure_reason: payment.error_description || 'Payment failed'
    };

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('transaction_id', payment.order_id)
      .select();

    if (error) {
      console.error('❌ Database update error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No payment record found for order:', payment.order_id);
      return { success: false, error: 'Payment record not found' };
    }

    console.log('❌ Payment failed and database updated:', data[0].id);

    // Update team status to indicate payment failure
    await updateTeamStatus(data[0].team_id, 'pending', 'failed');

    return { success: true, paymentId: data[0].id };

  } catch (error) {
    console.error('❌ Payment failed handler error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(payment) {
  try {
    console.log('🔐 Processing payment.authorized:', payment.id);

    const updateData = {
      status: 'authorized',
      transaction_id: payment.id,
      payment_gateway_response: payment,
      updated_at: new Date().toISOString(),
      authorized_at: new Date(payment.created_at * 1000).toISOString()
    };

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('transaction_id', payment.order_id)
      .select();

    if (error) {
      console.error('❌ Database update error:', error);
      return { success: false, error: error.message };
    }

    console.log('🔐 Payment authorized and database updated');
    return { success: true };

  } catch (error) {
    console.error('❌ Payment authorized handler error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(order) {
  try {
    console.log('📋 Processing order.paid:', order.id);

    // Find payment record by order ID
    const { data: payments, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', order.id);

    if (findError) {
      console.error('❌ Error finding payment:', findError);
      return { success: false, error: findError.message };
    }

    if (!payments || payments.length === 0) {
      console.warn('⚠️ No payment record found for order:', order.id);
      return { success: false, error: 'Payment record not found' };
    }

    const payment = payments[0];

    // Update payment with order completion data
    const updateData = {
      status: 'completed',
      payment_gateway_response: {
        ...payment.payment_gateway_response,
        order: order
      },
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('📋 Order paid and database updated');

    // Ensure team status is approved
    await updateTeamStatus(payment.team_id, 'approved', 'paid');

    return { success: true };

  } catch (error) {
    console.error('❌ Order paid handler error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update team status based on payment status
 */
async function updateTeamStatus(teamId, status, paymentStatus) {
  try {
    if (!teamId) {
      console.warn('⚠️ No team ID provided for status update');
      return;
    }

    const { error } = await supabase
      .from('teams')
      .update({
        status: status,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId);

    if (error) {
      console.error('❌ Team status update error:', error);
    } else {
      console.log(`✅ Team ${teamId} status updated: ${status}/${paymentStatus}`);
    }

  } catch (error) {
    console.error('❌ Team status update error:', error);
  }
}
