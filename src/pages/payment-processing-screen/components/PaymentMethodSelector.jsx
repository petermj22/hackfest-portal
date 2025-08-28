import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentMethodSelector = ({ onMethodSelect, selectedMethod, onProceed, isProcessing }) => {
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'CreditCard',
      description: 'Visa, Mastercard, RuPay',
      popular: true
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: 'Smartphone',
      description: 'Google Pay, PhonePe, Paytm',
      popular: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: 'Building2',
      description: 'All major banks supported',
      popular: false
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: 'Wallet',
      description: 'Paytm, Mobikwik, Amazon Pay',
      popular: false
    }
  ];

  return (
    <div className="glass rounded-xl p-6 border border-border shadow-cyber-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-orbitron font-bold text-foreground">
          Select Payment Method
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm font-inter text-success">Razorpay Secured</span>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        {paymentMethods?.map((method) => (
          <div
            key={method?.id}
            onClick={() => onMethodSelect(method?.id)}
            className={`relative p-4 rounded-lg border cursor-pointer transition-smooth hover:scale-[1.02] ${
              selectedMethod === method?.id
                ? 'border-primary bg-primary/10 neon-border' :'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            {method?.popular && (
              <div className="absolute -top-2 right-4">
                <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-inter font-medium">
                  Popular
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedMethod === method?.id
                  ? 'bg-primary/20 text-primary' :'bg-white/10 text-muted-foreground'
              }`}>
                <Icon name={method?.icon} size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className={`font-inter font-semibold ${
                  selectedMethod === method?.id ? 'text-primary' : 'text-foreground'
                }`}>
                  {method?.name}
                </h3>
                <p className="text-sm text-muted-foreground font-inter">
                  {method?.description}
                </p>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === method?.id
                  ? 'border-primary bg-primary' :'border-white/30'
              }`}>
                {selectedMethod === method?.id && (
                  <Icon name="Check" size={12} className="text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Payment Options Info */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={18} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-inter font-medium text-foreground mb-1">
              Secure Payment Processing
            </h4>
            <p className="text-sm text-muted-foreground font-inter">
              Your payment is processed securely through Razorpay. We don't store your payment information.
            </p>
          </div>
        </div>
      </div>
      {/* Proceed Button */}
      <Button
        variant="default"
        size="lg"
        fullWidth
        onClick={onProceed}
        disabled={!selectedMethod || isProcessing}
        loading={isProcessing}
        iconName="ArrowRight"
        iconPosition="right"
        className="neon-glow"
      >
        {isProcessing ? 'Processing Payment...' : 'Proceed to Payment'}
      </Button>
      {/* Supported Payment Partners */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground font-inter text-center mb-3">
          Powered by Razorpay - Trusted by millions
        </p>
        <div className="flex items-center justify-center space-x-6 opacity-60">
          <div className="text-xs font-inter text-muted-foreground">VISA</div>
          <div className="text-xs font-inter text-muted-foreground">Mastercard</div>
          <div className="text-xs font-inter text-muted-foreground">RuPay</div>
          <div className="text-xs font-inter text-muted-foreground">UPI</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;