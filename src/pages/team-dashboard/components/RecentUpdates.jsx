import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentUpdates = ({ updates, notificationCount }) => {
  const navigate = useNavigate();

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'announcement': return 'Megaphone';
      case 'schedule': return 'Calendar';
      case 'important': return 'AlertTriangle';
      case 'general': return 'Info';
      default: return 'Bell';
    }
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case 'announcement': return 'text-primary';
      case 'schedule': return 'text-secondary';
      case 'important': return 'text-warning';
      case 'general': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const updateDate = new Date(date);
    const diffInHours = Math.floor((now - updateDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="glass rounded-xl p-6 neon-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-orbitron font-bold text-foreground">
            Recent Updates
          </h3>
          {notificationCount > 0 && (
            <span className="bg-accent text-accent-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-jetbrains">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          iconName="ExternalLink"
          iconPosition="right"
          onClick={() => navigate('/event-updates-hub')}
        >
          View All
        </Button>
      </div>
      {updates?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-inter">No recent updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates?.slice(0, 3)?.map((update) => (
            <div key={update?.id} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-smooth cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-muted/50 shrink-0`}>
                  <Icon 
                    name={getUpdateIcon(update?.type)} 
                    size={16} 
                    className={getUpdateColor(update?.type)}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-inter font-medium text-foreground line-clamp-1">
                      {update?.title}
                    </h4>
                    <span className="text-xs text-muted-foreground font-inter shrink-0 ml-2">
                      {formatTimeAgo(update?.date)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-inter line-clamp-2 mb-2">
                    {update?.content}
                  </p>
                  
                  {update?.isNew && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-inter font-medium bg-primary/10 text-primary">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></span>
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {updates?.length > 3 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="ChevronDown"
                iconPosition="right"
                onClick={() => navigate('/event-updates-hub')}
              >
                View {updates?.length - 3} more updates
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentUpdates;