// Production Environment Check Utility
// Use this to verify production deployment is working correctly

export const productionCheck = {
  // Check if running in production
  isProduction() {
    return import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';
  },

  // Check if HTTPS is enabled (required for Razorpay)
  isHTTPS() {
    return window.location.protocol === 'https:';
  },

  // Verify all required environment variables
  checkEnvironmentVariables() {
    const required = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_RAZORPAY_KEY_ID'
    ];

    const results = {};
    const missing = [];

    required.forEach(varName => {
      const value = import.meta.env[varName];
      results[varName] = {
        present: !!value,
        value: value ? `${value.substring(0, 10)}...` : null
      };
      
      if (!value) {
        missing.push(varName);
      }
    });

    return {
      allPresent: missing.length === 0,
      missing,
      results
    };
  },

  // Check Razorpay configuration for production
  checkRazorpayConfig() {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    return {
      keyPresent: !!key,
      isLiveKey: key?.startsWith('rzp_live_'),
      isTestKey: key?.startsWith('rzp_test_'),
      httpsRequired: !this.isHTTPS() && key?.startsWith('rzp_live_'),
      recommendation: key?.startsWith('rzp_test_') && this.isProduction() 
        ? 'Consider using live key for production'
        : key?.startsWith('rzp_live_') && !this.isHTTPS()
        ? 'HTTPS required for live Razorpay key'
        : 'Configuration looks good'
    };
  },

  // Check Supabase configuration
  checkSupabaseConfig() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    return {
      urlPresent: !!url,
      keyPresent: !!key,
      urlFormat: url?.includes('supabase.co'),
      keyFormat: key?.startsWith('eyJ'),
      recommendation: !url || !key 
        ? 'Missing Supabase configuration'
        : !url.includes('supabase.co') || !key.startsWith('eyJ')
        ? 'Invalid Supabase configuration format'
        : 'Configuration looks good'
    };
  },

  // Run comprehensive production check
  runProductionCheck() {
    console.log('🚀 PRODUCTION DEPLOYMENT CHECK\n');
    
    const environment = {
      isProduction: this.isProduction(),
      isHTTPS: this.isHTTPS(),
      domain: window.location.hostname,
      url: window.location.href
    };

    const envVars = this.checkEnvironmentVariables();
    const razorpay = this.checkRazorpayConfig();
    const supabase = this.checkSupabaseConfig();

    // Log results
    console.log('📍 ENVIRONMENT:');
    console.log('Production Mode:', environment.isProduction ? '✅' : '❌');
    console.log('HTTPS Enabled:', environment.isHTTPS ? '✅' : '❌');
    console.log('Domain:', environment.domain);
    console.log('Full URL:', environment.url);

    console.log('\n🔐 ENVIRONMENT VARIABLES:');
    console.log('All Required Present:', envVars.allPresent ? '✅' : '❌');
    if (envVars.missing.length > 0) {
      console.log('Missing Variables:', envVars.missing);
    }
    Object.entries(envVars.results).forEach(([key, result]) => {
      console.log(`${key}:`, result.present ? '✅' : '❌', result.value || 'Not set');
    });

    console.log('\n💳 RAZORPAY CONFIGURATION:');
    console.log('Key Present:', razorpay.keyPresent ? '✅' : '❌');
    console.log('Live Key:', razorpay.isLiveKey ? '✅' : '❌');
    console.log('Test Key:', razorpay.isTestKey ? '⚠️' : '✅');
    console.log('HTTPS Required:', razorpay.httpsRequired ? '❌ REQUIRED' : '✅');
    console.log('Recommendation:', razorpay.recommendation);

    console.log('\n🗄️ SUPABASE CONFIGURATION:');
    console.log('URL Present:', supabase.urlPresent ? '✅' : '❌');
    console.log('Key Present:', supabase.keyPresent ? '✅' : '❌');
    console.log('URL Format:', supabase.urlFormat ? '✅' : '❌');
    console.log('Key Format:', supabase.keyFormat ? '✅' : '❌');
    console.log('Recommendation:', supabase.recommendation);

    // Overall status
    const allGood = environment.isHTTPS && 
                   envVars.allPresent && 
                   razorpay.keyPresent && 
                   supabase.urlPresent && 
                   supabase.keyPresent &&
                   !razorpay.httpsRequired;

    console.log('\n🎯 OVERALL STATUS:', allGood ? '✅ READY FOR PRODUCTION' : '❌ ISSUES FOUND');

    if (!allGood) {
      console.log('\n🔧 ACTION ITEMS:');
      if (!environment.isHTTPS) console.log('- Enable HTTPS (Vercel provides this automatically)');
      if (!envVars.allPresent) console.log('- Add missing environment variables in Vercel');
      if (razorpay.httpsRequired) console.log('- HTTPS required for live Razorpay key');
      if (!supabase.urlPresent || !supabase.keyPresent) console.log('- Configure Supabase environment variables');
    }

    return {
      environment,
      envVars,
      razorpay,
      supabase,
      ready: allGood
    };
  },

  // Quick test of core services
  async testCoreServices() {
    console.log('🧪 TESTING CORE SERVICES\n');

    const results = {
      supabase: false,
      razorpay: false,
      navigation: false
    };

    // Test Supabase connection
    try {
      if (window.supabase) {
        const { data, error } = await window.supabase.from('user_profiles').select('count').limit(1);
        results.supabase = !error;
        console.log('Supabase Connection:', results.supabase ? '✅' : '❌', error?.message || 'Connected');
      } else {
        console.log('Supabase Connection: ❌ Supabase client not available');
      }
    } catch (error) {
      console.log('Supabase Connection: ❌', error.message);
    }

    // Test Razorpay script
    try {
      results.razorpay = typeof window.Razorpay !== 'undefined';
      console.log('Razorpay Script:', results.razorpay ? '✅' : '❌');
    } catch (error) {
      console.log('Razorpay Script: ❌', error.message);
    }

    // Test navigation
    try {
      results.navigation = !!window.location && !!document.querySelector('#root');
      console.log('Navigation/Routing:', results.navigation ? '✅' : '❌');
    } catch (error) {
      console.log('Navigation/Routing: ❌', error.message);
    }

    const allServicesWorking = Object.values(results).every(Boolean);
    console.log('\n🎯 SERVICES STATUS:', allServicesWorking ? '✅ ALL WORKING' : '❌ ISSUES FOUND');

    return results;
  }
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  window.productionCheck = productionCheck;
}

export default productionCheck;
