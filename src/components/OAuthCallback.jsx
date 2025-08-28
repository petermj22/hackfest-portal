import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../pages/authentication-screen/components/LoadingOverlay';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for error parameters in URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription || 'Authentication failed');
          
          // Redirect to auth screen with error after a delay
          setTimeout(() => {
            navigate('/authentication-screen', { 
              state: { error: errorDescription || 'Authentication failed' } 
            });
          }, 3000);
          return;
        }

        // Check for access token or code (successful OAuth)
        const accessToken = searchParams.get('access_token');
        const code = searchParams.get('code');
        
        if (accessToken || code) {
          // OAuth was successful, wait for user to be set by AuthContext
          // The AuthContext will handle the session and redirect
          return;
        }

        // If no error and no success params, redirect to auth
        navigate('/authentication-screen');
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/authentication-screen', { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && !loading) {
      navigate('/team-dashboard');
    }
  }, [user, loading, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 border border-border shadow-cyber-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-orbitron font-bold text-foreground mb-2">
            Authentication Failed
          </h2>
          <p className="text-muted-foreground font-inter mb-4">
            {error}
          </p>
          <p className="text-sm text-muted-foreground font-inter">
            Redirecting to sign-in page...
          </p>
        </div>
      </div>
    );
  }

  return <LoadingOverlay isVisible={true} />;
};

export default OAuthCallback;
