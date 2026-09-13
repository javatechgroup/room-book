import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="container hero__content">
        <div className="hero__badge">
          <Star size={14} />
          <span>Trusted by 500+ Organizations</span>
        </div>
        <h1 className="hero__title">
          Book Meeting Rooms <br />
          <span className="hero__title--accent">In Seconds, Not Minutes</span>
        </h1>
        <p className="hero__subtitle">
          Stop the back-and-forth emails. Find available meeting rooms, reserve them
          instantly, invite participants, and get automatic reminders — all from one dashboard.
        </p>
        <div className="hero__actions">
          <a href="#contact" className="btn btn--primary btn--lg">
            Start Free Trial <ArrowRight size={18} />
          </a>
          <a href="#features" className="btn btn--outline btn--lg">
            Explore Features
          </a>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-value">10K+</span>
            <span className="hero__stat-label">Meetings Booked Daily</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">500+</span>
            <span className="hero__stat-label">Organizations</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">99.9%</span>
            <span className="hero__stat-label">Uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
