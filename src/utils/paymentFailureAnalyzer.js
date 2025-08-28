import { supabase } from '../lib/supabase';
import { teamService } from '../services/teamService';
import razorpayService from '../services/razorpayService';

export const paymentFailureAnalyzer = {
  // Analyze specific payment failure
  async analyzePaymentFailure(errorDetails = {}) {
    console.log('🔍 Analyzing Payment Failure...');
    console.log('Error Details:', errorDetails);

    const analysis = {
      errorType: 'unknown',
      rootCause: 'unknown',
      solutions: [],
      severity: 'medium'
    };

    // Analyze error message patterns
    const errorMessage = errorDetails.message || errorDetails.error || '';
    
    if (errorMessage.includes('not authenticated') || errorMessage.includes('auth')) {
      analysis.errorType = 'authentication';
      analysis.rootCause = 'User not properly authenticated';
      analysis.solutions = [
        'Log in to the application',
        'Clear browser cache and cookies',
        'Check if session has expired'
      ];
      analysis.severity = 'high';
    }
    
    else if (errorMessage.includes('team') || errorMessage.includes('Team')) {
      analysis.errorType = 'team_data';
      analysis.rootCause = 'Invalid or missing team data';
      analysis.solutions = [
        'Complete team registration first',
        'Verify team has valid ID and event association',
        'Check team member count is correct'
      ];
      analysis.severity = 'high';
    }
    
    else if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
      analysis.errorType = 'database_constraint';
      analysis.rootCause = 'Database foreign key constraint violation';
      analysis.solutions = [
        'Ensure user profile exists',
        'Verify team and event IDs are valid',
        'Check database table relationships'
      ];
      analysis.severity = 'critical';
    }
    
    else if (errorMessage.includes('Razorpay') || errorMessage.includes('razorpay')) {
      analysis.errorType = 'razorpay_config';
      analysis.rootCause = 'Razorpay configuration or script loading issue';
      analysis.solutions = [
        'Check Razorpay key configuration',
        'Verify Razorpay script loads properly',
        'Disable ad blockers',
        'Check network connectivity'
      ];
      analysis.severity = 'medium';
    }
    
    else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      analysis.errorType = 'network';
      analysis.rootCause = 'Network connectivity issue';
      analysis.solutions = [
        'Check internet connection',
        'Verify Supabase URL is accessible',
        'Try different network or browser'
      ];
      analysis.severity = 'medium';
    }

    console.log('📊 Failure Analysis Result:', analysis);
    return analysis;
  },

  // Test specific payment components
  async testPaymentComponents() {
    console.log('🧪 Testing Individual Payment Components...');
    
    const results = {
      environment: await this.testEnvironment(),
      authentication: await this.testAuthentication(),
      teamData: await this.testTeamData(),
      database: await this.testDatabase(),
      razorpay: await this.testRazorpay()
    };

    console.log('🔍 Component Test Results:', results);
    return results;
  },

  async testEnvironment() {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    return {
      razorpayKey: !!razorpayKey,
      razorpayKeyFormat: razorpayKey && (razorpayKey.startsWith('rzp_live_') || razorpayKey.startsWith('rzp_test_')),
      supabaseUrl: !!supabaseUrl,
      status: razorpayKey && supabaseUrl ? 'pass' : 'fail'
    };
  },

  async testAuthentication() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { authenticated: false, profile: false, status: 'fail', error };
      }

      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        authenticated: true,
        profile: !!profile,
        userId: user.id,
        email: user.email,
        status: profile ? 'pass' : 'partial',
        error: profileError
      };
    } catch (error) {
      return { authenticated: false, profile: false, status: 'fail', error };
    }
  },

  async testTeamData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { hasTeam: false, status: 'fail', error: 'Not authenticated' };
      }

      const { data: teams, error } = await teamService.getUserTeams(user.id);
      
      if (error || !teams || teams.length === 0) {
        return { hasTeam: false, status: 'fail', error };
      }

      const team = teams[0];
      const isValid = team.id && team.event_id && team.team_members && team.team_members.length > 0;

      return {
        hasTeam: true,
        teamCount: teams.length,
        teamId: team.id,
        eventId: team.event_id,
        memberCount: team.team_members?.length || 0,
        isValid,
        status: isValid ? 'pass' : 'partial'
      };
    } catch (error) {
      return { hasTeam: false, status: 'fail', error };
    }
  },

  async testDatabase() {
    try {
      // Test basic connection
      const { error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (connectionError) {
        return { connection: false, status: 'fail', error: connectionError };
      }

      // Test payments table
      const { error: paymentsError } = await supabase
        .from('payments')
        .select('count')
        .limit(1);

      // Test teams table
      const { error: teamsError } = await supabase
        .from('teams')
        .select('count')
        .limit(1);

      return {
        connection: true,
        paymentsTable: !paymentsError,
        teamsTable: !teamsError,
        status: (!paymentsError && !teamsError) ? 'pass' : 'partial',
        errors: { paymentsError, teamsError }
      };
    } catch (error) {
      return { connection: false, status: 'fail', error };
    }
  },

  async testRazorpay() {
    const scriptLoaded = !!document.querySelector('script[src*="checkout.razorpay.com"]');
    const objectAvailable = typeof window.Razorpay !== 'undefined';
    
    // Test script loading
    if (!scriptLoaded) {
      try {
        await razorpayService.initializeRazorpay();
      } catch (error) {
        return { scriptLoaded: false, objectAvailable: false, status: 'fail', error };
      }
    }

    return {
      scriptLoaded: !!document.querySelector('script[src*="checkout.razorpay.com"]'),
      objectAvailable: typeof window.Razorpay !== 'undefined',
      status: (scriptLoaded && objectAvailable) ? 'pass' : 'partial'
    };
  },

  // Generate comprehensive failure report
  async generateFailureReport(errorDetails = {}) {
    console.log('📋 Generating Comprehensive Failure Report...\n');

    const analysis = await this.analyzePaymentFailure(errorDetails);
    const componentTests = await this.testPaymentComponents();

    const report = {
      timestamp: new Date().toISOString(),
      errorAnalysis: analysis,
      componentStatus: componentTests,
      recommendations: this.generateRecommendations(analysis, componentTests)
    };

    console.log('📊 PAYMENT FAILURE REPORT:');
    console.log('==========================');
    console.log('Error Type:', analysis.errorType);
    console.log('Root Cause:', analysis.rootCause);
    console.log('Severity:', analysis.severity);
    console.log('\n🔧 COMPONENT STATUS:');
    console.log('Environment:', componentTests.environment.status);
    console.log('Authentication:', componentTests.authentication.status);
    console.log('Team Data:', componentTests.teamData.status);
    console.log('Database:', componentTests.database.status);
    console.log('Razorpay:', componentTests.razorpay.status);
    
    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    return report;
  },

  generateRecommendations(analysis, componentTests) {
    const recommendations = [];

    // Environment issues
    if (componentTests.environment.status === 'fail') {
      recommendations.push('Fix environment configuration - check .env file');
    }

    // Authentication issues
    if (componentTests.authentication.status === 'fail') {
      recommendations.push('Log in to the application');
    } else if (componentTests.authentication.status === 'partial') {
      recommendations.push('Complete user profile setup');
    }

    // Team data issues
    if (componentTests.teamData.status === 'fail') {
      recommendations.push('Register a team before attempting payment');
    } else if (componentTests.teamData.status === 'partial') {
      recommendations.push('Verify team data is complete and valid');
    }

    // Database issues
    if (componentTests.database.status === 'fail') {
      recommendations.push('Check database connectivity and permissions');
    }

    // Razorpay issues
    if (componentTests.razorpay.status === 'fail') {
      recommendations.push('Fix Razorpay script loading - disable ad blockers');
    }

    // Add specific solutions from analysis
    recommendations.push(...analysis.solutions);

    return [...new Set(recommendations)]; // Remove duplicates
  }
};

export default paymentFailureAnalyzer;
