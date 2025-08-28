import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentSummaryCard = ({ teamData, totalAmount, memberCount }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  return (
    <div className="glass rounded-xl p-6 border border-border shadow-cyber-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-orbitron font-bold text-foreground">
          Payment Summary
        </h2>
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} className="text-success" />
          <span className="text-sm font-inter text-success">Secure Payment</span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Team Details */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-inter font-semibold text-foreground mb-3">
            Team Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-inter">Team Name:</span>
              <span className="text-foreground font-inter font-medium">
                {teamData?.teamName || 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-inter">Team Leader:</span>
              <span className="text-foreground font-inter font-medium">
                {teamData?.leaderName || 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-inter">Event:</span>
              <span className="text-foreground font-inter font-medium">
                {teamData?.eventName || 'HackFest 2024'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-inter">Problem Statement:</span>
              <span className="text-foreground font-inter font-medium text-right max-w-48 truncate" title={teamData?.problemStatement}>
                {teamData?.problemStatement || 'Loading...'}
              </span>
            </div>
            {teamData?.description && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground font-inter">Description:</span>
                <span className="text-foreground font-inter font-medium text-right max-w-48 text-sm" title={teamData?.description}>
                  {teamData.description.length > 50 ? `${teamData.description.substring(0, 50)}...` : teamData.description}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Member Count */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={18} className="text-primary" />
              <span className="text-muted-foreground font-inter">Team Members:</span>
            </div>
            <span className="text-foreground font-inter font-medium">
              {memberCount} members
            </span>
          </div>
        </div>

        {/* Fee Calculation */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-inter font-semibold text-foreground mb-3">
            Fee Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-inter">
                Registration Fee (per member):
              </span>
              <span className="text-foreground font-inter">₹100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-inter">
                Number of Members:
              </span>
              <span className="text-foreground font-inter">{memberCount}</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-inter font-semibold text-foreground">
                  Total Amount:
                </span>
                <span className="text-2xl font-orbitron font-bold text-primary neon-glow">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center space-x-4 pt-4">
          <div className="flex items-center space-x-2">
            <Icon name="Lock" size={16} className="text-success" />
            <span className="text-xs font-inter text-muted-foreground">SSL Secured</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="CreditCard" size={16} className="text-success" />
            <span className="text-xs font-inter text-muted-foreground">PCI Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-success" />
            <span className="text-xs font-inter text-muted-foreground">Bank Grade Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;