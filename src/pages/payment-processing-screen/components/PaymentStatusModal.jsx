import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentStatusModal = ({ 
  isOpen, 
  status, 
  transactionId, 
  receiptUrl, 
  onClose, 
  onRetry, 
  onGoToDashboard 
}) => {
  if (!isOpen) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: 'CheckCircle',
          iconColor: 'text-success',
          bgColor: 'bg-success/10',
          title: 'Payment Successful!',
          message: 'Your team registration has been completed successfully. You will receive a confirmation email shortly.',
          showReceipt: true,
          showDashboard: true
        };
      case 'failed':
        return {
          icon: 'XCircle',
          iconColor: 'text-error',
          bgColor: 'bg-error/10',
          title: 'Payment Failed',
          message: 'We encountered an issue processing your payment. Please try again or contact support if the problem persists.',
          showRetry: true
        };
      case 'pending':
        return {
          icon: 'Clock',
          iconColor: 'text-warning',
          bgColor: 'bg-warning/10',
          title: 'Payment Pending',
          message: 'Your payment is being processed. This may take a few minutes. You will be notified once the payment is confirmed.',
          showDashboard: true
        };
      default:
        return {
          icon: 'AlertCircle',
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-white/5',
          title: 'Processing...',
          message: 'Please wait while we process your payment.',
          showRetry: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass rounded-xl p-8 border border-border shadow-cyber-lg max-w-md w-full mx-4">
        {/* Status Icon */}
        <div className={`w-20 h-20 ${config?.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon name={config?.icon} size={40} className={config?.iconColor} />
        </div>

        {/* Status Title */}
        <h2 className="text-2xl font-orbitron font-bold text-foreground text-center mb-4">
          {config?.title}
        </h2>

        {/* Status Message */}
        <p className="text-muted-foreground font-inter text-center mb-6 leading-relaxed">
          {config?.message}
        </p>

        {/* Transaction Details */}
        {transactionId && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-inter text-sm">Transaction ID:</span>
              <span className="text-foreground font-jetbrains text-sm font-medium">
                {transactionId}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {config?.showDashboard && (
            <Button
              variant="default"
              size="lg"
              fullWidth
              onClick={onGoToDashboard}
              iconName="LayoutDashboard"
              iconPosition="left"
              className="neon-glow"
            >
              Go to Dashboard
            </Button>
          )}

          {config?.showReceipt && receiptUrl && (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => window.open(receiptUrl, '_blank')}
              iconName="Download"
              iconPosition="left"
            >
              Download Receipt
            </Button>
          )}

          {config?.showRetry && (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={onRetry}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Try Again
            </Button>
          )}

          {status !== 'success' && (
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          )}
        </div>

        {/* Support Contact */}
        {status === 'failed' && (
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground font-inter mb-2">
              Need help? Contact our support team
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="mailto:support@hackfest.edu"
                className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-smooth"
              >
                <Icon name="Mail" size={14} />
                <span className="text-xs font-inter">support@hackfest.edu</span>
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-smooth"
              >
                <Icon name="Phone" size={14} />
                <span className="text-xs font-inter">+91 12345 67890</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusModal;