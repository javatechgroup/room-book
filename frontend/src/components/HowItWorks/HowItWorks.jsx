import React from 'react';
import { ChevronRight } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Subscribe & Onboard',
    description: 'Contact us to set up your organization. We\'ll create your workspace and admin account in minutes.',
  },
  {
    number: '02',
    title: 'Configure Your Rooms',
    description: 'Add your conference rooms, board rooms, and huddle spaces with capacity, floor, and amenity details.',
  },
  {
    number: '03',
    title: 'Invite Your Team',
    description: 'Add departments and employees. Everyone gets access to search rooms and book meetings instantly.',
  },
  {
    number: '04',
    title: 'Book Meetings',
    description: 'Search for available rooms, pick a time slot, invite participants, and confirm \u2014 all in a few clicks.',
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Get Started in 4 Simple Steps</h2>
          <p className="section-subtitle">
            From sign-up to your first meeting room booking \u2014 it takes less than 10 minutes.
          </p>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={s.number}>
              <div className="step__number">{s.number}</div>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__desc">{s.description}</p>
              {i < steps.length - 1 && <ChevronRight className="step__arrow" size={24} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
