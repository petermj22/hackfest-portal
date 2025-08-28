import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentHistoryCard = ({ payments }) => {
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

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass rounded-xl p-6 neon-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-orbitron font-bold text-foreground">
          Payment History
        </h3>
        <Icon name="CreditCard" size={24} className="text-primary" />
      </div>
      {payments?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-inter">No payment history available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments?.map((payment) => (
            <div key={payment?.id} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-smooth">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon 
                      name={getStatusIcon(payment?.status)} 
                      size={16} 
                      className={getStatusColor(payment?.status)}
                    />
                    <span className={`font-inter font-medium capitalize ${getStatusColor(payment?.status)}`}>
                      {payment?.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-jetbrains mb-1">
                    Transaction ID: {payment?.transactionId}
                  </p>
                  
                  <p className="text-xs text-muted-foreground font-inter">
                    {formatDate(payment?.date)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-jetbrains font-bold text-foreground">
                    ₹{payment?.amount?.toLocaleString('en-IN')}
                  </p>
                  {payment?.gst && (
                    <p className="text-xs text-muted-foreground font-inter">
                      GST: ₹{payment?.gst?.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Building" size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-inter">
                    {payment?.method}
                  </span>
                </div>
                
                {payment?.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="Download"
                    iconPosition="left"
                  >
                    Receipt
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryCard;