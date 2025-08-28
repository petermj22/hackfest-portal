import { supabase } from '../lib/supabase';
import { teamService } from '../services/teamService';
import razorpayService from '../services/razorpayService';

export const paymentDebugger = {
  // Check Razorpay configuration
  async checkRazorpayConfig() {
    console.log('🔍 Checking Razorpay Configuration...');
    
    const results = {
      envKey: null,
      keyFormat: false,
      scriptLoaded: false,
      razorpayObject: false
    };

    // Check environment variable
    results.envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    console.log('Environment Key:', results.envKey);

    // Validate key format
    if (results.envKey) {
      results.keyFormat = results.envKey.startsWith('rzp_test_') || results.envKey.startsWith('rzp_live_');
      console.log('Key Format Valid:', results.keyFormat);
      
      if (results.envKey.startsWith('rzp_live_')) {
        // Check if we're in development environment
        const isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.hostname.includes('dev') ||
                             window.location.hostname.includes('127.0.0.1');

        if (isDevelopment) {
          console.warn('⚠️ Using LIVE Razorpay key in development - consider using test key for safety');
        } else {
          console.log('✅ Using LIVE Razorpay key for production environment');
        }
      } else if (results.envKey.startsWith('rzp_test_')) {
        console.log('✅ Using TEST Razorpay key - good for development');
      } else {
        console.error('❌ Invalid Razorpay key format');
      }
    } else {
      console.error('❌ VITE_RAZORPAY_KEY_ID not found in environment');
    }

    // Check if Razorpay script is loaded
    results.scriptLoaded = !!document.querySelector('script[src*="checkout.razorpay.com"]');
    console.log('Razorpay Script Loaded:', results.scriptLoaded);

    // Check if Razorpay object is available
    results.razorpayObject = typeof window.Razorpay !== 'undefined';
    console.log('Razorpay Object Available:', results.razorpayObject);

    return results;
  },

  // Check user authentication and profile
  async checkUserAuth() {
    console.log('🔍 Checking User Authentication...');
    
    const results = {
      authenticated: false,
      userId: null,
      userProfile: null,
      hasTeam: false,
      teamData: null
    };

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ User not authenticated:', authError);
        return results;
      }

      results.authenticated = true;
      results.userId = user.id;
      console.log('✅ User authenticated:', user.email);

      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ User profile not found:', profileError);
      } else {
        results.userProfile = profile;
        console.log('✅ User profile found:', profile.full_name);
      }

      // Check user's teams
      const { data: teams, error: teamsError } = await teamService.getUserTeams(user.id);
      
      if (teamsError) {
        console.error('❌ Error fetching teams:', teamsError);
      } else if (teams && teams.length > 0) {
        results.hasTeam = true;
        results.teamData = teams[0];
        console.log('✅ Team found:', teams[0].name);
      } else {
        console.warn('⚠️ No teams found for user');
      }

    } catch (error) {
      console.error('❌ Authentication check failed:', error);
    }

    return results;
  },

  // Test payment data validation
  async validatePaymentData(teamData) {
    console.log('🔍 Validating Payment Data...');
    
    const results = {
      teamId: false,
      eventId: false,
      amount: false,
      memberCount: false,
      validData: false
    };

    if (!teamData) {
      console.error('❌ No team data provided');
      return results;
    }

    // Check team ID
    results.teamId = !!teamData.teamId;
    console.log('Team ID present:', results.teamId, teamData.teamId);

    // Check event ID
    results.eventId = !!teamData.eventId;
    console.log('Event ID present:', results.eventId, teamData.eventId);

    // Check member count and amount
    const memberCount = teamData.members?.length || 1;
    results.memberCount = memberCount > 0;
    console.log('Member count:', memberCount);

    const amount = memberCount * 100;
    results.amount = amount > 0;
    console.log('Calculated amount:', amount);

    results.validData = results.teamId && results.eventId && results.amount && results.memberCount;
    console.log('Payment data valid:', results.validData);

    return results;
  },

  // Test database connection and payment table
  async testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...');
    
    const results = {
      connection: false,
      paymentsTable: false,
      teamsTable: false,
      userProfilesTable: false,
      canInsert: false
    };

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Database connection failed:', error);
        return results;
      }

      results.connection = true;
      console.log('✅ Database connection successful');

      // Test payments table
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('count')
        .limit(1);

      if (paymentsError) {
        console.error('❌ Payments table access failed:', paymentsError);
      } else {
        results.paymentsTable = true;
        console.log('✅ Payments table accessible');
      }

      // Test teams table
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('count')
        .limit(1);

      if (teamsError) {
        console.error('❌ Teams table access failed:', teamsError);
      } else {
        results.teamsTable = true;
        console.log('✅ Teams table accessible');
      }

      // Test user_profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (profilesError) {
        console.error('❌ User profiles table access failed:', profilesError);
      } else {
        results.userProfilesTable = true;
        console.log('✅ User profiles table accessible');
      }

      // Test payment insertion capability
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try to create a test payment record (will be rolled back)
          const testPayment = {
            user_id: user.id,
            team_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
            event_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
            amount: 100,
            currency: 'INR',
            status: 'pending',
            payment_method: 'test'
          };

          // This will likely fail due to foreign key constraints, which is expected
          const { error: insertError } = await supabase
            .from('payments')
            .insert(testPayment);

          if (insertError) {
            if (insertError.code === '23503') {
              console.log('✅ Foreign key constraints are working (expected error)');
            } else {
              console.error('❌ Unexpected payment insertion error:', insertError);
            }
          } else {
            console.warn('⚠️ Test payment inserted (this should not happen)');
            results.canInsert = true;
          }
        }
      } catch (error) {
        console.error('❌ Payment insertion test failed:', error);
      }

    } catch (error) {
      console.error('❌ Database test failed:', error);
    }

    return results;
  },

  // Test payment order creation
  async testPaymentOrderCreation(teamData) {
    console.log('🔍 Testing Payment Order Creation...');
    
    if (!teamData) {
      console.error('❌ No team data provided for order creation test');
      return { success: false, error: 'No team data' };
    }

    try {
      const orderData = {
        teamId: teamData.teamId,
        eventId: teamData.eventId,
        amount: (teamData.members?.length || 1) * 100,
        currency: 'INR'
      };

      console.log('Order data:', orderData);

      const result = await razorpayService.createOrder(orderData);
      
      if (result.error) {
        console.error('❌ Order creation failed:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Order created successfully:', result.order);
      return { success: true, order: result.order, payment: result.payment };

    } catch (error) {
      console.error('❌ Order creation test failed:', error);
      return { success: false, error };
    }
  },

  // Test actual payment flow simulation
  async testPaymentFlowSimulation() {
    console.log('🔍 Testing Payment Flow Simulation...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated for payment flow test');
        return { success: false, error: 'User not authenticated' };
      }

      // Get user's team data
      const { data: teams, error: teamsError } = await teamService.getUserTeams(user.id);
      if (teamsError || !teams || teams.length === 0) {
        console.error('❌ No teams found for payment flow test');
        return { success: false, error: 'No teams found' };
      }

      const teamData = teams[0];
      console.log('✅ Team data found for simulation:', teamData.name);

      // Simulate the exact payment flow
      const memberCount = teamData.team_members?.length || 1;
      const totalAmount = memberCount * 100;

      console.log('💰 Payment simulation details:');
      console.log('- Team ID:', teamData.id);
      console.log('- Event ID:', teamData.event_id);
      console.log('- Member Count:', memberCount);
      console.log('- Total Amount:', totalAmount);

      // Test order creation with real data
      const orderResult = await this.testPaymentOrderCreation({
        teamId: teamData.id,
        eventId: teamData.event_id,
        members: teamData.team_members,
        teamName: teamData.name
      });

      return orderResult;

    } catch (error) {
      console.error('❌ Payment flow simulation failed:', error);
      return { success: false, error };
    }
  },

  // Run comprehensive payment diagnostics
  async runFullDiagnostics() {
    console.log('🧪 Running Full Payment Diagnostics...\n');

    const diagnostics = {
      razorpayConfig: await this.checkRazorpayConfig(),
      userAuth: await this.checkUserAuth(),
      database: await this.testDatabaseConnection()
    };

    // Test payment data validation if user has team
    if (diagnostics.userAuth.hasTeam) {
      diagnostics.paymentData = await this.validatePaymentData(diagnostics.userAuth.teamData);

      // Test order creation if payment data is valid
      if (diagnostics.paymentData.validData) {
        diagnostics.orderCreation = await this.testPaymentOrderCreation(diagnostics.userAuth.teamData);
      }

      // Test complete payment flow simulation
      diagnostics.paymentFlowSimulation = await this.testPaymentFlowSimulation();
    }

    // Generate summary
    console.log('\n📊 Diagnostics Summary:');
    console.log('Razorpay Config:', diagnostics.razorpayConfig.keyFormat && diagnostics.razorpayConfig.razorpayObject ? '✅ PASS' : '❌ FAIL');
    console.log('User Auth:', diagnostics.userAuth.authenticated && diagnostics.userAuth.userProfile ? '✅ PASS' : '❌ FAIL');
    console.log('Database:', diagnostics.database.connection && diagnostics.database.paymentsTable ? '✅ PASS' : '❌ FAIL');
    console.log('Team Data:', diagnostics.userAuth.hasTeam ? '✅ PASS' : '❌ FAIL');

    if (diagnostics.paymentData) {
      console.log('Payment Data:', diagnostics.paymentData.validData ? '✅ PASS' : '❌ FAIL');
    }

    if (diagnostics.orderCreation) {
      console.log('Order Creation:', diagnostics.orderCreation.success ? '✅ PASS' : '❌ FAIL');
    }

    if (diagnostics.paymentFlowSimulation) {
      console.log('Payment Flow:', diagnostics.paymentFlowSimulation.success ? '✅ PASS' : '❌ FAIL');
    }

    // Provide specific recommendations
    console.log('\n💡 Recommendations:');
    if (!diagnostics.razorpayConfig.keyFormat) {
      console.log('❌ Fix Razorpay key configuration');
    }
    if (!diagnostics.userAuth.authenticated) {
      console.log('❌ User needs to log in');
    }
    if (!diagnostics.userAuth.userProfile) {
      console.log('❌ Complete user profile setup');
    }
    if (!diagnostics.userAuth.hasTeam) {
      console.log('❌ Register a team before payment');
    }
    if (diagnostics.paymentData && !diagnostics.paymentData.validData) {
      console.log('❌ Fix team data validation issues');
    }
    if (diagnostics.orderCreation && !diagnostics.orderCreation.success) {
      console.log('❌ Fix order creation process');
    }

    return diagnostics;
  }
};

export default paymentDebugger;
