import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import UserBanner from './components/UserBanner/UserBanner';
import LoginGateway from './components/LoginGateway/LoginGateway';
import WorkplacePortal from './components/WorkplacePortal/WorkplacePortal';
import WalkthroughSection from './components/WalkthroughSection/WalkthroughSection';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import LoginModal from './components/LoginModal/LoginModal';
import ContactModal from './components/ContactModal/ContactModal';
import './App.css';

function AppContent() {
  const { isAuthenticated, openLogin, openConnect } = useAuth();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === 'login') openLogin();
    if (params.get('modal') === 'connect') openConnect();
  }, [openLogin, openConnect]);

  return (
    <div className="app">
      {isAuthenticated ? (
        /* Authenticated: Workplace Portal with Full Capabilities */
        <>
          <Header />
          <UserBanner />
          <main>
            <WorkplacePortal />
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

      {/* Global Modals */}
      <LoginModal />
      <ContactModal />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
