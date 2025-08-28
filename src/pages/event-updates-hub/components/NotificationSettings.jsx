import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const NotificationSettings = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const notificationTypes = [
    {
      id: 'highPriority',
      label: 'High Priority Updates',
      description: 'Critical announcements and urgent information',
      icon: 'AlertTriangle'
    },
    {
      id: 'schedule',
      label: 'Schedule Changes',
      description: 'Event timing and venue modifications',
      icon: 'Calendar'
    },
    {
      id: 'technical',
      label: 'Technical Updates',
      description: 'Platform changes and technical requirements',
      icon: 'Code'
    },
    {
      id: 'logistics',
      label: 'Logistics Information',
      description: 'Food, accommodation, and transport updates',
      icon: 'Truck'
    },
    {
      id: 'general',
      label: 'General Announcements',
      description: 'Non-critical updates and general information',
      icon: 'Info'
    }
  ];

  const deliveryMethods = [
    {
      id: 'push',
      label: 'Push Notifications',
      description: 'Browser notifications when updates are posted',
      icon: 'Bell'
    },
    {
      id: 'email',
      label: 'Email Notifications',
      description: 'Updates delivered to your registered email',
      icon: 'Mail'
    },
    {
      id: 'sms',
      label: 'SMS Alerts',
      description: 'Text messages for high-priority updates only',
      icon: 'MessageSquare'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary">
              <Icon name="Settings" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-xl text-foreground">
                Notification Settings
              </h2>
              <p className="font-inter text-sm text-muted-foreground">
                Customize how you receive event updates
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Notification Types */}
          <div>
            <h3 className="font-orbitron font-bold text-foreground mb-4">
              Update Categories
            </h3>
            <p className="font-inter text-sm text-muted-foreground mb-6">
              Choose which types of updates you want to receive notifications for.
            </p>
            
            <div className="space-y-4">
              {notificationTypes?.map((type) => (
                <div key={type?.id} className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-primary/20 border border-primary mt-1">
                    <Icon name={type?.icon} size={16} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-inter font-medium text-foreground">
                        {type?.label}
                      </h4>
                      <Checkbox
                        checked={localSettings?.[type?.id] || false}
                        onChange={(e) => handleSettingChange(type?.id, e?.target?.checked)}
                      />
                    </div>
                    <p className="font-inter text-sm text-muted-foreground">
                      {type?.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Methods */}
          <div>
            <h3 className="font-orbitron font-bold text-foreground mb-4">
              Delivery Methods
            </h3>
            <p className="font-inter text-sm text-muted-foreground mb-6">
              Select how you want to receive notifications.
            </p>
            
            <div className="space-y-4">
              {deliveryMethods?.map((method) => (
                <div key={method?.id} className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="p-2 rounded-lg bg-secondary/20 border border-secondary mt-1">
                    <Icon name={method?.icon} size={16} className="text-secondary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-inter font-medium text-foreground">
                        {method?.label}
                      </h4>
                      <Checkbox
                        checked={localSettings?.[`delivery_${method?.id}`] || false}
                        onChange={(e) => handleSettingChange(`delivery_${method?.id}`, e?.target?.checked)}
                      />
                    </div>
                    <p className="font-inter text-sm text-muted-foreground">
                      {method?.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="font-orbitron font-bold text-foreground mb-4">
              Quiet Hours
            </h3>
            <p className="font-inter text-sm text-muted-foreground mb-6">
              Set times when you don't want to receive notifications (except high priority).
            </p>
            
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <Checkbox
                checked={localSettings?.quietHours || false}
                onChange={(e) => handleSettingChange('quietHours', e?.target?.checked)}
                label="Enable quiet hours"
              />
              
              {localSettings?.quietHours && (
                <div className="flex items-center space-x-2 ml-4">
                  <span className="font-inter text-sm text-muted-foreground">From</span>
                  <input
                    type="time"
                    value={localSettings?.quietStart || '22:00'}
                    onChange={(e) => handleSettingChange('quietStart', e?.target?.value)}
                    className="px-3 py-1 rounded-lg bg-input border border-border text-foreground font-jetbrains text-sm"
                  />
                  <span className="font-inter text-sm text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={localSettings?.quietEnd || '08:00'}
                    onChange={(e) => handleSettingChange('quietEnd', e?.target?.value)}
                    className="px-3 py-1 rounded-lg bg-input border border-border text-foreground font-jetbrains text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;