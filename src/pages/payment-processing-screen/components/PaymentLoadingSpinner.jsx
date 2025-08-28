import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentLoadingSpinner = ({ isVisible, message = "Processing your payment..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass rounded-xl p-8 border border-border shadow-cyber-lg max-w-sm w-full mx-4">
        {/* Holographic Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          
          {/* Spinning Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          
          {/* Inner Glow */}
          <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="CreditCard" size={24} className="text-primary animate-pulse" />
          </div>
          
          {/* Particle Effects */}
          <div className="absolute -inset-4">
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full particle opacity-60"></div>
            <div className="absolute top-1/2 right-0 w-1 h-1 bg-secondary rounded-full particle opacity-40" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-accent rounded-full particle opacity-50" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 left-0 w-1 h-1 bg-primary rounded-full particle opacity-30" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <h3 className="text-lg font-orbitron font-bold text-foreground mb-2">
            Secure Payment Processing
          </h3>
          <p className="text-muted-foreground font-inter mb-4">
            {message}
          </p>
          
          {/* Progress Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm font-inter">
              <Icon name="Check" size={16} className="text-success" />
              <span className="text-success">Payment details verified</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm font-inter">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-primary">Processing transaction...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm font-inter">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">Confirming payment</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Shield" size={16} className="text-success" />
            <span className="text-xs font-inter text-muted-foreground">
              Your payment is secured with 256-bit SSL encryption
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-4 bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <p className="text-xs font-inter text-warning">
              Please do not close this window or press the back button while payment is being processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentLoadingSpinner;