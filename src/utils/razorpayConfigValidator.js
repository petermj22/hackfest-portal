// Razorpay Configuration Validator
// Validates Razorpay setup and identifies configuration issues

export const razorpayConfigValidator = {
  // Comprehensive Razorpay configuration validation
  async validateConfiguration() {
    console.log('🔍 Validating Razorpay Configuration...\n');
    
    const validation = {
      environment: this.validateEnvironment(),
      keyConfiguration: this.validateKeyConfiguration(),
      scriptLoading: await this.validateScriptLoading(),
      accountStatus: await this.validateAccountStatus(),
      securitySetup: this.validateSecuritySetup(),
      productionReadiness: this.validateProductionReadiness()
    };

    // Generate overall status
    const issues = this.identifyIssues(validation);
    const recommendations = this.generateRecommendations(validation);

    console.log('📊 RAZORPAY CONFIGURATION VALIDATION RESULTS:');
    console.log('==============================================');
    
    Object.entries(validation).forEach(([category, result]) => {
      const status = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${status} ${category.toUpperCase()}: ${result.status}`);
      if (result.message) console.log(`   ${result.message}`);
    });

    if (issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      issues.forEach((issue, index) => console.log(`${index + 1}. ${issue}`));
    }

    if (recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => console.log(`${index + 1}. ${rec}`));
    }

    return { validation, issues, recommendations };
  },

  // Validate environment setup
  validateEnvironment() {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname.includes('dev');
    
    if (!razorpayKey) {
      return {
        status: 'fail',
        message: 'VITE_RAZORPAY_KEY_ID not found in environment variables'
      };
    }

    const isLiveKey = razorpayKey.startsWith('rzp_live_');
    const isTestKey = razorpayKey.startsWith('rzp_test_');

    if (!isLiveKey && !isTestKey) {
      return {
        status: 'fail',
        message: 'Invalid Razorpay key format - must start with rzp_live_ or rzp_test_'
      };
    }

    if (isDevelopment && isLiveKey) {
      return {
        status: 'warning',
        message: 'Using live key in development environment - consider test key for safety'
      };
    }

    if (!isDevelopment && isTestKey) {
      return {
        status: 'warning',
        message: 'Using test key in production environment - should use live key'
      };
    }

    return {
      status: 'pass',
      message: `Valid ${isLiveKey ? 'live' : 'test'} key configured for ${isDevelopment ? 'development' : 'production'}`
    };
  },

  // Validate key configuration
  validateKeyConfiguration() {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      return { status: 'fail', message: 'Razorpay key not configured' };
    }

    // Check key format
    const keyPattern = /^rzp_(live|test)_[A-Za-z0-9]{14}$/;
    if (!keyPattern.test(razorpayKey)) {
      return { status: 'fail', message: 'Invalid Razorpay key format' };
    }

    // Check for secret key exposure (security issue)
    const secretKeyPattern = /^rzp_(live|test)_[A-Za-z0-9]{24}$/;
    if (secretKeyPattern.test(razorpayKey)) {
      return { 
        status: 'fail', 
        message: 'SECURITY RISK: Secret key detected in frontend - use only public key' 
      };
    }

    return { 
      status: 'pass', 
      message: 'Razorpay key format is valid and secure' 
    };
  },

  // Validate script loading
  async validateScriptLoading() {
    // Check if script element exists
    const scriptElement = document.querySelector('script[src*="checkout.razorpay.com"]');
    
    if (!scriptElement) {
      return { 
        status: 'fail', 
        message: 'Razorpay checkout script not found in DOM' 
      };
    }

    // Check if Razorpay object is available
    if (typeof window.Razorpay === 'undefined') {
      return { 
        status: 'fail', 
        message: 'Razorpay script loaded but object not available' 
      };
    }

    // Test script functionality
    try {
      const testOptions = {
        key: 'test_key',
        amount: 100,
        currency: 'INR',
        name: 'Test'
      };
      
      // This should not throw an error for basic validation
      new window.Razorpay(testOptions);
      
      return { 
        status: 'pass', 
        message: 'Razorpay script loaded and functional' 
      };
    } catch (error) {
      if (error.message.includes('Invalid key')) {
        return { 
          status: 'pass', 
          message: 'Razorpay script loaded (test key validation working)' 
        };
      }
      
      return { 
        status: 'warning', 
        message: `Razorpay script loaded but test failed: ${error.message}` 
      };
    }
  },

  // Validate account status (basic checks)
  async validateAccountStatus() {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      return { status: 'fail', message: 'Cannot validate account - no key configured' };
    }

    // Basic key format validation
    if (razorpayKey.length < 20) {
      return { status: 'fail', message: 'Razorpay key appears to be invalid (too short)' };
    }

    // Check if key follows expected patterns
    const isLiveKey = razorpayKey.startsWith('rzp_live_');
    const keyId = razorpayKey.split('_')[2];
    
    if (!keyId || keyId.length !== 14) {
      return { status: 'fail', message: 'Razorpay key ID format is invalid' };
    }

    return { 
      status: 'pass', 
      message: `${isLiveKey ? 'Live' : 'Test'} account key appears valid` 
    };
  },

  // Validate security setup
  validateSecuritySetup() {
    const issues = [];
    const warnings = [];

    // Check HTTPS in production
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Production site should use HTTPS for payment security');
    }

    // Check for secret key exposure
    const envVars = Object.keys(import.meta.env);
    const secretKeyVars = envVars.filter(key => 
      key.includes('SECRET') || key.includes('PRIVATE')
    );
    
    if (secretKeyVars.length > 0) {
      warnings.push('Environment variables with SECRET/PRIVATE detected - ensure they are not exposed');
    }

    // Check domain configuration
    if (window.location.hostname === 'localhost') {
      warnings.push('Development environment - ensure production domain is configured in Razorpay');
    }

    const status = issues.length > 0 ? 'fail' : warnings.length > 0 ? 'warning' : 'pass';
    const message = issues.length > 0 ? issues.join('; ') : 
                   warnings.length > 0 ? warnings.join('; ') : 
                   'Security setup appears correct';

    return { status, message };
  },

  // Validate production readiness
  validateProductionReadiness() {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const isProduction = window.location.hostname !== 'localhost' && 
                        !window.location.hostname.includes('dev');
    const isLiveKey = razorpayKey?.startsWith('rzp_live_');

    if (isProduction && !isLiveKey) {
      return { 
        status: 'fail', 
        message: 'Production environment should use live Razorpay key' 
      };
    }

    if (!isProduction && isLiveKey) {
      return { 
        status: 'warning', 
        message: 'Development environment using live key - consider test key for safety' 
      };
    }

    const checklist = [
      window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      !!razorpayKey,
      typeof window.Razorpay !== 'undefined'
    ];

    const readinessScore = checklist.filter(Boolean).length / checklist.length;

    if (readinessScore === 1) {
      return { status: 'pass', message: 'Production ready' };
    } else if (readinessScore >= 0.7) {
      return { status: 'warning', message: 'Mostly ready - minor issues to address' };
    } else {
      return { status: 'fail', message: 'Not ready for production' };
    }
  },

  // Identify issues from validation results
  identifyIssues(validation) {
    const issues = [];
    
    Object.entries(validation).forEach(([category, result]) => {
      if (result.status === 'fail') {
        issues.push(`${category}: ${result.message}`);
      }
    });

    return issues;
  },

  // Generate recommendations
  generateRecommendations(validation) {
    const recommendations = [];

    if (validation.environment.status === 'warning') {
      recommendations.push('Consider using appropriate key for your environment (test for dev, live for prod)');
    }

    if (validation.scriptLoading.status === 'fail') {
      recommendations.push('Ensure Razorpay script is properly loaded - check network connectivity and ad blockers');
    }

    if (validation.securitySetup.status === 'fail') {
      recommendations.push('Address security issues before going to production');
    }

    if (validation.productionReadiness.status === 'fail') {
      recommendations.push('Complete production setup checklist before launching');
    }

    return recommendations;
  }
};

export default razorpayConfigValidator;
