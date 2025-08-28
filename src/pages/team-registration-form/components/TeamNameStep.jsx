import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TeamNameStep = ({ formData, updateFormData, onNext, onPrevious }) => {
  const [teamName, setTeamName] = useState(formData?.teamName || '');
  const [isChecking, setIsChecking] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [error, setError] = useState('');

  // Mock existing team names for validation
  const existingTeamNames = [
    'Code Warriors', 'Tech Titans', 'Digital Dynamos', 'Cyber Squad',
    'Innovation Hub', 'Binary Beasts', 'Algorithm Aces', 'Data Drivers'
  ];

  const checkTeamNameAvailability = async (name) => {
    if (!name?.trim()) {
      setValidationStatus(null);
      setError('');
      return;
    }

    setIsChecking(true);
    setError('');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isAvailable = !existingTeamNames?.some(
      existingName => existingName?.toLowerCase() === name?.toLowerCase()
    );
    
    if (isAvailable) {
      setValidationStatus('available');
    } else {
      setValidationStatus('taken');
      setError('This team name is already taken. Please choose another name.');
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (teamName?.length >= 3) {
        checkTeamNameAvailability(teamName);
      } else {
        setValidationStatus(null);
        setError('');
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [teamName]);

  const handleTeamNameChange = (e) => {
    const value = e?.target?.value;
    setTeamName(value);
    updateFormData({ teamName: value });
    
    if (value?.length < 3) {
      setValidationStatus(null);
      setError('Team name must be at least 3 characters long');
    }
  };

  const handleNext = () => {
    if (!teamName?.trim()) {
      setError('Please enter a team name');
      return;
    }
    
    if (teamName?.length < 3) {
      setError('Team name must be at least 3 characters long');
      return;
    }
    
    if (validationStatus !== 'available') {
      setError('Please choose an available team name');
      return;
    }
    
    onNext();
  };

  const getValidationIcon = () => {
    if (isChecking) return <Icon name="Loader2" size={20} className="animate-spin text-muted-foreground" />;
    if (validationStatus === 'available') return <Icon name="CheckCircle" size={20} className="text-success" />;
    if (validationStatus === 'taken') return <Icon name="XCircle" size={20} className="text-error" />;
    return null;
  };

  const getValidationMessage = () => {
    if (isChecking) return 'Checking availability...';
    if (validationStatus === 'available') return 'Team name is available!';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">
          Choose Your Team Name
        </h2>
        <p className="text-muted-foreground font-inter">
          Pick a unique name that represents your team's identity
        </p>
      </div>
      <div className="glass rounded-xl p-6 border border-border">
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Team Name"
              type="text"
              placeholder="Enter your team name"
              value={teamName}
              onChange={handleTeamNameChange}
              error={error}
              required
              className="pr-12"
            />
            <div className="absolute right-3 top-9">
              {getValidationIcon()}
            </div>
          </div>

          {validationStatus === 'available' && (
            <div className="flex items-center space-x-2 text-success">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm font-inter">{getValidationMessage()}</span>
            </div>
          )}

          {isChecking && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span className="text-sm font-inter">{getValidationMessage()}</span>
            </div>
          )}

          <div className="bg-muted/20 rounded-lg p-4 border border-border">
            <h3 className="font-inter font-medium text-foreground mb-2">Team Name Guidelines:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={14} className="text-success" />
                <span>Minimum 3 characters, maximum 50 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={14} className="text-success" />
                <span>Must be unique across all registered teams</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={14} className="text-success" />
                <span>Use letters, numbers, and spaces only</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={14} className="text-success" />
                <span>Keep it professional and appropriate</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
          disabled
        >
          Previous
        </Button>
        
        <Button
          variant="default"
          onClick={handleNext}
          iconName="ArrowRight"
          iconPosition="right"
          disabled={!teamName?.trim() || teamName?.length < 3 || validationStatus !== 'available' || isChecking}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default TeamNameStep;