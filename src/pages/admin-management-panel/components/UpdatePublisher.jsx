import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UpdatePublisher = ({ onPublishUpdate, onScheduleUpdate }) => {
  const [updateData, setUpdateData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    category: 'general',
    scheduledDate: '',
    scheduledTime: '',
    sendEmail: true,
    sendPush: false
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-muted-foreground', icon: 'Info' },
    { value: 'medium', label: 'Medium Priority', color: 'text-warning', icon: 'AlertCircle' },
    { value: 'high', label: 'High Priority', color: 'text-error', icon: 'AlertTriangle' },
    { value: 'urgent', label: 'Urgent', color: 'text-error animate-pulse', icon: 'Zap' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General Announcement', icon: 'Megaphone' },
    { value: 'schedule', label: 'Schedule Update', icon: 'Calendar' },
    { value: 'technical', label: 'Technical Information', icon: 'Code' },
    { value: 'payment', label: 'Payment Related', icon: 'CreditCard' },
    { value: 'emergency', label: 'Emergency Notice', icon: 'AlertTriangle' }
  ];

  const handleInputChange = (field, value) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (updateData?.scheduledDate && updateData?.scheduledTime) {
        await onScheduleUpdate(updateData);
      } else {
        await onPublishUpdate(updateData);
      }
      // Reset form
      setUpdateData({
        title: '',
        content: '',
        priority: 'medium',
        category: 'general',
        scheduledDate: '',
        scheduledTime: '',
        sendEmail: true,
        sendPush: false
      });
      setIsPreview(false);
    } catch (error) {
      console.error('Failed to publish update:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getCurrentPriority = () => {
    return priorityOptions?.find(p => p?.value === updateData?.priority);
  };

  const getCurrentCategory = () => {
    return categoryOptions?.find(c => c?.value === updateData?.category);
  };

  const getPreviewContent = () => {
    const currentPriority = getCurrentPriority();
    const currentCategory = getCurrentCategory();
    
    return {
      ...updateData,
      timestamp: new Date()?.toISOString(),
      id: `preview-${Date.now()}`,
      priorityConfig: currentPriority,
      categoryConfig: currentCategory
    };
  };

  if (isPreview) {
    const previewData = getPreviewContent();
    
    return (
      <div className="glass rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-orbitron font-bold text-foreground">Update Preview</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                onClick={() => setIsPreview(false)}
              >
                Edit
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Send"
                loading={isPublishing}
                onClick={handlePublish}
              >
                {updateData?.scheduledDate ? 'Schedule' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Preview Card */}
          <div className="glass rounded-lg border border-border p-6 max-w-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center`}>
                  <Icon name={previewData?.categoryConfig?.icon} size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-inter font-medium ${
                      previewData?.priority === 'urgent' ? 'bg-error/20 text-error border border-error/30' :
                      previewData?.priority === 'high' ? 'bg-warning/20 text-warning border border-warning/30' :
                      previewData?.priority === 'medium'? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted/20 text-muted-foreground border border-muted/30'
                    }`}>
                      <Icon name={previewData?.priorityConfig?.icon} size={12} className="mr-1" />
                      {previewData?.priorityConfig?.label}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-inter bg-secondary/20 text-secondary border border-secondary/30">
                      {previewData?.categoryConfig?.label}
                    </span>
                  </div>
                  <p className="text-xs font-inter text-muted-foreground">
                    {updateData?.scheduledDate 
                      ? `Scheduled for ${new Date(`${updateData.scheduledDate}T${updateData.scheduledTime}`)?.toLocaleString('en-IN')}`
                      : 'Publishing now'
                    }
                  </p>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-inter font-semibold text-foreground mb-3">
              {previewData?.title}
            </h4>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground font-inter leading-relaxed whitespace-pre-wrap">
                {previewData?.content}
              </p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {previewData?.sendEmail && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Mail" size={12} />
                    <span>Email notification</span>
                  </div>
                )}
                {previewData?.sendPush && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Bell" size={12} />
                    <span>Push notification</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date()?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-orbitron font-bold text-foreground">Publish Update</h3>
        <p className="text-sm font-inter text-muted-foreground mt-1">
          Create and publish announcements for all participants
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Title */}
        <Input
          label="Update Title"
          type="text"
          placeholder="Enter announcement title..."
          value={updateData?.title}
          onChange={(e) => handleInputChange('title', e?.target?.value)}
          required
        />

        {/* Content */}
        <div>
          <label className="block text-sm font-inter font-medium text-foreground mb-2">
            Content <span className="text-error">*</span>
          </label>
          <textarea
            value={updateData?.content}
            onChange={(e) => handleInputChange('content', e?.target?.value)}
            placeholder="Write your announcement content here..."
            rows={6}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-inter placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {updateData?.content?.length}/1000 characters
          </p>
        </div>

        {/* Priority and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter font-medium text-foreground mb-2">
              Priority Level
            </label>
            <select
              value={updateData?.priority}
              onChange={(e) => handleInputChange('priority', e?.target?.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-inter focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {priorityOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={updateData?.category}
              onChange={(e) => handleInputChange('category', e?.target?.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-inter focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categoryOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scheduling */}
        <div className="p-4 bg-muted/5 rounded-lg border border-border">
          <h4 className="font-inter font-medium text-foreground mb-3">Schedule Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Schedule Date (Optional)"
              type="date"
              value={updateData?.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e?.target?.value)}
            />
            <Input
              label="Schedule Time (Optional)"
              type="time"
              value={updateData?.scheduledTime}
              onChange={(e) => handleInputChange('scheduledTime', e?.target?.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Leave empty to publish immediately
          </p>
        </div>

        {/* Notification Options */}
        <div className="p-4 bg-muted/5 rounded-lg border border-border">
          <h4 className="font-inter font-medium text-foreground mb-3">Notification Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={updateData?.sendEmail}
                onChange={(e) => handleInputChange('sendEmail', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary"
              />
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={16} className="text-muted-foreground" />
                <span className="font-inter text-foreground">Send email notifications</span>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={updateData?.sendPush}
                onChange={(e) => handleInputChange('sendPush', e?.target?.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary"
              />
              <div className="flex items-center space-x-2">
                <Icon name="Bell" size={16} className="text-muted-foreground" />
                <span className="font-inter text-foreground">Send push notifications</span>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {updateData?.scheduledDate && updateData?.scheduledTime && (
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} />
                <span>
                  Will be published on {new Date(`${updateData.scheduledDate}T${updateData.scheduledTime}`)?.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              iconName="Eye"
              onClick={() => setIsPreview(true)}
              disabled={!updateData?.title || !updateData?.content}
            >
              Preview
            </Button>
            <Button
              variant="default"
              iconName={updateData?.scheduledDate ? "Clock" : "Send"}
              onClick={handlePublish}
              loading={isPublishing}
              disabled={!updateData?.title || !updateData?.content}
            >
              {updateData?.scheduledDate ? 'Schedule Update' : 'Publish Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePublisher;