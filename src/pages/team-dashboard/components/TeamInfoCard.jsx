import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TeamInfoCard = ({ team, onEdit, onGenerateQR }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'pending': return 'Clock';
      case 'failed': return 'XCircle';
      default: return 'AlertCircle';
    }
  };

  return (
    <div className="glass rounded-xl p-6 neon-border hover:shadow-cyber-lg transition-layout">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">
            {team?.name}
          </h2>
          <p className="text-muted-foreground font-inter">
            Team ID: <span className="font-jetbrains text-primary">{team?.id}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          iconName="Edit"
          iconPosition="left"
          onClick={onEdit}
          className="shrink-0"
        >
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-inter">Members</span>
            <span className="text-foreground font-jetbrains font-medium">
              {team?.memberCount}/6
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-layout"
              style={{ width: `${(team?.memberCount / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-inter">Registration</span>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(team?.registrationStatus)} 
                size={16} 
                className={getStatusColor(team?.registrationStatus)}
              />
              <span className={`font-inter font-medium capitalize ${getStatusColor(team?.registrationStatus)}`}>
                {team?.registrationStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-inter">Payment</span>
            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(team?.paymentStatus)} 
                size={16} 
                className={getStatusColor(team?.paymentStatus)}
              />
              <span className={`font-inter font-medium capitalize ${getStatusColor(team?.paymentStatus)}`}>
                {team?.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-inter">Total Fee</span>
            <span className="text-foreground font-jetbrains font-bold">
              ₹{team?.totalFee?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="default"
          iconName="QrCode"
          iconPosition="left"
          onClick={onGenerateQR}
          className="flex-1"
        >
          Generate QR Code
        </Button>
        <Button
          variant="outline"
          iconName="Download"
          iconPosition="left"
          className="flex-1"
        >
          Download Receipt
        </Button>
      </div>
    </div>
  );
};

export default TeamInfoCard;