import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const EmailTemplateEditor = ({ onSaveTemplate, onSendTestEmail }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('registration_confirmation');
  const [templateData, setTemplateData] = useState({
    subject: 'Registration Confirmation - HackFest 2024',
    content: `Dear {{teamLeaderName}},

Congratulations! Your team "{{teamName}}" has been successfully registered for HackFest 2024.

Team Details:
- Team Name: {{teamName}}
- Team Leader: {{teamLeaderName}}
- Members: {{memberCount}}
- Problem Statement: {{problemStatement}}
- Registration Date: {{registrationDate}}

Payment Information:
- Amount: ₹{{amount}}
- Transaction ID: {{transactionId}}
- Payment Status: {{paymentStatus}}

Next Steps:
1. Join our Discord server for updates: [Discord Link]
2. Check your dashboard regularly for announcements
3. Prepare for the hackathon on {{eventDate}}

If you have any questions, feel free to reach out to our support team.

Best regards,
HackFest 2024 Team`,
    variables: [
      'teamLeaderName', 'teamName', 'memberCount', 'problemStatement', 
      'registrationDate', 'amount', 'transactionId', 'paymentStatus', 'eventDate'
    ]
  });
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const templateTypes = [
    {
      id: 'registration_confirmation',
      name: 'Registration Confirmation',
      description: 'Sent when team registration is completed',
      icon: 'UserCheck'
    },
    {
      id: 'payment_success',
      name: 'Payment Success',
      description: 'Sent when payment is successfully processed',
      icon: 'CreditCard'
    },
    {
      id: 'payment_failed',
      name: 'Payment Failed',
      description: 'Sent when payment processing fails',
      icon: 'AlertCircle'
    },
    {
      id: 'event_reminder',
      name: 'Event Reminder',
      description: 'Sent as event date approaches',
      icon: 'Calendar'
    },
    {
      id: 'general_announcement',
      name: 'General Announcement',
      description: 'For general updates and announcements',
      icon: 'Megaphone'
    }
  ];

  const availableVariables = [
    { key: '{{teamName}}', description: 'Team name' },
    { key: '{{teamLeaderName}}', description: 'Team leader name' },
    { key: '{{leaderEmail}}', description: 'Team leader email' },
    { key: '{{leaderPhone}}', description: 'Team leader phone' },
    { key: '{{memberCount}}', description: 'Number of team members' },
    { key: '{{memberNames}}', description: 'List of all member names' },
    { key: '{{problemStatement}}', description: 'Selected problem statement' },
    { key: '{{registrationDate}}', description: 'Registration date' },
    { key: '{{amount}}', description: 'Payment amount' },
    { key: '{{transactionId}}', description: 'Payment transaction ID' },
    { key: '{{paymentStatus}}', description: 'Payment status' },
    { key: '{{paymentDate}}', description: 'Payment completion date' },
    { key: '{{eventDate}}', description: 'Hackathon event date' },
    { key: '{{eventVenue}}', description: 'Event venue' },
    { key: '{{supportEmail}}', description: 'Support team email' },
    { key: '{{websiteUrl}}', description: 'Official website URL' }
  ];

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    // Load template data based on selection
    // In a real app, this would fetch from backend
    const templates = {
      registration_confirmation: {
        subject: 'Registration Confirmation - HackFest 2024',
        content: `Dear {{teamLeaderName}},

Congratulations! Your team "{{teamName}}" has been successfully registered for HackFest 2024.

Team Details:
- Team Name: {{teamName}}
- Team Leader: {{teamLeaderName}}
- Members: {{memberCount}}
- Problem Statement: {{problemStatement}}
- Registration Date: {{registrationDate}}

Payment Information:
- Amount: ₹{{amount}}
- Transaction ID: {{transactionId}}
- Payment Status: {{paymentStatus}}

Next Steps:
1. Join our Discord server for updates
2. Check your dashboard regularly for announcements
3. Prepare for the hackathon on {{eventDate}}

Best regards,
HackFest 2024 Team`
      },
      payment_success: {
        subject: 'Payment Successful - HackFest 2024',
        content: `Dear {{teamLeaderName}},

Your payment for HackFest 2024 has been successfully processed!

Payment Details:
- Team: {{teamName}}
- Amount: ₹{{amount}}
- Transaction ID: {{transactionId}}
- Payment Date: {{paymentDate}}

Your registration is now complete. We look forward to seeing your team at the event!

Best regards,
HackFest 2024 Team`
      },
      payment_failed: {
        subject: 'Payment Failed - HackFest 2024',
        content: `Dear {{teamLeaderName}},

We encountered an issue processing your payment for HackFest 2024.

Transaction Details:
- Team: {{teamName}}
- Amount: ₹{{amount}}
- Transaction ID: {{transactionId}}

Please try again or contact our support team at {{supportEmail}} for assistance.

Best regards,
HackFest 2024 Team`
      }
    };

    if (templates[templateId]) {
      setTemplateData(prev => ({
        ...prev,
        ...templates[templateId]
      }));
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = templateData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setTemplateData(prev => ({
      ...prev,
      content: before + variable + after
    }));
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTemplate(selectedTemplate, templateData);
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) return;
    
    setIsSendingTest(true);
    try {
      await onSendTestEmail(selectedTemplate, templateData, testEmail);
    } catch (error) {
      console.error('Failed to send test email:', error);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getCurrentTemplate = () => {
    return templateTypes.find(t => t.id === selectedTemplate);
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="glass rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-orbitron font-bold text-foreground">Email Template Editor</h3>
          <p className="text-sm font-inter text-muted-foreground mt-1">
            Customize email templates for automated communications
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateTypes.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateChange(template.id)}
                className={`p-4 rounded-lg border transition-smooth text-left hover:scale-105 ${
                  selectedTemplate === template.id
                    ? 'bg-primary/10 border-primary/30 neon-border' :'bg-card border-border hover:border-primary/20'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedTemplate === template.id
                      ? 'bg-primary/20 text-primary' :'bg-muted/20 text-muted-foreground'
                  }`}>
                    <Icon name={template.icon} size={16} />
                  </div>
                  <h4 className="font-inter font-medium text-foreground">{template.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <Icon name={getCurrentTemplate()?.icon} size={20} className="text-primary" />
                <h4 className="font-inter font-semibold text-foreground">
                  {getCurrentTemplate()?.name}
                </h4>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <Input
                label="Email Subject"
                type="text"
                value={templateData.subject}
                onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject..."
              />
              
              <div>
                <label className="block text-sm font-inter font-medium text-foreground mb-2">
                  Email Content
                </label>
                <textarea
                  id="template-content"
                  value={templateData.content}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your email content here..."
                  rows={16}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground font-inter placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variables like {`{{teamName}}`} to personalize emails
                </p>
              </div>
            </div>
          </div>

          {/* Test Email */}
          <div className="glass rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <h4 className="font-inter font-semibold text-foreground">Test Email</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Send a test email to verify the template
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex space-x-3">
                <Input
                  type="email"
                  placeholder="Enter test email address..."
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  iconName="Send"
                  loading={isSendingTest}
                  onClick={handleSendTest}
                  disabled={!testEmail}
                >
                  Send Test
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Variables Panel */}
        <div className="space-y-6">
          <div className="glass rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <h4 className="font-inter font-semibold text-foreground">Available Variables</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Click to insert into template
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {availableVariables.map((variable, index) => (
                  <button
                    key={index}
                    onClick={() => insertVariable(variable.key)}
                    className="w-full p-3 text-left rounded-lg bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-smooth group"
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-jetbrains text-primary group-hover:text-primary/80">
                        {variable.key}
                      </code>
                      <Icon name="Plus" size={14} className="text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {variable.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass rounded-xl border border-border">
            <div className="p-6">
              <div className="space-y-3">
                <Button
                  variant="default"
                  iconName="Save"
                  loading={isSaving}
                  onClick={handleSave}
                  fullWidth
                >
                  Save Template
                </Button>
                
                <Button
                  variant="outline"
                  iconName="Eye"
                  fullWidth
                >
                  Preview Template
                </Button>
                
                <Button
                  variant="ghost"
                  iconName="RotateCcw"
                  fullWidth
                  onClick={() => handleTemplateChange(selectedTemplate)}
                >
                  Reset to Default
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;