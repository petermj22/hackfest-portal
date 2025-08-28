import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/teamService';
import { eventService } from '../../services/eventService';
import Header from '../../components/ui/Header';
import StepIndicator from './components/StepIndicator';
import TeamNameStep from './components/TeamNameStep';
import TeamMembersStep from './components/TeamMembersStep';
import ProblemStatementStep from './components/ProblemStatementStep';
import RegistrationSuccess from './components/RegistrationSuccess';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const TeamRegistrationForm = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [formData, setFormData] = useState({
    teamName: '',
    description: '',
    eventId: null,
    problemStatementId: null,
    customProblemStatement: '',
    isCustomProblem: false,
    members: [
      { id: 1, name: userProfile?.full_name || '', phone: userProfile?.phone_number || '', isLeader: true }
    ]
  });

  const steps = [
    { id: 1, title: 'Team Name', component: TeamNameStep },
    { id: 2, title: 'Members', component: TeamMembersStep },
    { id: 3, title: 'Problem', component: ProblemStatementStep },
    { id: 4, title: 'Complete', component: RegistrationSuccess }
  ];

  // Load events and user data on mount
  useEffect(() => {
    const loadData = async () => {
      // Load active events
      const { data: eventsData } = await eventService?.getActiveEvents();
      setEvents(eventsData || []);

      // If user profile loaded, update form data
      if (userProfile) {
        setFormData(prev => ({
          ...prev,
          members: [
            {
              id: 1,
              name: userProfile?.full_name || '',
              phone: userProfile?.phone_number || '',
              isLeader: true
            }
          ]
        }));
      }
    };

    loadData();
  }, [userProfile]);

  // Load problem statements when event is selected
  useEffect(() => {
    const loadProblemStatements = async () => {
      if (formData?.eventId) {
        const { data } = await eventService?.getProblemStatements(formData?.eventId);
        setProblemStatements(data || []);
      }
    };

    loadProblemStatements();
  }, [formData?.eventId]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('hackfest_registration_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...draft }));
        setCurrentStep(draft?.currentStep || 1);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create team with Supabase
      const teamData = {
        name: formData?.teamName,
        description: formData?.description,
        event_id: formData?.eventId || null,
        problem_statement_id: formData?.isCustomProblem ? null : (formData?.problemStatementId || null),
        project_description: formData?.isCustomProblem ? formData?.customProblemStatement : null
      };

      console.log('Form data before submission:', formData);
      console.log('Team data being sent:', teamData);

      const { data: team, error } = await teamService?.createTeam(teamData);
      
      if (error) {
        throw new Error(error?.message || 'Failed to create team');
      }

      // Clear draft data on successful submission
      localStorage.removeItem('hackfest_registration_draft');
      
      // Move to success step
      setCurrentStep(4);
      
      // Store team data for success screen
      updateFormData({ teamId: team?.id, inviteCode: team?.invite_code });
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed: ' + error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage
    localStorage.setItem('hackfest_registration_draft', JSON.stringify({
      ...formData,
      currentStep,
      savedAt: new Date()?.toISOString()
    }));
    
    alert('Draft saved successfully!');
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentStep < 4 && (formData?.teamName || formData?.description)) {
        handleSaveDraft();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData, currentStep]);

  const getCurrentStepComponent = () => {
    const StepComponent = steps?.[currentStep - 1]?.component;
    if (!StepComponent) return null;

    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      events,
      problemStatements
    };

    if (currentStep === 3) {
      return (
        <StepComponent
          {...commonProps}
          onSubmit={handleSubmit}
        />
      );
    }

    if (currentStep === 4) {
      return <StepComponent formData={formData} />;
    }

    return <StepComponent {...commonProps} />;
  };

  // Redirect if not authenticated
  if (!user) {
    navigate('/authentication-screen');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={userProfile} notifications={3} />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center neon-glow">
                <Icon name="Users" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-orbitron font-bold text-foreground">
                  Team Registration
                </h1>
                <p className="text-muted-foreground font-inter">
                  HackFest 2024 • University Hackathon
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form Container */}
          <div className="max-w-4xl mx-auto">
            {currentStep < 4 && (
              <>
                {/* Step Indicator */}
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={3}
                  steps={steps?.slice(0, 3)}
                />

                {/* Save Draft Button */}
                <div className="flex justify-end mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveDraft}
                    iconName="Save"
                    iconPosition="left"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Save Draft
                  </Button>
                </div>
              </>
            )}

            {/* Step Content */}
            <div className="glass rounded-2xl p-6 md:p-8 border border-border shadow-cyber-lg">
              {isSubmitting ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
                    <Icon name="Loader2" size={32} className="text-primary-foreground animate-spin" />
                  </div>
                  <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
                    Submitting Registration...
                  </h3>
                  <p className="text-muted-foreground font-inter">
                    Please wait while we process your team registration
                  </p>
                </div>
              ) : (
                getCurrentStepComponent()
              )}
            </div>

            {/* Help Section */}
            {currentStep < 4 && (
              <div className="mt-8 text-center">
                <div className="glass rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Icon name="HelpCircle" size={16} className="text-muted-foreground" />
                    <span className="text-sm font-inter font-medium text-foreground">Need Help?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contact our support team at{' '}
                    <a href="mailto:support@hackfest.edu" className="text-primary hover:text-primary/80">
                      support@hackfest.edu
                    </a>
                    {' '}or call{' '}
                    <a href="tel:+911234567890" className="text-primary hover:text-primary/80">
                      +91 12345 67890
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(20)]?.map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamRegistrationForm;