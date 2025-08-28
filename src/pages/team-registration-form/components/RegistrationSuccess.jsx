import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { teamService } from '../../../services/teamService';
import { supabase } from '../../../lib/supabase';

const RegistrationSuccess = ({ formData }) => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const handleViewDashboard = () => {
    navigate('/team-dashboard');
  };

  const handleProceedToPayment = async () => {
    try {
      console.log('🔍 Preparing payment navigation with complete team data...');

      // Get complete team data from database before navigation
      if (!user) {
        alert('Please log in to continue');
        return;
      }

      // Fetch complete team data to ensure we have all required fields
      const { data: teams, error } = await teamService.getUserTeams(user.id);
      if (error) {
        console.error('Failed to fetch team data:', error);
        throw new Error(error.message);
      }

      if (!teams || teams.length === 0) {
        alert('Team data not found. Please complete registration first.');
        return;
      }

      const team = teams[0];
      console.log('📊 Complete team data from database:', team);

      // Prepare comprehensive team data for payment page
      const completeTeamData = {
        // Core team information
        teamName: team.name || formData?.teamName,
        teamId: team.id || formData?.teamId,
        eventId: team.event_id || formData?.eventId,
        inviteCode: team.invite_code || formData?.inviteCode,
        description: team.description || formData?.description,

        // Member information
        members: team.team_members || formData?.members || [],

        // Problem statement information
        problemStatementId: team.problem_statement_id || formData?.problemStatementId,
        isCustomProblem: !team.problem_statement_id || formData?.isCustomProblem,
        customProblemStatement: team.project_description || formData?.customProblemStatement,

        // Additional payment-required fields
        leaderName: userProfile?.full_name || user?.email?.split('@')[0] || 'Unknown',
        leaderEmail: user?.email || '',
        leaderPhone: userProfile?.phone_number || '',
        eventName: team.events?.name || 'HackFest 2024',
        problemStatement: team.problem_statements?.title || 'Custom Problem Statement',
        problemStatementDescription: team.problem_statements?.description || team.project_description || '',

        // Status and timestamps
        status: team.status || 'pending',
        registrationDate: team.created_at || new Date().toISOString(),

        // Technical details
        techStack: team.tech_stack || []
      };

      console.log('✅ Complete team data prepared for navigation:', completeTeamData);

      // Validate that we have the minimum required data
      if (!completeTeamData.teamId) {
        throw new Error('Team ID is missing');
      }

      if (!completeTeamData.eventId) {
        console.warn('⚠️ Event ID is missing - payment page will handle this');
      }

      // Navigate to payment with complete team data
      navigate('/payment-processing-screen', {
        state: {
          teamData: completeTeamData
        }
      });

    } catch (error) {
      console.error('Failed to prepare payment data:', error);
      alert(`Failed to prepare payment data: ${error.message}. Please try again.`);
    }
  };

  const calculateTotalFee = () => {
    const memberCount = formData?.members?.length || 0;
    return memberCount * 100;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
          <Icon name="CheckCircle" size={40} className="text-success-foreground" />
        </div>
        <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">
          Registration Successful!
        </h2>
        <p className="text-muted-foreground font-inter">
          Your team has been successfully registered for HackFest 2024
        </p>
      </div>
      {/* Registration Summary */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="font-inter font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="FileText" size={20} />
          <span>Registration Summary</span>
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-inter text-muted-foreground">Team Name:</span>
            <span className="font-inter font-medium text-foreground">{formData?.teamName}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-inter text-muted-foreground">Team Size:</span>
            <span className="font-inter font-medium text-foreground">{formData?.members?.length || 0} members</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-inter text-muted-foreground">Problem Statement:</span>
            <span className="font-inter font-medium text-foreground">
              {formData?.isCustomProblem ? 'Custom Problem' : 'Predefined Problem'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-inter text-muted-foreground">Registration Fee:</span>
            <span className="font-inter font-bold text-primary">₹{calculateTotalFee()?.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="font-inter text-muted-foreground">Status:</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
              <span className="font-inter font-medium text-warning">Pending Payment</span>
            </div>
          </div>
        </div>
      </div>
      {/* Next Steps */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="font-inter font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="ListTodo" size={20} />
          <span>Next Steps</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-orbitron font-bold text-primary-foreground">1</span>
            </div>
            <div>
              <p className="font-inter font-medium text-foreground">Complete Payment</p>
              <p className="text-sm text-muted-foreground">Pay the registration fee to confirm your team's participation</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-orbitron font-bold text-muted-foreground">2</span>
            </div>
            <div>
              <p className="font-inter font-medium text-foreground">Check Your Email</p>
              <p className="text-sm text-muted-foreground">You'll receive confirmation and further instructions via email</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-orbitron font-bold text-muted-foreground">3</span>
            </div>
            <div>
              <p className="font-inter font-medium text-foreground">Stay Updated</p>
              <p className="text-sm text-muted-foreground">Monitor the updates hub for event announcements and schedules</p>
            </div>
          </div>
        </div>
      </div>
      {/* Important Information */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-inter font-medium text-warning mb-1">Important Notice</h4>
            <p className="text-sm text-muted-foreground">
              Your registration will be confirmed only after successful payment. Please complete the payment within 24 hours to secure your team's spot in the hackathon.
            </p>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          variant="default"
          onClick={handleProceedToPayment}
          iconName="CreditCard"
          iconPosition="left"
          fullWidth
        >
          Proceed to Payment
        </Button>
        
        <Button
          variant="outline"
          onClick={handleViewDashboard}
          iconName="LayoutDashboard"
          iconPosition="left"
          fullWidth
        >
          View Dashboard
        </Button>
      </div>
      {/* Contact Information */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground font-inter mb-2">
          Need help? Contact our support team
        </p>
        <div className="flex justify-center space-x-4">
          <a href="mailto:support@hackfest.edu" className="text-primary hover:text-primary/80 text-sm font-inter">
            support@hackfest.edu
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="tel:+911234567890" className="text-primary hover:text-primary/80 text-sm font-inter">
            +91 12345 67890
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;