import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ParticleBackground from './components/ParticleBackground';
import AuthCard from './components/AuthCard';
import LoadingOverlay from './components/LoadingOverlay';
import ForgotPasswordModal from './components/ForgotPasswordModal';

const AuthenticationScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Replace mock authentication with real Supabase auth
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword, authError, setAuthError } = useAuth();

  useEffect(() => {
    // Handle OAuth errors passed from callback
    if (location.state?.error) {
      setAuthError(location.state.error);
      // Clear the error from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, setAuthError, navigate, location.pathname]);

  useEffect(() => {
    // Redirect if already authenticated
    if (user && !loading) {
      // Redirect to the page they were trying to access, or dashboard
      const from = location.state?.from?.pathname || '/team-dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  const handleAuthenticate = async (authData) => {
    if (isLogin) {
      const { error } = await signIn(authData?.email, authData?.password);
      if (!error) {
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || '/team-dashboard';
        navigate(from, { replace: true });
      }
    } else {
      const { error } = await signUp(authData?.email, authData?.password, {
        fullName: authData?.fullName,
        university: authData?.university,
        studentId: authData?.studentId,
        phoneNumber: authData?.phoneNumber,
        role: 'participant'
      });

      if (!error) {
        // Show success message for signup
        alert('Account created successfully! Please check your email to verify your account.');
      }
    }
  };

  const handleToggleMode = (loginMode) => {
    setIsLogin(loginMode);
  };

  const handleGoogleAuth = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Google OAuth error:', error);
    }
    // Note: For OAuth, the redirect happens automatically
    // The user will be redirected to the callback URL after successful authentication
  };

  const handleForgotPassword = async (email) => {
    const { error } = await resetPassword(email);
    if (!error) {
      alert('Password reset email sent! Please check your inbox.');
      setShowForgotPassword(false);
    }
  };

  if (loading) {
    return <LoadingOverlay isVisible={true} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="hidden lg:block space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-orbitron font-bold text-foreground leading-tight">
                  Welcome to
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    HackFest 2024
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground font-inter leading-relaxed">
                  Join the ultimate hackathon experience. Build innovative solutions, 
                  collaborate with brilliant minds, and compete for amazing prizes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 neon-border">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-orbitron font-bold text-white">48</span>
                  </div>
                  <h3 className="font-orbitron font-bold text-foreground mb-2">Hours</h3>
                  <p className="text-sm text-muted-foreground font-inter">
                    Non-stop coding marathon
                  </p>
                </div>

                <div className="glass rounded-xl p-6 neon-border">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-orbitron font-bold text-white">₹1L</span>
                  </div>
                  <h3 className="font-orbitron font-bold text-foreground mb-2">Prize Pool</h3>
                  <p className="text-sm text-muted-foreground font-inter">
                    Exciting rewards await
                  </p>
                </div>

                <div className="glass rounded-xl p-6 neon-border">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-warning rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-orbitron font-bold text-white">500+</span>
                  </div>
                  <h3 className="font-orbitron font-bold text-foreground mb-2">Participants</h3>
                  <p className="text-sm text-muted-foreground font-inter">
                    Talented developers
                  </p>
                </div>

                <div className="glass rounded-xl p-6 neon-border">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning to-primary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-orbitron font-bold text-white">20+</span>
                  </div>
                  <h3 className="font-orbitron font-bold text-foreground mb-2">Mentors</h3>
                  <p className="text-sm text-muted-foreground font-inter">
                    Industry experts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-orbitron font-bold text-foreground">
                  Event Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-inter text-muted-foreground">
                      Registration: Dec 1-15, 2024
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm font-inter text-muted-foreground">
                      Hackathon: Dec 20-22, 2024
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm font-inter text-muted-foreground">
                      Results: Dec 23, 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Authentication Card */}
            <div className="flex items-center justify-center">
              <AuthCard
                onAuthenticate={handleAuthenticate}
                onToggleMode={handleToggleMode}
                isLogin={isLogin}
                loading={loading}
                authError={authError}
                onForgotPassword={() => setShowForgotPassword(true)}
                onGoogleAuth={handleGoogleAuth}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hero Section */}
      <div className="lg:hidden relative z-10 pt-20 pb-8 px-4">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-orbitron font-bold text-foreground">
            HackFest
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              2024
            </span>
          </h1>
          <p className="text-muted-foreground font-inter">
            Join the ultimate hackathon experience
          </p>
          
          <div className="flex justify-center space-x-6 text-center">
            <div>
              <div className="text-2xl font-orbitron font-bold text-primary">48h</div>
              <div className="text-xs text-muted-foreground font-inter">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold text-secondary">₹1L</div>
              <div className="text-xs text-muted-foreground font-inter">Prize</div>
            </div>
            <div>
              <div className="text-2xl font-orbitron font-bold text-accent">500+</div>
              <div className="text-xs text-muted-foreground font-inter">Participants</div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSubmit={handleForgotPassword}
      />


    </div>
  );
};

export default AuthenticationScreen;