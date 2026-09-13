import React from 'react';
import { Building2, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Hero.css';

function Hero() {
  const { isAuthenticated, openLogin } = useAuth();

  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="container hero__content">
        <div className="hero__badge">
          <Building2 size={14} />
          <span>Internal Physical Room Management System</span>
        </div>
        <h1 className="hero__title">
          Manage Meeting Rooms <br />
          <span className="hero__title--accent">& Smart Slot Availability</span>
        </h1>
        <p className="hero__subtitle">
          Easily check real-time availability of physical meeting rooms across your company floors.
          Book your slot instantly if free, or get smart suggestions for the next available time
          and alternate available rooms when slots are occupied.
        </p>
        <div className="hero__actions">
          <button type="button" className="btn btn--primary btn--lg" onClick={openLogin}>
            <Calendar size={18} /> Sign In to Book a Room
          </button>
          <a href="#how-it-works" className="btn btn--outline btn--lg">
            How Suggestions Work
          </a>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-value">100%</span>
            <span className="hero__stat-label">Conflict-Free Slots</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">Instant</span>
            <span className="hero__stat-label">Next-Slot & Alt Suggestions</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">Multi-Floor</span>
            <span className="hero__stat-label">Physical Room Inventory</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
