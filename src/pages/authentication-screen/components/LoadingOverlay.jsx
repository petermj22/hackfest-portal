import React from 'react';
import Icon from '../../../components/AppIcon';

const LoadingOverlay = ({ isVisible, message = "Authenticating..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-8 text-center max-w-sm mx-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto neon-glow animate-pulse">
            <Icon name="Zap" size={32} className="text-primary-foreground" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin border-t-primary"></div>
        </div>
        
        <h3 className="text-lg font-orbitron font-bold text-foreground mb-2">
          {message}
        </h3>
        
        <p className="text-sm text-muted-foreground font-inter">
          Please wait while we verify your credentials...
        </p>
        
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;