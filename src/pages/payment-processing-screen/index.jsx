import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/teamService';
import { paymentService } from '../../services/paymentService';
import { cashfreeService } from '../../services/cashfreeService';
import { quickDiagnostic } from '../../utils/quickPaymentDiagnostic';
import paymentFailureAnalyzer from '../../utils/paymentFailureAnalyzer';
import paymentDebugger from '../../utils/paymentDebugger';
import teamDataDebugger from '../../utils/teamDataDebugger';
import eventAssociationFixer from '../../utils/eventAssociationFixer';
import Header from '../../components/ui/Header';
import PaymentSummaryCard from './components/PaymentSummaryCard';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import PaymentStatusModal from './components/PaymentStatusModal';
import PaymentLoadingSpinner from './components/PaymentLoadingSpinner';
import PaymentSecurityBadges from './components/PaymentSecurityBadges';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PaymentProcessingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();

  // State for team data
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get team data from navigation state or fetch from service
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading team data...');

        // First try to get team data from navigation state
        if (location?.state?.teamData) {
          console.log('📍 Using team data from navigation state');
          const navTeamData = location.state.teamData;
          console.log('📊 Navigation team data:', navTeamData);

          // Enhanced validation - check if we have minimum required data
          const hasMinimumData = navTeamData.teamId && (
            navTeamData.eventId ||
            navTeamData.teamName  // Can work with just team name if we enhance data
          );

          if (hasMinimumData) {
            // If eventId is missing, enhance the data with database lookup
            if (!navTeamData.eventId) {
              console.log('⚠️ Event ID missing from navigation data, enhancing with database lookup...');
              try {
                const enhancedData = await enhanceNavigationData(navTeamData);
                console.log('✅ Enhanced navigation data:', enhancedData);
                setTeamData(enhancedData);
                setLoading(false);
                return;
              } catch (error) {
                console.error('❌ Failed to enhance navigation data:', error);
                console.log('🔄 Falling back to full database fetch...');
              }
            } else {
              console.log('✅ Navigation team data is complete');
              setTeamData(navTeamData);
              setLoading(false);
              return;
            }
          } else {
            console.warn('⚠️ Navigation team data insufficient:', {
              hasTeamId: !!navTeamData.teamId,
              hasEventId: !!navTeamData.eventId,
              hasTeamName: !!navTeamData.teamName,
              teamId: navTeamData.teamId,
              eventId: navTeamData.eventId
            });
            console.log('🔄 Fetching complete data from database...');
          }
        }

        // Fetch from database with enhanced error handling
        if (!user?.id) {
          console.error('❌ User not authenticated');
          setError('Please log in to continue');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching team data for user:', user.id);

        const { data: teams, error: teamsError } = await teamService?.getUserTeams(user.id);

        if (teamsError) {
          console.error('❌ Database error fetching teams:', teamsError);
          setError(`Failed to load team data: ${teamsError.message}`);
          setLoading(false);
          return;
        }

        console.log('📊 Fetched teams from database:', teams);

        if (!teams || teams.length === 0) {
          console.error('❌ No teams found for user');
          setError('No team found. Please register a team first.');
          setLoading(false);
          return;
        }

        // Use the most recent team or first team
        const activeTeam = teams[0];
        console.log('📊 Raw team data from database:', activeTeam);

        // Enhanced data transformation with validation
        const transformedTeamData = {
          teamName: activeTeam.name || 'Unnamed Team',
          leaderName: userProfile?.full_name || user?.email?.split('@')[0] || 'Unknown',
          leaderEmail: user?.email || '',
          leaderPhone: userProfile?.phone_number || '',
          problemStatement: activeTeam.problem_statements?.title || 'Custom Problem Statement',
          problemStatementDescription: activeTeam.problem_statements?.description || activeTeam.project_description || '',
          eventName: activeTeam.events?.name || 'HackFest 2024',
          eventId: activeTeam.event_id || null,
          members: activeTeam.team_members || [],
          teamId: activeTeam.id || null,
          status: activeTeam.status || 'pending',
          description: activeTeam.description || '',
          techStack: activeTeam.tech_stack || [],
          inviteCode: activeTeam.invite_code || ''
        };

        console.log('✅ Transformed team data:', transformedTeamData);

        // Validate critical fields before setting
        if (!transformedTeamData.teamId) {
          console.error('❌ Team ID is missing from database record:', activeTeam);
          setError('Team ID is missing from database record. Please contact support.');
          setLoading(false);
          return;
        }

        if (!transformedTeamData.eventId) {
          console.error('❌ Event ID is missing from team record:', activeTeam);
          setError('Event ID is missing from team record. Please associate your team with an event.');
          setLoading(false);
          return;
        }

        console.log('✅ Team data validation passed, setting team data');
        setTeamData(transformedTeamData);

        setLoading(false);
      } catch (err) {
        console.error('Error loading team data:', err);
        setError('Failed to load team data');
        setLoading(false);
      }
    };

    loadTeamData();
  }, [user?.id, userProfile, location?.state?.teamData]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const memberCount = teamData?.members?.length || 1; // At least 1 for team leader
  const feePerMember = 100; // ₹100 per member
  const totalAmount = memberCount * feePerMember;

  // Function to enhance incomplete navigation data with database lookup
  const enhanceNavigationData = async (navTeamData) => {
    try {
      console.log('🔧 Enhancing navigation data with database lookup...');

      if (!navTeamData.teamId) {
        throw new Error('Team ID required for enhancement');
      }

      // Fetch complete team data from database
      const { data: team, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(*),
          events(id, name, status),
          problem_statements(id, title, description)
        `)
        .eq('id', navTeamData.teamId)
        .single();

      if (error || !team) {
        throw new Error(`Failed to fetch team data: ${error?.message || 'Team not found'}`);
      }

      console.log('📊 Database team data for enhancement:', team);

      // Merge navigation data with database data, prioritizing database values for critical fields
      const enhancedData = {
        ...navTeamData,
        // Critical fields from database
        eventId: team.event_id || navTeamData.eventId,
        eventName: team.events?.name || navTeamData.eventName || 'HackFest 2024',
        members: team.team_members || navTeamData.members || [],
        status: team.status || navTeamData.status || 'pending',

        // Problem statement information
        problemStatement: team.problem_statements?.title || navTeamData.problemStatement || 'Custom Problem Statement',
        problemStatementDescription: team.problem_statements?.description || team.project_description || navTeamData.customProblemStatement || '',

        // Additional fields that might be missing
        description: team.description || navTeamData.description || '',
        techStack: team.tech_stack || navTeamData.techStack || [],
        inviteCode: team.invite_code || navTeamData.inviteCode || '',

        // Ensure we have leader information
        leaderName: navTeamData.leaderName || userProfile?.full_name || user?.email?.split('@')[0] || 'Unknown',
        leaderEmail: navTeamData.leaderEmail || user?.email || '',
        leaderPhone: navTeamData.leaderPhone || userProfile?.phone_number || ''
      };

      console.log('✅ Enhanced navigation data:', enhancedData);
      return enhancedData;

    } catch (error) {
      console.error('❌ Failed to enhance navigation data:', error);
      throw error;
    }
  };

  // Initialize Cashfree on component mount
  useEffect(() => {
    cashfreeService.initializeCashfree();

    // Make diagnostic available globally for console access
    window.quickPaymentDiagnostic = quickDiagnostic;
    window.teamDataDebugger = teamDataDebugger;
    window.eventAssociationFixer = eventAssociationFixer;
    window.enhanceNavigationData = enhanceNavigationData;

    // Navigation data debugger
    window.checkNavigationData = () => {
      const navData = location?.state?.teamData;
      if (!navData) {
        console.log('❌ No navigation data found');
        return null;
      }

      console.log('📊 Navigation Data Analysis:');
      console.log('Team ID:', navData.teamId ? '✅' : '❌', navData.teamId);
      console.log('Event ID:', navData.eventId ? '✅' : '❌', navData.eventId);
      console.log('Team Name:', navData.teamName ? '✅' : '❌', navData.teamName);
      console.log('Members:', navData.members?.length > 0 ? `✅ (${navData.members.length})` : '❌');
      console.log('Leader Name:', navData.leaderName ? '✅' : '❌', navData.leaderName);
      console.log('Leader Email:', navData.leaderEmail ? '✅' : '❌', navData.leaderEmail);

      const completeness = [
        !!navData.teamId,
        !!navData.eventId,
        !!navData.teamName,
        !!navData.members?.length,
        !!navData.leaderName,
        !!navData.leaderEmail
      ].filter(Boolean).length;

      console.log(`Completeness: ${completeness}/6 (${(completeness/6*100).toFixed(0)}%)`);

      return navData;
    };

    console.log('💡 Payment page loaded. Available diagnostics:');
    console.log('   - quickPaymentDiagnostic() - Quick system check');
    console.log('   - teamDataDebugger.verifyTeamRegistration() - Team data verification');
    console.log('   - eventAssociationFixer.autoFixEventAssociation() - Fix missing event association');
    console.log('   - checkNavigationData() - Check navigation state data');
    console.log('   - enhanceNavigationData(navData) - Enhance incomplete navigation data');

    // Error boundary for external script interference
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      // Filter out content-link.js and other external script errors
      if (!errorMessage.includes('content-link.js') &&
          !errorMessage.includes('background') &&
          !errorMessage.includes('rocket-web.js')) {
        originalConsoleError.apply(console, args);
      }
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPaymentMethod || !teamData) {
      console.error('❌ Missing payment method or team data');
      handlePaymentFailure('Please select a payment method and ensure team data is loaded');
      return;
    }

    console.log('🚀 Starting payment process...');
    console.log('Team Data:', teamData);
    console.log('Selected Method:', selectedPaymentMethod);
    console.log('Total Amount:', totalAmount);

    setIsProcessing(true);

    try {
      // Enhanced team data validation with detailed error reporting
      console.log('🔍 Validating team data for payment:', teamData);

      if (!teamData) {
        console.error('❌ Team data is null or undefined');
        const errorDetails = {
          originalError: 'Team data not loaded',
          step: 'team_data_validation',
          teamDataState: teamData
        };
        handlePaymentFailure('Team data not loaded. Please refresh the page and try again.', errorDetails);
        return;
      }

      if (!teamData.teamId) {
        console.error('❌ Team ID missing:', teamData.teamId);
        console.error('❌ Available team data keys:', Object.keys(teamData));
        const errorDetails = {
          originalError: 'Team ID missing',
          step: 'team_id_validation',
          teamData: teamData,
          availableKeys: Object.keys(teamData)
        };
        handlePaymentFailure('Team ID is missing. Please complete team registration first.', errorDetails);
        return;
      }

      if (!teamData.eventId) {
        console.error('❌ Event ID missing:', teamData.eventId);
        console.error('❌ Available team data keys:', Object.keys(teamData));
        const errorDetails = {
          originalError: 'Event ID missing',
          step: 'event_id_validation',
          teamData: teamData,
          availableKeys: Object.keys(teamData)
        };
        handlePaymentFailure('Event ID is missing. Please associate your team with an event.', errorDetails);
        return;
      }

      // Additional validation for data types
      if (typeof teamData.teamId !== 'string' || teamData.teamId.length === 0) {
        console.error('❌ Invalid team ID format:', teamData.teamId, 'type:', typeof teamData.teamId);
        const errorDetails = {
          originalError: 'Invalid team ID format',
          step: 'team_id_format_validation',
          teamId: teamData.teamId,
          teamIdType: typeof teamData.teamId
        };
        handlePaymentFailure('Team ID format is invalid. Please re-register your team.', errorDetails);
        return;
      }

      if (typeof teamData.eventId !== 'string' || teamData.eventId.length === 0) {
        console.error('❌ Invalid event ID format:', teamData.eventId, 'type:', typeof teamData.eventId);
        const errorDetails = {
          originalError: 'Invalid event ID format',
          step: 'event_id_format_validation',
          eventId: teamData.eventId,
          eventIdType: typeof teamData.eventId
        };
        handlePaymentFailure('Event ID format is invalid. Please select a valid event.', errorDetails);
        return;
      }

      console.log('✅ Team data validation passed:', {
        teamId: teamData.teamId,
        eventId: teamData.eventId,
        teamName: teamData.teamName
      });

      // Create Razorpay order
      const orderData = {
        teamId: teamData.teamId,
        eventId: teamData.eventId,
        amount: totalAmount,
        currency: 'INR'
      };

      console.log('📝 Creating order with data:', orderData);

      const { order, payment, error: orderError } = await cashfreeService.createOrder(orderData);

      if (orderError) {
        console.error('❌ Order creation failed:', orderError);

        // Provide specific error messages based on error type
        let errorMessage = 'Failed to create payment order';
        const errorDetails = {
          originalError: orderError,
          step: 'order_creation',
          teamData: teamData,
          orderData: orderData
        };

        if (orderError.message?.includes('not authenticated')) {
          errorMessage = 'Please log in to continue with payment';
          errorDetails.category = 'authentication';
        } else if (orderError.message?.includes('foreign key')) {
          errorMessage = 'Team or event data is invalid. Please complete team registration first.';
          errorDetails.category = 'team_data';
        } else if (orderError.code === '23503') {
          errorMessage = 'Database constraint error. Please ensure your team is properly registered.';
          errorDetails.category = 'database_constraint';
        } else if (orderError.message?.includes('Missing required')) {
          errorMessage = 'Required payment information is missing. Please check your team registration.';
          errorDetails.category = 'validation';
        }

        handlePaymentFailure(errorMessage, errorDetails);
        return;
      }

      console.log('✅ Order created successfully:', order.id);

      // Cashfree payment configuration
      const cashfreeAppId = import.meta.env.VITE_CASHFREE_APP_ID;
      const cashfreeEnv = import.meta.env.VITE_CASHFREE_ENV || 'TEST';

      if (!cashfreeAppId) {
        console.error('❌ VITE_CASHFREE_APP_ID not found in environment');
        handlePaymentFailure('Cashfree configuration error');
        return;
      }

      console.log('✅ Using Cashfree App ID:', cashfreeAppId.substring(0, 8) + '...');
      console.log('✅ Cashfree Environment:', cashfreeEnv);

      // Create payment session for Cashfree
      const { session, error: sessionError } = await cashfreeService.createPaymentSession({
        order_id: order.order_id,
        customer_details: {
          customer_id: teamData?.userId || 'guest',
          customer_name: teamData?.leaderName || 'HackFest Participant',
          customer_email: teamData?.leaderEmail || 'participant@hackfest.com',
          customer_phone: teamData?.leaderPhone || '9999999999'
        }
      });

      if (sessionError) {
        console.error('❌ Payment session creation failed:', sessionError);
        handlePaymentFailure('Failed to create payment session');
        return;
      }

      const paymentOptions = {
        payment_session_id: session.payment_session_id,
        return_url: `${window.location.origin}/payment-success?order_id=${order.order_id}`
      };

      console.log('💳 Cashfree payment options:', paymentOptions);

      // Process payment through Cashfree
      console.log('🚀 Processing payment through Cashfree...');
      const paymentResult = await cashfreeService.processPayment(paymentOptions);

      console.log('💳 Payment result:', paymentResult);

      if (paymentResult.success) {
        console.log('✅ Payment successful, verifying...');

        // Verify payment and update database
        const verificationResult = await cashfreeService.verifyPayment({
          paymentId: paymentResult.paymentId,
          orderId: paymentResult.orderId,
          signature: paymentResult.signature
        });

        console.log('🔍 Verification result:', verificationResult);

        if (verificationResult.error) {
          console.error('❌ Payment verification failed:', verificationResult.error);
          const errorDetails = {
            originalError: verificationResult.error,
            step: 'payment_verification',
            paymentData: {
              paymentId: paymentResult.paymentId,
              orderId: paymentResult.orderId,
              signature: paymentResult.signature
            }
          };
          handlePaymentFailure('Payment verification failed: ' + verificationResult.error.message, errorDetails);
        } else {
          console.log('✅ Payment verified successfully');
          handlePaymentSuccess({
            razorpay_payment_id: paymentResult.paymentId,
            razorpay_order_id: paymentResult.orderId,
            razorpay_signature: paymentResult.signature,
            payment_record: verificationResult.data
          });
        }
      } else {
        console.error('❌ Payment failed:', paymentResult.error);
        const errorDetails = {
          originalError: paymentResult.error,
          step: 'payment_processing',
          razorpayOptions: { ...options, key: options.key.substring(0, 12) + '...' }
        };
        handlePaymentFailure(paymentResult.error || 'Payment failed', errorDetails);
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error);

      const errorDetails = {
        originalError: error,
        step: 'payment_processing_wrapper',
        stack: error.stack,
        teamData: teamData,
        selectedMethod: selectedPaymentMethod,
        totalAmount: totalAmount
      };

      let errorMessage = 'An unexpected error occurred during payment processing';

      // Categorize the error
      if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
        errorMessage = 'Network error occurred. Please check your internet connection and try again.';
        errorDetails.category = 'network';
      } else if (error.message?.includes('Razorpay')) {
        errorMessage = 'Razorpay service error. Please try again or contact support.';
        errorDetails.category = 'razorpay';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error. Please log in again and try.';
        errorDetails.category = 'authentication';
      }

      handlePaymentFailure(errorMessage, errorDetails);
    }
  };

  const handlePaymentSuccess = async (response) => {
    setIsProcessing(false);
    setTransactionId(response?.paymentId || response?.cf_payment_id);
    setReceiptUrl(`/receipts/${response?.paymentId || response?.cf_payment_id}.pdf`);
    setPaymentStatus('success');
    setShowStatusModal(true);

    // Send confirmation email
    await sendConfirmationEmail(response);

    // Update team status to indicate payment completed
    if (teamData?.teamId) {
      try {
        await teamService.updateTeam(teamData.teamId, {
          status: 'approved',
          payment_status: 'paid'
        });
      } catch (error) {
        console.error('Failed to update team status:', error);
      }
    }
  };

  const handlePaymentFailure = async (errorMessage = 'Payment failed', errorDetails = {}) => {
    setIsProcessing(false);
    setPaymentStatus('failed');
    setShowStatusModal(true);

    console.error('❌ Payment failed:', errorMessage);
    console.error('❌ Error details:', errorDetails);

    // Generate comprehensive failure report
    try {
      const failureReport = await paymentFailureAnalyzer.generateFailureReport({
        message: errorMessage,
        ...errorDetails
      });

      console.log('📋 Failure report generated - check console for detailed analysis');

      // Store failure report for debugging
      window.lastPaymentFailureReport = failureReport;
      console.log('💡 Access detailed report with: window.lastPaymentFailureReport');

    } catch (reportError) {
      console.error('Failed to generate failure report:', reportError);
    }
  };

  const sendConfirmationEmail = async (paymentResponse) => {
    try {
      const emailData = {
        email: teamData?.leaderEmail,
        teamName: teamData?.teamName,
        amount: totalAmount,
        transactionId: paymentResponse?.razorpay_payment_id
      };

      const result = await razorpayService.sendPaymentConfirmation(emailData);

      if (result.success) {
        console.log('✅ Confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send confirmation email:', result.error);
      }
    } catch (error) {
      console.error('❌ Email sending error:', error);
    }
  };

  const handleRetryPayment = () => {
    setShowStatusModal(false);
    setPaymentStatus('');
    setTransactionId('');
    setReceiptUrl('');
  };

  const handleGoToDashboard = () => {
    navigate('/team-dashboard', { 
      state: { 
        teamData: {
          ...teamData,
          paymentStatus: 'completed',
          transactionId,
          registrationDate: new Date()?.toISOString()
        }
      }
    });
  };

  const handleBackToRegistration = () => {
    navigate('/team-registration-form', { state: { teamData } });
  };

  const runQuickDiagnostic = async () => {
    console.log('\n🔧 RUNNING COMPREHENSIVE PAYMENT DIAGNOSTIC...\n');

    try {
      // Run quick diagnostic first
      const quickResults = quickDiagnostic();

      // Run comprehensive diagnostic
      const fullDiagnostics = await paymentDebugger.runFullDiagnostics();

      // Run component tests
      const componentTests = await paymentFailureAnalyzer.testPaymentComponents();

      // Analyze results
      const issues = [];
      const warnings = [];

      if (!quickResults.razorpayKey) issues.push('Razorpay key missing');
      if (!quickResults.razorpayScript) issues.push('Razorpay script not loaded');
      if (!quickResults.razorpayObject) warnings.push('Razorpay object not available');
      if (!quickResults.online) issues.push('No internet connection');
      if (!quickResults.supabase) issues.push('Supabase not connected');

      if (componentTests.authentication.status === 'fail') issues.push('Authentication failed');
      if (componentTests.teamData.status === 'fail') issues.push('No team registered');
      if (componentTests.database.status === 'fail') issues.push('Database connection failed');

      // Generate user-friendly summary
      let message = '🔧 DIAGNOSTIC RESULTS:\n\n';

      if (issues.length === 0 && warnings.length === 0) {
        message += '✅ All systems appear to be working correctly!\n\n';
        message += 'If payment still fails, the issue may be:\n';
        message += '• Razorpay account configuration\n';
        message += '• Network connectivity during payment\n';
        message += '• Browser compatibility issues\n\n';
        message += 'Check browser console for detailed diagnostic logs.';
      } else {
        if (issues.length > 0) {
          message += `❌ CRITICAL ISSUES (${issues.length}):\n`;
          issues.forEach(issue => message += `• ${issue}\n`);
          message += '\n';
        }

        if (warnings.length > 0) {
          message += `⚠️ WARNINGS (${warnings.length}):\n`;
          warnings.forEach(warning => message += `• ${warning}\n`);
          message += '\n';
        }

        message += 'Check browser console for detailed diagnostic results and solutions.';
      }

      alert(message);

      // Store results for debugging
      window.lastDiagnosticResults = {
        quick: quickResults,
        full: fullDiagnostics,
        components: componentTests,
        timestamp: new Date().toISOString()
      };

      console.log('💡 Access full diagnostic results with: window.lastDiagnosticResults');

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      alert('❌ Diagnostic failed. Check browser console for error details.');
    }
  };



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          user={userProfile}
          notifications={0}
          onNavigate={(path) => navigate(path)}
        />
        <div className="flex items-center justify-center min-h-screen">
          <PaymentLoadingSpinner />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          user={userProfile}
          notifications={0}
          onNavigate={(path) => navigate(path)}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertCircle" size={32} className="text-destructive-foreground" />
            </div>
            <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
              {error}
            </h3>
            <Button
              variant="outline"
              onClick={() => navigate('/team-registration-form')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Go to Team Registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={userProfile}
        notifications={0}
        onNavigate={(path) => navigate(path)}
      />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center neon-glow">
                <Icon name="CreditCard" size={24} className="text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-foreground">
                Payment Processing
              </h1>
            </div>
            <p className="text-muted-foreground font-inter max-w-2xl mx-auto">
              Complete your team registration by processing the payment securely through our trusted payment gateway.
            </p>
          </div>

          {/* Payment Content */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Column - Payment Summary */}
            <div className="space-y-6">
              <PaymentSummaryCard
                teamData={teamData}
                totalAmount={totalAmount}
                memberCount={memberCount}
              />
              
              {/* Back to Registration Button */}
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleBackToRegistration}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Registration
              </Button>

              {/* Diagnostic Button */}
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={runQuickDiagnostic}
                iconName="Settings"
                iconPosition="left"
              >
                🔧 Run Payment Diagnostic
              </Button>

              {/* Quick Fix Button */}
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  console.log('🔧 QUICK PAYMENT FIXES:');
                  console.log('1. Ensure you are logged in');
                  console.log('2. Complete your user profile');
                  console.log('3. Register a team first');
                  console.log('4. Check internet connection');
                  console.log('5. Disable ad blockers');
                  console.log('6. Try incognito mode');
                  alert('🔧 Quick fixes logged to console!\n\nMost common issues:\n1. Not logged in\n2. No team registered\n3. Incomplete user profile\n4. Ad blockers blocking Razorpay\n\nCheck console for detailed steps.');
                }}
                iconName="Zap"
                iconPosition="left"
              >
                ⚡ Quick Fixes
              </Button>

              {/* Cashfree Config Validator */}
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={async () => {
                  console.log('\n🔍 VALIDATING CASHFREE CONFIGURATION...\n');
                  try {
                    const appId = import.meta.env.VITE_CASHFREE_APP_ID;
                    const env = import.meta.env.VITE_CASHFREE_ENV;

                    console.log('Cashfree App ID:', appId ? appId.substring(0, 8) + '...' : 'Not configured');
                    console.log('Cashfree Environment:', env || 'Not configured');

                    const sdkLoaded = await cashfreeService.initializeCashfree();
                    console.log('Cashfree SDK loaded:', sdkLoaded);

                    if (!appId) {
                      alert('❌ Cashfree App ID not configured!\n\nPlease set VITE_CASHFREE_APP_ID in environment variables.');
                    } else if (!sdkLoaded) {
                      alert('❌ Cashfree SDK failed to load!\n\nCheck network connection and try again.');
                    } else {
                      alert('✅ Cashfree configuration looks good!\n\nCheck console for detailed validation results.');
                    }
                  } catch (error) {
                    console.error('Validation failed:', error);
                    alert('❌ Configuration validation failed. Check console for details.');
                  }
                }}
                iconName="Shield"
                iconPosition="left"
              >
                🔒 Validate Cashfree Config
              </Button>

              {/* Team Data Verifier */}
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={async () => {
                  console.log('\n🔍 VERIFYING TEAM REGISTRATION DATA...\n');
                  try {
                    const verification = await teamDataDebugger.verifyTeamRegistration();

                    const criticalIssues = Object.values(verification)
                      .filter(result => result.status === 'fail')
                      .map(result => result.message);

                    if (criticalIssues.length === 0) {
                      alert('✅ Team registration data looks good!\n\nCheck console for detailed verification results.\n\nIf payments still fail, try the comprehensive diagnostic.');
                    } else {
                      alert(`❌ Team registration issues found:\n\n${criticalIssues.slice(0, 3).join('\n')}\n\nCheck console for detailed verification and recommendations.`);
                    }
                  } catch (error) {
                    console.error('Team verification failed:', error);
                    alert('❌ Team verification failed. Check console for details.');
                  }
                }}
                iconName="Users"
                iconPosition="left"
              >
                👥 Verify Team Data
              </Button>

              {/* Event Association Fixer */}
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={async () => {
                  console.log('\n🔧 FIXING EVENT ASSOCIATION...\n');
                  try {
                    // First diagnose the issue
                    const diagnosis = await eventAssociationFixer.diagnoseEventAssociation();

                    if (!diagnosis.success) {
                      alert(`❌ Cannot diagnose event association:\n\n${diagnosis.error}\n\nCheck console for details.`);
                      return;
                    }

                    // If team already has event, just verify
                    if (diagnosis.diagnosis.team.hasEventId) {
                      alert(`✅ Team already associated with event!\n\nEvent: ${diagnosis.diagnosis.team.associatedEvent?.name || 'Unknown'}\n\nTry payment again.`);
                      return;
                    }

                    // Attempt auto-fix
                    const fixResult = await eventAssociationFixer.autoFixEventAssociation();

                    if (fixResult.success) {
                      alert(`✅ SUCCESS! Team associated with event!\n\nEvent: ${fixResult.eventName}\n\nPlease refresh the page and try payment again.`);

                      // Refresh the page to reload team data
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    } else {
                      alert(`❌ Auto-fix failed:\n\n${fixResult.error}\n\nCheck console for manual fix instructions.`);

                      // Provide manual fix instructions
                      console.log('\n🔧 MANUAL FIX INSTRUCTIONS:');
                      console.log('1. Run: eventAssociationFixer.getAvailableEvents()');
                      console.log('2. Choose an event ID from the list');
                      console.log('3. Run: eventAssociationFixer.associateTeamWithEvent("EVENT_ID")');
                    }
                  } catch (error) {
                    console.error('Event association fix failed:', error);
                    alert('❌ Event association fix failed. Check console for details.');
                  }
                }}
                iconName="Calendar"
                iconPosition="left"
              >
                🎪 Fix Event Association
              </Button>

              {/* Navigation Data Fixer */}
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={async () => {
                  console.log('\n🔧 CHECKING NAVIGATION DATA...\n');
                  try {
                    const navData = window.checkNavigationData();

                    if (!navData) {
                      alert('❌ No navigation data found.\n\nThis usually means you navigated directly to the payment page.\n\nPlease go through team registration first.');
                      return;
                    }

                    // Check if navigation data is incomplete
                    const hasTeamId = !!navData.teamId;
                    const hasEventId = !!navData.eventId;

                    if (hasTeamId && hasEventId) {
                      alert('✅ Navigation data looks complete!\n\nIf you\'re still having issues, try the other diagnostic tools.');
                      return;
                    }

                    // Attempt to enhance the data
                    if (hasTeamId && !hasEventId) {
                      console.log('🔧 Attempting to enhance navigation data...');

                      const enhanced = await enhanceNavigationData(navData);

                      if (enhanced.eventId) {
                        alert(`✅ Navigation data enhanced!\n\nEvent ID found: ${enhanced.eventId}\nEvent Name: ${enhanced.eventName}\n\nRefreshing page to apply changes...`);

                        // Update the current team data
                        setTeamData(enhanced);

                        setTimeout(() => {
                          window.location.reload();
                        }, 2000);
                      } else {
                        alert('❌ Could not enhance navigation data.\n\nEvent association may be missing from your team.\n\nTry the "Fix Event Association" button.');
                      }
                    } else {
                      alert('❌ Navigation data is missing critical information.\n\nPlease complete team registration first.');
                    }
                  } catch (error) {
                    console.error('Navigation data fix failed:', error);
                    alert(`❌ Navigation data fix failed:\n\n${error.message}\n\nCheck console for details.`);
                  }
                }}
                iconName="Navigation"
                iconPosition="left"
              >
                🧭 Fix Navigation Data
              </Button>
            </div>

            {/* Right Column - Payment Methods */}
            <div className="space-y-6">
              <PaymentMethodSelector
                onMethodSelect={handlePaymentMethodSelect}
                selectedMethod={selectedPaymentMethod}
                onProceed={handleProceedToPayment}
                isProcessing={isProcessing}
              />
              
              <PaymentSecurityBadges />
            </div>
          </div>

          {/* Mobile Payment Summary (visible only on mobile) */}
          <div className="lg:hidden mt-8">
            <div className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-inter text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-orbitron font-bold text-primary">
                    ₹{totalAmount?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-inter text-muted-foreground">Team Members</p>
                  <p className="text-lg font-inter font-semibold text-foreground">
                    {memberCount} members
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Payment Loading Spinner */}
      <PaymentLoadingSpinner
        isVisible={isProcessing}
        message="Processing your payment securely..."
      />
      {/* Payment Status Modal */}
      <PaymentStatusModal
        isOpen={showStatusModal}
        status={paymentStatus}
        transactionId={transactionId}
        receiptUrl={receiptUrl}
        onClose={() => setShowStatusModal(false)}
        onRetry={handleRetryPayment}
        onGoToDashboard={handleGoToDashboard}
      />
    </div>
  );
};

export default PaymentProcessingScreen;