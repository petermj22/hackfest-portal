import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const UpdateCard = ({ update, onBookmark, isBookmarked = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-accent',
          bg: 'bg-accent/5',
          icon: 'AlertTriangle',
          iconColor: 'text-accent',
          pulse: 'animate-pulse'
        };
      case 'medium':
        return {
          border: 'border-warning',
          bg: 'bg-warning/5',
          icon: 'Info',
          iconColor: 'text-warning',
          pulse: ''
        };
      default:
        return {
          border: 'border-primary',
          bg: 'bg-primary/5',
          icon: 'Bell',
          iconColor: 'text-primary',
          pulse: ''
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date?.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const styles = getPriorityStyles(update?.priority);
  const shouldTruncate = update?.content?.length > 150;

  return (
    <div className={`glass rounded-xl border ${styles?.border} ${styles?.bg} ${styles?.pulse} transition-layout hover:scale-[1.02] hover:shadow-cyber-lg`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${styles?.bg} ${styles?.border} border`}>
              <Icon name={styles?.icon} size={20} className={styles?.iconColor} />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-foreground text-lg">
                {update?.title}
              </h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm font-inter text-muted-foreground">
                  {formatTimestamp(update?.timestamp)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-jetbrains font-medium ${
                  update?.category === 'schedule' ? 'bg-secondary/20 text-secondary' :
                  update?.category === 'technical' ? 'bg-primary/20 text-primary' :
                  update?.category === 'logistics'? 'bg-success/20 text-success' : 'bg-muted/20 text-muted-foreground'
                }`}>
                  {update?.category}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onBookmark(update?.id)}
            className={`p-2 rounded-lg transition-smooth hover:scale-110 ${
              isBookmarked 
                ? 'bg-warning/20 text-warning' :'bg-white/5 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={isBookmarked ? 'Bookmark' : 'BookmarkPlus'} size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="font-inter text-foreground leading-relaxed">
            {isExpanded || !shouldTruncate 
              ? update?.content 
              : `${update?.content?.substring(0, 150)}...`
            }
          </p>
          
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-primary hover:text-primary/80 font-inter font-medium text-sm transition-smooth"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Attachments */}
        {update?.attachments && update?.attachments?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-inter font-medium text-foreground mb-2">Attachments:</h4>
            <div className="space-y-2">
              {update?.attachments?.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <Icon name="Paperclip" size={16} className="text-muted-foreground" />
                  <span className="font-inter text-sm text-foreground flex-1">
                    {attachment?.name}
                  </span>
                  <button className="text-primary hover:text-primary/80 transition-smooth">
                    <Icon name="Download" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-inter text-muted-foreground">
              By {update?.author}
            </span>
            {update?.isNew && (
              <span className="px-2 py-1 bg-success/20 text-success text-xs font-jetbrains font-medium rounded-full">
                NEW
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-smooth hover:scale-110">
              <Icon name="Share2" size={14} />
            </button>
            <button className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-smooth hover:scale-110">
              <Icon name="MessageCircle" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCard;