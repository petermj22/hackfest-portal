// Quick Payment Diagnostic Script
// Run this in browser console to get immediate diagnostic results

export const quickDiagnostic = () => {
  console.log('🔧 QUICK PAYMENT DIAGNOSTIC STARTING...\n');
  
  // 1. Check Environment Variables
  console.log('1️⃣ ENVIRONMENT CONFIGURATION:');
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  console.log('Razorpay Key:', razorpayKey ? `${razorpayKey.substring(0, 12)}...` : '❌ NOT FOUND');
  console.log('Key Format Valid:', razorpayKey && (razorpayKey.startsWith('rzp_live_') || razorpayKey.startsWith('rzp_test_')) ? '✅ YES' : '❌ NO');
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ CONFIGURED' : '❌ MISSING');
  
  // 2. Check Razorpay Script
  console.log('\n2️⃣ RAZORPAY SCRIPT STATUS:');
  const razorpayScript = document.querySelector('script[src*="checkout.razorpay.com"]');
  console.log('Script Element:', razorpayScript ? '✅ FOUND' : '❌ NOT FOUND');
  console.log('Razorpay Object:', typeof window.Razorpay !== 'undefined' ? '✅ AVAILABLE' : '❌ NOT AVAILABLE');
  
  // 3. Check Current Page Context
  console.log('\n3️⃣ CURRENT PAGE CONTEXT:');
  console.log('Current URL:', window.location.pathname);
  console.log('User Agent:', navigator.userAgent.includes('Chrome') ? '✅ Chrome' : navigator.userAgent.includes('Firefox') ? '✅ Firefox' : '⚠️ Other Browser');
  
  // 4. Check Local Storage
  console.log('\n4️⃣ LOCAL STORAGE:');
  const authData = localStorage.getItem('supabase.auth.token');
  console.log('Auth Token:', authData ? '✅ PRESENT' : '❌ MISSING');
  
  // 5. Check Network Connectivity
  console.log('\n5️⃣ NETWORK STATUS:');
  console.log('Online Status:', navigator.onLine ? '✅ ONLINE' : '❌ OFFLINE');
  
  // 6. Quick Supabase Test
  console.log('\n6️⃣ SUPABASE CONNECTION TEST:');
  if (window.supabase) {
    window.supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.log('Auth Status: ❌ ERROR -', error.message);
      } else if (user) {
        console.log('Auth Status: ✅ AUTHENTICATED -', user.email);
        
        // Test user profile
        window.supabase.from('user_profiles').select('*').eq('id', user.id).single().then(({ data, error }) => {
          console.log('User Profile:', data ? '✅ FOUND' : '❌ MISSING');
          if (error) console.log('Profile Error:', error.message);
        });
        
        // Test teams
        window.supabase.from('teams').select('*').eq('leader_id', user.id).then(({ data, error }) => {
          console.log('User Teams:', data && data.length > 0 ? `✅ FOUND (${data.length})` : '❌ NONE');
          if (error) console.log('Teams Error:', error.message);
        });
        
      } else {
        console.log('Auth Status: ❌ NOT AUTHENTICATED');
      }
    });
  } else {
    console.log('Supabase Object: ❌ NOT AVAILABLE');
  }
  
  console.log('\n🔧 DIAGNOSTIC COMPLETE - Check results above');
  console.log('💡 TIP: If any items show ❌, those are likely causing the payment failure');
  
  return {
    razorpayKey: !!razorpayKey,
    razorpayScript: !!razorpayScript,
    razorpayObject: typeof window.Razorpay !== 'undefined',
    online: navigator.onLine,
    supabase: !!window.supabase
  };
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  window.quickPaymentDiagnostic = quickDiagnostic;
  console.log('💡 Run quickPaymentDiagnostic() in console for instant diagnosis');
}
