import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentSecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: '256-bit SSL',
      description: 'Bank-grade encryption'
    },
    {
      icon: 'Lock',
      title: 'PCI DSS',
      description: 'Compliant security'
    },
    {
      icon: 'Eye',
      title: 'No Storage',
      description: 'Card details not stored'
    },
    {
      icon: 'CheckCircle',
      title: 'Verified',
      description: 'RBI approved gateway'
    }
  ];

  const trustedPartners = [
    'Razorpay',
    'Visa',
    'Mastercard',
    'RuPay',
    'UPI',
    'NPCI'
  ];

  return (
    <div className="space-y-6">
      {/* Security Features */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-orbitron font-bold text-foreground mb-4 text-center">
          Your Payment is Protected
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {securityFeatures?.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-4 border border-white/10 text-center hover:bg-white/10 transition-smooth"
            >
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name={feature?.icon} size={20} className="text-success" />
              </div>
              <h4 className="font-inter font-semibold text-foreground text-sm mb-1">
                {feature?.title}
              </h4>
              <p className="text-xs text-muted-foreground font-inter">
                {feature?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Trust Indicators */}
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-orbitron font-bold text-foreground mb-4 text-center">
          Trusted Payment Partners
        </h3>
        
        <div className="flex flex-wrap items-center justify-center gap-6">
          {trustedPartners?.map((partner, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg px-4 py-2 border border-white/10"
            >
              <span className="text-sm font-inter font-medium text-muted-foreground">
                {partner}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-muted-foreground font-inter">
            Processed by RBI approved payment gateway with industry-standard security protocols
          </p>
        </div>
      </div>
      {/* Money Back Guarantee */}
      <div className="glass rounded-xl p-6 border border-border bg-gradient-to-r from-success/5 to-primary/5">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <Icon name="ShieldCheck" size={24} className="text-success" />
          <h3 className="text-lg font-orbitron font-bold text-foreground">
            100% Secure Payment
          </h3>
        </div>
        
        <p className="text-center text-muted-foreground font-inter text-sm mb-4">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
        
        <div className="flex items-center justify-center space-x-6 text-xs font-inter text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={14} className="text-success" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="RefreshCw" size={14} className="text-success" />
            <span>Instant Refunds</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Phone" size={14} className="text-success" />
            <span>Help Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSecurityBadges;