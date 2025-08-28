import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const TeamMembersStep = ({ formData, updateFormData, onNext, onPrevious }) => {
  const [members, setMembers] = useState(formData?.members || [
    { id: 1, name: '', phone: '', gender: '', isLeader: true }
  ]);
  const [errors, setErrors] = useState({});

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex?.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check minimum members
    if (members?.length < 4) {
      newErrors.general = 'Team must have at least 4 members';
      isValid = false;
    }

    // Check maximum members
    if (members?.length > 6) {
      newErrors.general = 'Team cannot have more than 6 members';
      isValid = false;
    }

    // Check for at least one female member
    const hasFemale = members?.some(member => member?.gender === 'female');
    if (!hasFemale) {
      newErrors.gender = 'Team must have at least one female member';
      isValid = false;
    }

    // Validate each member
    members?.forEach((member, index) => {
      if (!member?.name?.trim()) {
        newErrors[`member_${index}_name`] = 'Name is required';
        isValid = false;
      }

      if (!member?.phone?.trim()) {
        newErrors[`member_${index}_phone`] = 'Phone number is required';
        isValid = false;
      } else if (!validatePhoneNumber(member?.phone)) {
        newErrors[`member_${index}_phone`] = 'Enter valid 10-digit phone number';
        isValid = false;
      }

      if (!member?.gender) {
        newErrors[`member_${index}_gender`] = 'Gender is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const addMember = () => {
    if (members?.length < 6) {
      const newMember = {
        id: Date.now(),
        name: '',
        phone: '',
        gender: '',
        isLeader: false
      };
      setMembers([...members, newMember]);
    }
  };

  const removeMember = (id) => {
    if (members?.length > 4) {
      setMembers(members?.filter(member => member?.id !== id));
    }
  };

  const updateMember = (id, field, value) => {
    setMembers(members?.map(member => 
      member?.id === id ? { ...member, [field]: value } : member
    ));
    
    // Clear specific field error
    const errorKey = `member_${members?.findIndex(m => m?.id === id)}_${field}`;
    if (errors?.[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[errorKey];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    updateFormData({ members });
  }, [members, updateFormData]);

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const getFemaleCount = () => {
    return members?.filter(member => member?.gender === 'female')?.length;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">
          Add Team Members
        </h2>
        <p className="text-muted-foreground font-inter">
          Add 4-6 team members with at least one female member
        </p>
      </div>
      {/* Team Requirements */}
      <div className="glass rounded-xl p-4 border border-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              members?.length >= 4 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Icon name={members?.length >= 4 ? 'Check' : 'Users'} size={16} />
            </div>
            <div>
              <p className="text-sm font-inter font-medium text-foreground">
                Team Size: {members?.length}/6
              </p>
              <p className="text-xs text-muted-foreground">Minimum 4 required</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              getFemaleCount() >= 1 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Icon name={getFemaleCount() >= 1 ? 'Check' : 'UserCheck'} size={16} />
            </div>
            <div>
              <p className="text-sm font-inter font-medium text-foreground">
                Female Members: {getFemaleCount()}
              </p>
              <p className="text-xs text-muted-foreground">Minimum 1 required</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
              <Icon name="Crown" size={16} />
            </div>
            <div>
              <p className="text-sm font-inter font-medium text-foreground">Team Leader</p>
              <p className="text-xs text-muted-foreground">You are the leader</p>
            </div>
          </div>
        </div>
      </div>
      {/* Error Messages */}
      {(errors?.general || errors?.gender) && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-error">
            <Icon name="AlertCircle" size={16} />
            <span className="font-inter font-medium">Validation Errors:</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-error">
            {errors?.general && <li>• {errors?.general}</li>}
            {errors?.gender && <li>• {errors?.gender}</li>}
          </ul>
        </div>
      )}
      {/* Members List */}
      <div className="space-y-4">
        {members?.map((member, index) => (
          <div key={member?.id} className="glass rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  member?.isLeader ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {member?.isLeader ? (
                    <Icon name="Crown" size={16} />
                  ) : (
                    <span className="text-sm font-orbitron font-bold">{index + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-inter font-medium text-foreground">
                    {member?.isLeader ? 'Team Leader' : `Member ${index + 1}`}
                  </h3>
                  {member?.isLeader && (
                    <p className="text-xs text-muted-foreground">This is you</p>
                  )}
                </div>
              </div>

              {!member?.isLeader && members?.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember(member?.id)}
                  iconName="Trash2"
                  className="text-error hover:text-error hover:bg-error/10"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter full name"
                value={member?.name}
                onChange={(e) => updateMember(member?.id, 'name', e?.target?.value)}
                error={errors?.[`member_${index}_name`]}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="10-digit number"
                value={member?.phone}
                onChange={(e) => updateMember(member?.id, 'phone', e?.target?.value)}
                error={errors?.[`member_${index}_phone`]}
                required
              />

              <Select
                label="Gender"
                placeholder="Select gender"
                options={genderOptions}
                value={member?.gender}
                onChange={(value) => updateMember(member?.id, 'gender', value)}
                error={errors?.[`member_${index}_gender`]}
                required
              />
            </div>
          </div>
        ))}
      </div>
      {/* Add Member Button */}
      {members?.length < 6 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={addMember}
            iconName="UserPlus"
            iconPosition="left"
            className="border-dashed border-2 hover:border-primary hover:text-primary"
          >
            Add Team Member ({members?.length}/6)
          </Button>
        </div>
      )}
      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Previous
        </Button>
        
        <Button
          variant="default"
          onClick={handleNext}
          iconName="ArrowRight"
          iconPosition="right"
          disabled={members?.length < 4}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default TeamMembersStep;