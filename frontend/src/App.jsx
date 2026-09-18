import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Header from './components/Header/Header';
import LoginGateway from './components/LoginGateway/LoginGateway';
import WorkplacePortal from './components/WorkplacePortal/WorkplacePortal';
import SuperAdminPortal from './components/SuperAdminPortal/SuperAdminPortal';
import FacilityAdminPortal from './components/FacilityAdminPortal/FacilityAdminPortal';
import WalkthroughSection from './components/WalkthroughSection/WalkthroughSection';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import LoginModal from './components/LoginModal/LoginModal';
import ContactModal from './components/ContactModal/ContactModal';
import ToastContainer from './components/common/Toast/Toast';

function AppContent() {
  const { user, isAuthenticated, openLogin, openConnect } = useAuth();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === 'login') openLogin();
    if (params.get('modal') === 'connect') openConnect();
  }, [openLogin, openConnect]);

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
        /* Unauthenticated: Corporate Login Gateway + How We Simplify Booking Walkthrough + Client Contact Section */
        <>
          <Header />
          <main>
            <LoginGateway />
            <WalkthroughSection />
            <Contact />
          </main>
          <Footer />
        </>
      )}

      {/* Global Modals & Notifications */}
      <LoginModal />
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
