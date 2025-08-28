import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from 'lucide-react';
import GoogleOAuthButton from '../../../components/ui/GoogleOAuthButton';

const AuthCard = ({ onAuthenticate, onToggleMode, isLogin, loading, authError, onForgotPassword, onGoogleAuth }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    university: '',
    studentId: '',
    phoneNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData?.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData?.fullName) {
        errors.fullName = 'Full name is required';
      }
      if (!formData?.university) {
        errors.university = 'University is required';
      }
      if (!formData?.phoneNumber) {
        errors.phoneNumber = 'Phone number is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    onAuthenticate?.(formData);
  };

  const toggleMode = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      university: '',
      studentId: '',
      phoneNumber: ''
    });
    setValidationErrors({});
    onToggleMode?.(!isLogin);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass rounded-2xl p-8 border border-border shadow-cyber-xl neon-glow">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4 neon-glow">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">
            {isLogin ? 'Welcome Back' : 'Join HackFest'}
          </h2>
          <p className="text-muted-foreground font-inter">
            {isLogin ? 'Sign in to your account' : 'Create your participant account'}
          </p>
        </div>

        {/* Error Display */}
        {authError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm font-inter">{authError}</p>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="space-y-4">
          <GoogleOAuthButton
            onClick={onGoogleAuth}
            loading={loading}
            disabled={loading}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground font-inter">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sign Up Fields */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-inter">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData?.fullName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-inter"
                    placeholder="Enter your full name"
                  />
                </div>
                {validationErrors?.fullName && (
                  <p className="text-destructive text-xs mt-1 font-inter">{validationErrors?.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-inter">
                  University
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="university"
                    value={formData?.university}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-inter"
                    placeholder="Your university name"
                  />
                </div>
                {validationErrors?.university && (
                  <p className="text-destructive text-xs mt-1 font-inter">{validationErrors?.university}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-inter">
                  Student ID (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="studentId"
                    value={formData?.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-inter"
                    placeholder="Your student ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-inter">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData?.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-inter"
                    placeholder="+91 9876543210"
                  />
                </div>
                {validationErrors?.phoneNumber && (
                  <p className="text-destructive text-xs mt-1 font-inter">{validationErrors?.phoneNumber}</p>
                )}
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 font-inter">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                name="email"
                value={formData?.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-inter"
                placeholder="your@email.com"
              />
            </div>
            {validationErrors?.email && (
              <p className="text-destructive text-xs mt-1 font-inter">{validationErrors?.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 font-inter">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData?.password}
                onChange={handleChange}
                className="w-full pl-11 pr-11 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-inter"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors?.password && (
              <p className="text-destructive text-xs mt-1 font-inter">{validationErrors?.password}</p>
            )}
          </div>

          {/* Forgot Password (Login only) */}
          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:text-primary/80 font-inter transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 rounded-lg font-orbitron font-bold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground font-inter">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;