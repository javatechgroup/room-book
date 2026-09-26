import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Header from './components/Header/Header';
import LoginGateway from './components/LoginGateway/LoginGateway';
import WorkplacePortal from './components/WorkplacePortal/WorkplacePortal';
import SuperAdminPortal from './components/SuperAdminPortal/SuperAdminPortal';
import FacilityAdminPortal from './components/FacilityAdminPortal/FacilityAdminPortal';
import WalkthroughSection from './components/WalkthroughSection/WalkthroughSection';
import PolicyShowcase from './components/PolicyShowcase/PolicyShowcase';
import RoleMatrix from './components/RoleMatrix/RoleMatrix';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import LoginModal from './components/LoginModal/LoginModal';
import ForgotPasswordModal from './components/ForgotPasswordModal/ForgotPasswordModal';
import ResetPasswordModal from './components/ResetPasswordModal/ResetPasswordModal';
import ContactModal from './components/ContactModal/ContactModal';
import ToastContainer from './components/common/Toast/Toast';

function AppContent() {
  const { user, isAuthenticated, openLogin, openConnect, openResetPassword } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === 'login') openLogin();
    if (params.get('modal') === 'connect') openConnect();

    const resetTokenParam = params.get('resetToken') || params.get('token');
    if (resetTokenParam) {
      openResetPassword(resetTokenParam);
    }
  }, [openLogin, openConnect, openResetPassword]);

  React.useEffect(() => {
    const handleUnauthorized = (e) => {
      const msg = e.detail?.message || 'Your session has expired. Please sign in again.';
      toast.warning('Session Expired', msg);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [toast]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isFacilityAdmin = user?.role === 'COMPANY_ADMIN';

  return (
    <div className="app">
      {isAuthenticated ? (
        /* Authenticated Session: Clean modern dashboard directly under Navbar */
        <>
          <Header />
          <main>
            {isSuperAdmin ? (
              <SuperAdminPortal />
            ) : isFacilityAdmin ? (
              <FacilityAdminPortal />
            ) : (
              <WorkplacePortal />
            )}
          </main>
          <Footer />
        </>
      ) : (
        /* Unauthenticated: Corporate Login Gateway + How It Works + Company Booking Policies + Role Portals + Contact */
        <>
          <Header />
          <main>
            <LoginGateway />
            <WalkthroughSection />
            <PolicyShowcase />
            <RoleMatrix />
            <Contact />
          </main>
          <Footer />
        </>
      )}

      {/* Global Modals & Notifications */}
      <LoginModal />
      <ForgotPasswordModal />
      <ResetPasswordModal />
      <ContactModal />
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AppContent />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
