import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import EventUpdatesHub from './pages/event-updates-hub';
import TeamRegistrationForm from './pages/team-registration-form';
import AuthenticationScreen from './pages/authentication-screen';
import AdminManagementPanel from './pages/admin-management-panel';
import PaymentProcessingScreen from './pages/payment-processing-screen';
import TeamDashboard from './pages/team-dashboard';
import OAuthCallback from './components/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
            {/* Define your route here */}
            <Route path="/" element={<AdminManagementPanel />} />
            <Route path="/event-updates-hub" element={<EventUpdatesHub />} />
            <Route path="/team-registration-form" element={
              <ProtectedRoute>
                <TeamRegistrationForm />
              </ProtectedRoute>
            } />
            <Route path="/authentication-screen" element={
              <ProtectedRoute requireAuth={false}>
                <AuthenticationScreen />
              </ProtectedRoute>
            } />
            <Route path="/admin-management-panel" element={
              <ProtectedRoute>
                <AdminManagementPanel />
              </ProtectedRoute>
            } />
            <Route path="/payment-processing-screen" element={
              <ProtectedRoute>
                <PaymentProcessingScreen />
              </ProtectedRoute>
            } />
            <Route path="/team-dashboard" element={
              <ProtectedRoute>
                <TeamDashboard />
              </ProtectedRoute>
            } />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
