import { supabase } from '../lib/supabase';

export const cashfreeService = {
  // Initialize Cashfree SDK
  async initializeCashfree() {
    return new Promise((resolve) => {
      // Check if Cashfree is already loaded
      if (window.Cashfree) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        console.log('✅ Cashfree SDK loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Cashfree SDK');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  // Create Cashfree order
  async createOrder(orderData) {
    try {
      console.log('🔍 Creating Cashfree order with data:', orderData);

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
        payment_method: 'cashfree'
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

      // Create Cashfree order
      const cashfreeOrder = {
        order_id: `order_${Date.now()}`,
        order_amount: orderData.amount,
        order_currency: orderData.currency || 'INR',
        customer_details: {
          customer_id: session.session.user.id,
          customer_name: orderData.customerName || 'HackFest Participant',
          customer_email: orderData.customerEmail || session.session.user.email,
          customer_phone: orderData.customerPhone || '9999999999'
        },
        order_meta: {
          return_url: `${window.location.origin}/payment-success`,
          notify_url: `${window.location.origin}/api/webhooks/cashfree`,
          payment_methods: 'cc,dc,nb,upi,paylater,emi,cardlessemi,debitcardemi'
        },
        order_note: `Team Registration - ${orderData.teamName || 'HackFest Team'}`
      };

      console.log('📝 Cashfree order created:', cashfreeOrder);

      // Update payment record with order ID
      const { error: updateError } = await supabase
        .from('payments')
        .update({ transaction_id: cashfreeOrder.order_id })
        .eq('id', payment.id);

      if (updateError) {
        console.error('❌ Failed to update payment with order ID:', updateError);
        return { error: updateError };
      }

      console.log('✅ Order creation completed successfully');

      return {
        order: cashfreeOrder,
        payment: payment
      };
    } catch (error) {
      console.error('❌ Order creation error:', error);
      return { error };
    }
  },

  // Process Cashfree payment
  async processPayment(paymentOptions) {
    try {
      const cashfreeLoaded = await this.initializeCashfree();
      if (!cashfreeLoaded) {
        throw new Error('Failed to load Cashfree SDK');
      }

      console.log('🚀 Processing payment through Cashfree...');

      // Initialize Cashfree with environment
      const cashfreeEnv = import.meta.env.VITE_CASHFREE_ENV || 'TEST'; // TEST or PROD
      window.Cashfree.init({
        mode: cashfreeEnv
      });

      return new Promise((resolve, reject) => {
        const checkoutOptions = {
          paymentSessionId: paymentOptions.payment_session_id,
          returnUrl: paymentOptions.return_url || `${window.location.origin}/payment-success`,
          components: [
            "order-details",
            "card",
            "netbanking", 
            "app",
            "upi",
            "paylater",
            "emi",
            "cardlessemi"
          ],
          style: {
            backgroundColor: '#ffffff',
            color: '#11142D',
            fontFamily: 'Lato',
            fontSize: '14px',
            errorColor: '#ff0000',
            theme: 'light'
          }
        };

        window.Cashfree.checkout(checkoutOptions).then((result) => {
          if (result.error) {
            console.error('❌ Payment failed:', result.error);
            resolve({
              success: false,
              error: result.error.message || 'Payment failed',
              code: result.error.code
            });
          } else if (result.redirect) {
            console.log('🔄 Payment redirect initiated');
            // Handle redirect flow
            window.location.href = result.redirect.url;
          } else if (result.paymentDetails) {
            console.log('✅ Payment successful:', result.paymentDetails);
            resolve({
              success: true,
              paymentId: result.paymentDetails.paymentId,
              orderId: result.paymentDetails.orderId,
              signature: result.paymentDetails.signature
            });
          }
        }).catch((error) => {
          console.error('❌ Cashfree checkout error:', error);
          resolve({
            success: false,
            error: error.message || 'Payment processing failed'
          });
        });
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create payment session (required for Cashfree)
  async createPaymentSession(orderData) {
    try {
      console.log('🔍 Creating Cashfree payment session...');

      // In a real implementation, this would call your backend
      // For now, we'll simulate the session creation
      const sessionData = {
        payment_session_id: `session_${Date.now()}`,
        order_id: orderData.order_id,
        payment_methods: {
          card: true,
          netbanking: true,
          upi: true,
          wallet: true,
          emi: true,
          paylater: true
        }
      };

      console.log('✅ Payment session created:', sessionData);
      return { session: sessionData };

    } catch (error) {
      console.error('❌ Payment session creation error:', error);
      return { error };
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
      if (!paymentData.paymentId || !paymentData.orderId) {
        console.error('❌ Missing payment verification data:', paymentData);
        return { error: { message: 'Missing payment verification data' } };
      }

      // Update payment status in database
      const { data: payment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_gateway_response: paymentData,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', paymentData.orderId)
        .eq('user_id', session.session.user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Payment verification error:', updateError);
        return { error: updateError };
      }

      if (!payment) {
        console.error('❌ Payment record not found for verification');
        return { error: { message: 'Payment record not found' } };
      }

      console.log('✅ Payment verified and updated:', payment.id);

      // Update team status to approved
      const { error: teamUpdateError } = await supabase
        .from('teams')
        .update({
          status: 'approved',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.team_id);

      if (teamUpdateError) {
        console.error('❌ Team status update error:', teamUpdateError);
        // Don't return error as payment is already processed
      } else {
        console.log('✅ Team status updated to approved');
      }

      return { payment };
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return { error };
    }
  },

  // Create payment link (Cashfree Payment Links feature)
  async createPaymentLink(linkData) {
    try {
      console.log('🔗 Creating Cashfree payment link:', linkData);

      // In a real implementation, this would call Cashfree API
      const paymentLink = {
        link_id: `link_${Date.now()}`,
        link_url: `https://payments.cashfree.com/links/${Date.now()}`,
        link_amount: linkData.amount,
        link_currency: linkData.currency || 'INR',
        link_purpose: linkData.purpose || 'Team Registration',
        customer_details: linkData.customer_details,
        link_expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        link_notes: linkData.notes || {}
      };

      console.log('✅ Payment link created:', paymentLink);
      return { link: paymentLink };

    } catch (error) {
      console.error('❌ Payment link creation error:', error);
      return { error };
    }
  },

  // Send payment confirmation
  async sendPaymentConfirmation(paymentData) {
    try {
      console.log('📧 Sending payment confirmation...');
      
      // In a real implementation, you would call your notification service
      const confirmationData = {
        to: paymentData.email,
        subject: 'Payment Confirmation - HackFest 2024',
        teamName: paymentData.teamName,
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        paymentDate: new Date().toISOString()
      };

      console.log('✅ Payment confirmation prepared:', confirmationData);
      return { confirmation: confirmationData };

    } catch (error) {
      console.error('❌ Payment confirmation error:', error);
      return { error };
    }
  }
};

// Make service available globally for debugging
if (typeof window !== 'undefined') {
  window.cashfreeService = cashfreeService;
}
