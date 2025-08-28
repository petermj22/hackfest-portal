import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStats = ({ stats }) => {
  const statItems = [
    {
      id: 'total',
      label: 'Total Updates',
      value: stats?.totalUpdates,
      icon: 'Bell',
      color: 'primary',
      change: '+3 today'
    },
    {
      id: 'high-priority',
      label: 'High Priority',
      value: stats?.highPriority,
      icon: 'AlertTriangle',
      color: 'accent',
      change: stats?.highPriority > 0 ? 'Action needed' : 'All clear'
    },
    {
      id: 'bookmarked',
      label: 'Bookmarked',
      value: stats?.bookmarked,
      icon: 'Bookmark',
      color: 'warning',
      change: 'Saved items'
    },
    {
      id: 'unread',
      label: 'Unread',
      value: stats?.unread,
      icon: 'Eye',
      color: 'secondary',
      change: stats?.unread > 0 ? 'New content' : 'All caught up'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary/20',
          border: 'border-primary',
          text: 'text-primary',
          icon: 'text-primary'
        };
      case 'accent':
        return {
          bg: 'bg-accent/20',
          border: 'border-accent',
          text: 'text-accent',
          icon: 'text-accent'
        };
      case 'warning':
        return {
          bg: 'bg-warning/20',
          border: 'border-warning',
          text: 'text-warning',
          icon: 'text-warning'
        };
      case 'secondary':
        return {
          bg: 'bg-secondary/20',
          border: 'border-secondary',
          text: 'text-secondary',
          icon: 'text-secondary'
        };
      default:
        return {
          bg: 'bg-muted/20',
          border: 'border-muted',
          text: 'text-muted-foreground',
          icon: 'text-muted-foreground'
        };
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems?.map((item) => {
        const colors = getColorClasses(item?.color);
        
        return (
          <div
            key={item?.id}
            className={`glass rounded-xl border ${colors?.border} ${colors?.bg} p-4 transition-layout hover:scale-105 hover:shadow-cyber`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${colors?.bg} ${colors?.border} border`}>
                <Icon name={item?.icon} size={20} className={colors?.icon} />
              </div>
              
              {item?.id === 'high-priority' && item?.value > 0 && (
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-orbitron font-bold ${colors?.text}`}>
                {item?.value}
              </div>
              <div className="font-inter font-medium text-foreground text-sm">
                {item?.label}
              </div>
              <div className="font-inter text-xs text-muted-foreground">
                {item?.change}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;