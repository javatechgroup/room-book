import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header/Header';
import UserBanner from './components/UserBanner/UserBanner';
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import HowItWorks from './components/HowItWorks/HowItWorks';
import Pricing from './components/Pricing/Pricing';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import LoginModal from './components/LoginModal/LoginModal';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <UserBanner />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Pricing />
          <Contact />
        </main>
        <Footer />
        <LoginModal />
      </div>
    </AuthProvider>
  );
}

export default App;
