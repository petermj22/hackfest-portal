import React from 'react';
import Icon from '../../../components/AppIcon';

const EventTimeline = ({ events, currentPhase = 'registration' }) => {
  const getPhaseStatus = (phase, currentPhase) => {
    const phases = ['registration', 'team-formation', 'hackathon', 'judging', 'results'];
    const currentIndex = phases?.indexOf(currentPhase);
    const phaseIndex = phases?.indexOf(phase);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-success/20',
          border: 'border-success',
          text: 'text-success',
          icon: 'CheckCircle2'
        };
      case 'active':
        return {
          bg: 'bg-primary/20',
          border: 'border-primary',
          text: 'text-primary',
          icon: 'Clock'
        };
      default:
        return {
          bg: 'bg-muted/20',
          border: 'border-muted',
          text: 'text-muted-foreground',
          icon: 'Circle'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time?.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="glass rounded-xl border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20 border border-primary">
          <Icon name="Calendar" size={20} className="text-primary" />
        </div>
        <h2 className="font-orbitron font-bold text-xl text-foreground">
          Event Timeline
        </h2>
      </div>
      <div className="space-y-4">
        {events?.map((event, index) => {
          const status = getPhaseStatus(event?.phase, currentPhase);
          const styles = getStatusStyles(status);
          const isLast = index === events?.length - 1;

          return (
            <div key={event?.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-border to-transparent"></div>
              )}
              {/* Event Card */}
              <div className={`flex items-start space-x-4 p-4 rounded-lg border ${styles?.border} ${styles?.bg} transition-layout hover:scale-[1.02]`}>
                {/* Status Icon */}
                <div className={`p-2 rounded-full ${styles?.bg} ${styles?.border} border-2 ${status === 'active' ? 'animate-pulse' : ''}`}>
                  <Icon name={styles?.icon} size={16} className={styles?.text} />
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-orbitron font-bold ${styles?.text}`}>
                      {event?.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-jetbrains font-medium ${styles?.bg} ${styles?.text}`}>
                      {status?.toUpperCase()}
                    </span>
                  </div>

                  <p className="font-inter text-sm text-muted-foreground mb-3 leading-relaxed">
                    {event?.description}
                  </p>

                  <div className="flex items-center space-x-4 text-xs font-inter">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} className="text-muted-foreground" />
                      <span className="text-foreground">{formatDate(event?.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} className="text-muted-foreground" />
                      <span className="text-foreground">
                        {formatTime(event?.startTime)} - {formatTime(event?.endTime)}
                      </span>
                    </div>
                    {event?.location && (
                      <div className="flex items-center space-x-1">
                        <Icon name="MapPin" size={14} className="text-muted-foreground" />
                        <span className="text-foreground">{event?.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar for Active Events */}
                  {status === 'active' && event?.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-inter text-muted-foreground">Progress</span>
                        <span className="text-xs font-jetbrains text-primary">{event?.progress}%</span>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500 neon-glow"
                          style={{ width: `${event?.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Current Phase Indicator */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-foreground">Current Phase</h3>
            <p className="font-inter text-sm text-muted-foreground">
              {events?.find(e => e?.phase === currentPhase)?.title || 'Unknown Phase'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-orbitron font-bold text-primary">
              {Math.round((events?.findIndex(e => e?.phase === currentPhase) + 1) / events?.length * 100)}%
            </div>
            <p className="text-xs font-inter text-muted-foreground">Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTimeline;