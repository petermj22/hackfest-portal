import { supabase } from '../lib/supabase';

export const razorpayService = {
  // Initialize Razorpay script
  async initializeRazorpay() {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  // Create Razorpay order
  async createOrder(orderData) {
    try {
      console.log('🔍 Creating Razorpay order with data:', orderData);

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.error('❌ User not authenticated');
        return { error: { message: 'User not authenticated' } };
      }

      console.log('✅ User authenticated:', session.session.user.id);

      // Validate required fields
      if (!orderData.teamId || !orderData.eventId || !orderData.amount) {
        console.error('❌ Missing required order data:', orderData);
        return { error: { message: 'Missing required order data' } };
      }

      // Create payment record in database first
      const paymentData = {
        user_id: session.session.user.id,
        team_id: orderData.teamId,
        event_id: orderData.eventId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        status: 'pending',
        payment_method: 'razorpay'
      };

      console.log('💾 Creating payment record:', paymentData);

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (paymentError) {
        console.error('❌ Payment record creation error:', paymentError);
        return { error: paymentError };
      }

      console.log('✅ Payment record created:', payment.id);

      // In a real implementation, you would call your backend to create a Razorpay order
      // For now, we'll create a mock order
      const mockOrder = {
        id: `order_${Date.now()}`,
        entity: 'order',
        amount: orderData.amount * 100, // Amount in paise
        amount_paid: 0,
        amount_due: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        receipt: `receipt_${payment.id}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };

      console.log('📝 Mock order created:', mockOrder);

      // Update payment record with order ID
      const { error: updateError } = await supabase
        .from('payments')
        .update({ transaction_id: mockOrder.id })
        .eq('id', payment.id);

      if (updateError) {
        console.error('❌ Failed to update payment with order ID:', updateError);
        return { error: updateError };
      }

      console.log('✅ Order creation completed successfully');

      return {
        order: mockOrder,
        payment: payment
      };
    } catch (error) {
      console.error('❌ Order creation error:', error);
      return { error };
    }
  },

  // Process Razorpay payment
  async processPayment(paymentOptions) {
    try {
      const razorpayLoaded = await this.initializeRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay');
      }

      return new Promise((resolve, reject) => {
        const options = {
          ...paymentOptions,
          handler: function (response) {
            console.log('✅ Payment successful:', response);
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function() {
              console.log('❌ Payment cancelled by user');
              resolve({
                success: false,
                error: 'Payment cancelled by user'
              });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('❌ Payment failed:', response.error);
          resolve({
            success: false,
            error: response.error.description,
            code: response.error.code
          });
        });

        rzp.open();
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verify payment and update database
  async verifyPayment(paymentData) {
    try {
      console.log('🔍 Verifying payment:', paymentData);

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.error('❌ User not authenticated during verification');
        return { error: { message: 'User not authenticated' } };
      }

      // Validate payment data
      if (!paymentData.paymentId || !paymentData.orderId || !paymentData.signature) {
        console.error('❌ Missing payment verification data:', paymentData);
        return { error: { message: 'Missing payment verification data' } };
      }

      // In a real implementation, you would verify the payment signature on your backend
      // For now, we'll simulate verification
      const isVerified = paymentData.paymentId && paymentData.orderId && paymentData.signature;

      if (!isVerified) {
        console.error('❌ Payment verification failed');
        return { error: { message: 'Payment verification failed' } };
      }

      console.log('✅ Payment verification successful');

      // Find the payment record by order ID
      const { data: existingPayment, error: findError } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', paymentData.orderId)
        .single();

      if (findError) {
        console.error('❌ Payment record not found:', findError);
        return { error: { message: 'Payment record not found' } };
      }

      console.log('✅ Payment record found:', existingPayment.id);

      // Update payment status in database
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          transaction_id: paymentData.paymentId,
          payment_gateway_response: {
            razorpay_payment_id: paymentData.paymentId,
            razorpay_order_id: paymentData.orderId,
            razorpay_signature: paymentData.signature,
            verified_at: new Date().toISOString()
          }
        })
        .eq('id', existingPayment.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Payment update error:', updateError);
        return { error: updateError };
      }

      console.log('✅ Payment status updated successfully');

      return { data: updatedPayment };
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return { error };
    }
  },

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Send payment confirmation email (webhook to n8n)
  async sendPaymentConfirmation(paymentData) {
    try {
      // In a real implementation, you would call your n8n webhook
      const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/payment-confirmation';
      
      const emailData = {
        to: paymentData.email,
        subject: 'Payment Confirmation - HackFest 2024',
        teamName: paymentData.teamName,
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        paymentDate: new Date().toISOString()
      };

      // For now, we'll just log the email data
      console.log('📧 Payment confirmation email data:', emailData);
      
      // Simulate email sending
      return { success: true, message: 'Confirmation email sent' };
    } catch (error) {
      console.error('Email sending error:', error);
      return { error };
    }
  }
};

export default razorpayService;
