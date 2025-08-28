import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ProblemStatementStep = ({ formData, updateFormData, onNext, onPrevious, onSubmit }) => {
  const [selectedStatement, setSelectedStatement] = useState(formData?.problemStatement || '');
  const [customStatement, setCustomStatement] = useState(formData?.customProblemStatement || '');
  const [isCustom, setIsCustom] = useState(formData?.isCustomProblem || false);
  const [error, setError] = useState('');

  const problemStatements = [
    {
      id: 'healthcare',
      title: 'Healthcare Innovation',
      description: `Develop a digital solution to improve healthcare accessibility and patient care in rural areas.\n\nFocus areas: Telemedicine, health monitoring, medical record management, or preventive care solutions.`,
      difficulty: 'Medium',
      category: 'Healthcare',
      icon: 'Heart'
    },
    {
      id: 'education',
      title: 'Educational Technology',
      description: `Create an innovative learning platform that enhances student engagement and educational outcomes.\n\nFocus areas: Personalized learning, skill assessment, virtual classrooms, or educational games.`,
      difficulty: 'Medium',
      category: 'Education',
      icon: 'GraduationCap'
    },
    {
      id: 'environment',
      title: 'Environmental Sustainability',
      description: `Build a solution to address environmental challenges and promote sustainable practices.\n\nFocus areas: Waste management, carbon footprint tracking, renewable energy, or conservation tools.`,
      difficulty: 'Hard',
      category: 'Environment',
      icon: 'Leaf'
    },
    {
      id: 'fintech',
      title: 'Financial Technology',
      description: `Develop a fintech solution that improves financial inclusion and accessibility.\n\nFocus areas: Digital payments, microfinance, financial literacy, or investment platforms.`,
      difficulty: 'Hard',
      category: 'Finance',
      icon: 'CreditCard'
    },
    {
      id: 'smart-city',
      title: 'Smart City Solutions',
      description: `Create technology solutions for urban challenges and smart city development.\n\nFocus areas: Traffic management, public safety, utilities optimization, or citizen services.`,
      difficulty: 'Hard',
      category: 'Urban Tech',
      icon: 'Building'
    },
    {
      id: 'agriculture',
      title: 'Agricultural Technology',
      description: `Develop solutions to modernize agriculture and improve farmer productivity.\n\nFocus areas: Crop monitoring, precision farming, supply chain, or market connectivity.`,
      difficulty: 'Medium',
      category: 'Agriculture',
      icon: 'Sprout'
    }
  ];

  useEffect(() => {
    updateFormData({
      problemStatement: selectedStatement,
      customProblemStatement: customStatement,
      isCustomProblem: isCustom
    });
  }, [selectedStatement, customStatement, isCustom, updateFormData]);

  const handleStatementSelect = (statementId) => {
    setSelectedStatement(statementId);
    setIsCustom(false);
    setCustomStatement('');
    setError('');
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setSelectedStatement('');
    setError('');
  };

  const handleSubmit = () => {
    if (!isCustom && !selectedStatement) {
      setError('Please select a problem statement or choose to define your own');
      return;
    }

    if (isCustom && !customStatement?.trim()) {
      setError('Please describe your custom problem statement');
      return;
    }

    if (isCustom && customStatement?.trim()?.length < 50) {
      setError('Custom problem statement must be at least 50 characters long');
      return;
    }

    onSubmit();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Hard': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">
          Choose Problem Statement
        </h2>
        <p className="text-muted-foreground font-inter">
          Select a challenge to solve or define your own innovative problem
        </p>
      </div>
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-error">
            <Icon name="AlertCircle" size={16} />
            <span className="font-inter font-medium">{error}</span>
          </div>
        </div>
      )}
      {/* Predefined Problem Statements */}
      <div className="space-y-4">
        <h3 className="font-inter font-semibold text-foreground mb-4">
          Predefined Problem Statements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problemStatements?.map((statement) => (
            <div
              key={statement?.id}
              onClick={() => handleStatementSelect(statement?.id)}
              className={`glass rounded-xl p-6 border cursor-pointer transition-smooth hover:scale-105 hover:shadow-cyber ${
                selectedStatement === statement?.id
                  ? 'border-primary neon-border bg-primary/5' :'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedStatement === statement?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <Icon name={statement?.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-inter font-semibold text-foreground">
                      {statement?.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {statement?.category}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-inter font-medium ${getDifficultyColor(statement?.difficulty)}`}>
                    {statement?.difficulty}
                  </span>
                  {selectedStatement === statement?.id && (
                    <Icon name="CheckCircle" size={16} className="text-primary" />
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-inter leading-relaxed whitespace-pre-line">
                {statement?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Custom Problem Statement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-inter font-semibold text-foreground">
            Custom Problem Statement
          </h3>
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
            onClick={handleCustomToggle}
            iconName="Plus"
            iconPosition="left"
          >
            Define Your Own
          </Button>
        </div>

        {isCustom && (
          <div className="glass rounded-xl p-6 border border-primary neon-border bg-primary/5">
            <Input
              label="Describe Your Problem Statement"
              type="text"
              placeholder="Describe the problem you want to solve (minimum 50 characters)"
              value={customStatement}
              onChange={(e) => setCustomStatement(e?.target?.value)}
              description={`${customStatement?.length}/500 characters`}
              required
            />
            
            <div className="mt-4 bg-muted/20 rounded-lg p-4 border border-border">
              <h4 className="font-inter font-medium text-foreground mb-2">Guidelines for Custom Problems:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center space-x-2">
                  <Icon name="Check" size={14} className="text-success" />
                  <span>Clearly define the problem and its impact</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Check" size={14} className="text-success" />
                  <span>Explain why this problem needs solving</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Check" size={14} className="text-success" />
                  <span>Mention the target audience or beneficiaries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Check" size={14} className="text-success" />
                  <span>Keep it feasible for a 48-hour hackathon</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
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
          onClick={handleSubmit}
          iconName="Send"
          iconPosition="right"
          disabled={(!isCustom && !selectedStatement) || (isCustom && (!customStatement?.trim() || customStatement?.trim()?.length < 50))}
        >
          Complete Registration
        </Button>
      </div>
    </div>
  );
};

export default ProblemStatementStep;