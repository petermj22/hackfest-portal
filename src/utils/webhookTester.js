// Webhook Testing and Configuration Utility
// Use this to test and configure Razorpay webhooks

export const webhookTester = {
  // Test webhook endpoint connectivity
  async testWebhookEndpoint(baseUrl) {
    try {
      console.log('🔍 Testing webhook endpoint connectivity...');
      
      const webhookUrl = `${baseUrl}/api/webhooks/razorpay`;
      console.log('Webhook URL:', webhookUrl);

      // Test with OPTIONS request (CORS preflight)
      const optionsResponse = await fetch(webhookUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });

      console.log('OPTIONS Response:', {
        status: optionsResponse.status,
        headers: Object.fromEntries(optionsResponse.headers.entries())
      });

      // Test with GET request (should return 405)
      const getResponse = await fetch(webhookUrl, {
        method: 'GET'
      });

      console.log('GET Response:', {
        status: getResponse.status,
        statusText: getResponse.statusText
      });

      if (getResponse.status === 405) {
        console.log('✅ Webhook endpoint is accessible and properly configured');
        return { success: true, message: 'Webhook endpoint is working' };
      } else {
        console.log('⚠️ Unexpected response from webhook endpoint');
        return { success: false, message: 'Unexpected response' };
      }

    } catch (error) {
      console.error('❌ Webhook endpoint test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test webhook with mock Razorpay event
  async testWebhookWithMockEvent(baseUrl, mockEvent = null) {
    try {
      console.log('🧪 Testing webhook with mock event...');
      
      const webhookUrl = `${baseUrl}/api/webhooks/razorpay`;
      
      // Default mock event if none provided
      const defaultMockEvent = {
        entity: 'event',
        account_id: 'acc_test123',
        event: 'payment.captured',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: 'pay_test123456789',
              entity: 'payment',
              amount: 10000,
              currency: 'INR',
              status: 'captured',
              order_id: 'order_test123456789',
              method: 'upi',
              captured: true,
              created_at: Math.floor(Date.now() / 1000)
            }
          }
        },
        created_at: Math.floor(Date.now() / 1000)
      };

      const eventToSend = mockEvent || defaultMockEvent;
      
      console.log('Mock event:', eventToSend);

      // Note: This will fail signature verification since we don't have the webhook secret
      // This is just to test endpoint accessibility
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock_signature_for_testing'
        },
        body: JSON.stringify(eventToSend)
      });

      const responseData = await response.json();
      
      console.log('Webhook Response:', {
        status: response.status,
        data: responseData
      });

      if (response.status === 400 && responseData.error === 'Invalid signature') {
        console.log('✅ Webhook endpoint is working (signature verification active)');
        return { success: true, message: 'Webhook endpoint is properly secured' };
      } else {
        console.log('⚠️ Unexpected webhook response');
        return { success: false, message: 'Unexpected response', data: responseData };
      }

    } catch (error) {
      console.error('❌ Mock webhook test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate webhook configuration for Razorpay dashboard
  generateWebhookConfig(baseUrl) {
    const config = {
      url: `${baseUrl}/api/webhooks/razorpay`,
      events: [
        'payment.authorized',
        'payment.captured',
        'payment.failed',
        'order.paid'
      ],
      active: true,
      secret: 'Generate this in Razorpay dashboard'
    };

    console.log('🔧 Razorpay Webhook Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Webhook URL:', config.url);
    console.log('Events to enable:');
    config.events.forEach(event => console.log(`  ✅ ${event}`));
    console.log('Active:', config.active);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Setup Instructions:');
    console.log('1. Go to Razorpay Dashboard → Settings → Webhooks');
    console.log('2. Click "Create New Webhook"');
    console.log('3. Enter the webhook URL above');
    console.log('4. Select the events listed above');
    console.log('5. Set Active to "Yes"');
    console.log('6. Copy the generated webhook secret');
    console.log('7. Add the secret to Vercel environment variables as RAZORPAY_WEBHOOK_SECRET');

    return config;
  },

  // Check environment variables for webhook
  checkWebhookEnvironment() {
    console.log('🔍 Checking webhook environment configuration...');
    
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'RAZORPAY_WEBHOOK_SECRET',
      'RAZORPAY_KEY_SECRET'
    ];

    const results = {};
    const missing = [];

    requiredVars.forEach(varName => {
      // Note: Client-side can only check VITE_ prefixed variables
      if (varName.startsWith('VITE_')) {
        const value = import.meta.env[varName];
        results[varName] = {
          present: !!value,
          value: value ? `${value.substring(0, 10)}...` : null
        };
        if (!value) missing.push(varName);
      } else {
        results[varName] = {
          present: 'Server-side only',
          value: 'Cannot check from client'
        };
      }
    });

    console.log('📊 Environment Variables Check:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(results).forEach(([key, result]) => {
      const status = result.present === true ? '✅' : 
                    result.present === 'Server-side only' ? '🔒' : '❌';
      console.log(`${status} ${key}: ${result.value || result.present}`);
    });

    if (missing.length > 0) {
      console.log('\n❌ Missing client-side variables:', missing);
    }

    console.log('\n💡 Note: Server-side variables (SUPABASE_SERVICE_ROLE_KEY, etc.)');
    console.log('   can only be verified on the server. Make sure they are set in Vercel.');

    return { results, missing };
  },

  // Test complete webhook flow
  async testCompleteWebhookFlow(baseUrl) {
    console.log('🔄 Testing complete webhook flow...');
    
    const results = {
      connectivity: null,
      mockEvent: null,
      environment: null
    };

    // Test 1: Connectivity
    console.log('\n1️⃣ Testing connectivity...');
    results.connectivity = await this.testWebhookEndpoint(baseUrl);

    // Test 2: Mock event
    console.log('\n2️⃣ Testing with mock event...');
    results.mockEvent = await this.testWebhookWithMockEvent(baseUrl);

    // Test 3: Environment
    console.log('\n3️⃣ Checking environment...');
    results.environment = this.checkWebhookEnvironment();

    // Summary
    console.log('\n📊 WEBHOOK TEST SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Connectivity:', results.connectivity.success ? '✅ PASS' : '❌ FAIL');
    console.log('Mock Event:', results.mockEvent.success ? '✅ PASS' : '❌ FAIL');
    console.log('Environment:', results.environment.missing.length === 0 ? '✅ PASS' : '⚠️ PARTIAL');
    
    const allPassed = results.connectivity.success && 
                     results.mockEvent.success && 
                     results.environment.missing.length === 0;

    console.log('\nOverall Status:', allPassed ? '✅ READY' : '⚠️ NEEDS ATTENTION');

    if (!allPassed) {
      console.log('\n🔧 Next Steps:');
      if (!results.connectivity.success) {
        console.log('- Fix webhook endpoint connectivity issues');
      }
      if (!results.mockEvent.success) {
        console.log('- Check webhook handler implementation');
      }
      if (results.environment.missing.length > 0) {
        console.log('- Add missing environment variables to Vercel');
      }
    }

    return results;
  }
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  window.webhookTester = webhookTester;
}

export default webhookTester;
