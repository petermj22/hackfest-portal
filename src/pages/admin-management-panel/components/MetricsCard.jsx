import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, change, icon, color = 'primary', trend = 'up' }) => {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/20 text-primary',
    success: 'from-success/20 to-success/5 border-success/20 text-success',
    warning: 'from-warning/20 to-warning/5 border-warning/20 text-warning',
    error: 'from-error/20 to-error/5 border-error/20 text-error',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/20 text-secondary'
  };

  return (
    <div className={`glass rounded-xl p-6 bg-gradient-to-br ${colorClasses?.[color]} border transition-smooth hover:scale-105 hover:shadow-cyber`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses?.[color]} flex items-center justify-center neon-glow`}>
          <Icon name={icon} size={24} className="text-white" />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-inter ${trend === 'up' ? 'text-success' : 'text-error'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={16} />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-orbitron font-bold text-foreground mb-1">
          {value}
        </h3>
        <p className="text-sm font-inter text-muted-foreground">
          {title}
        </p>
      </div>
    </div>
  );
};

export default MetricsCard;