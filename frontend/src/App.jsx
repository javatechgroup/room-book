import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import UserBanner from './components/UserBanner/UserBanner';
import HomeHub from './components/HomeHub/HomeHub';
import RoomAvailability from './components/RoomAvailability/RoomAvailability';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import LoginModal from './components/LoginModal/LoginModal';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      <Header />
      <UserBanner />
      <main>
        {isAuthenticated ? (
          /* Authenticated Workplace Portal: Direct Access to Physical Room Booking */
          <div className="portal-container">
            <RoomAvailability />
            <Contact />
          </div>
        ) : (
          /* Internal Campus Home Hub */
          <>
            <HomeHub />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      <LoginModal />
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
