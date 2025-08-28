import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ForgotPasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/?.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      onSubmit(email);
    }, 2000);
  };

  const handleClose = () => {
    setEmail('');
    setIsSubmitted(false);
    setError('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md neon-border shadow-cyber-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-orbitron font-bold text-foreground">
            Reset Password
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-smooth p-1"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="KeyRound" size={24} className="text-white" />
              </div>
              <p className="text-muted-foreground font-inter">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e?.target?.value);
                setError('');
              }}
              error={error}
              required
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                fullWidth
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                loading={loading}
                fullWidth
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
              <Icon name="CheckCircle" size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-orbitron font-bold text-foreground mb-2">
              Check Your Email
            </h3>
            <p className="text-muted-foreground font-inter mb-6">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
            <Button
              variant="default"
              onClick={handleClose}
              fullWidth
            >
              Got it
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;