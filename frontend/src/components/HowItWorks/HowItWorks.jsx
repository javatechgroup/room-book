import React from 'react';
import { ChevronRight } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Select Room & Slot',
    description: 'Pick your office floor, target physical meeting room, date, and desired time slot.',
  },
  {
    number: '02',
    title: 'Live Availability Check',
    description: 'The system validates real-time physical room schedules to ensure zero overlapping reservations.',
  },
  {
    number: '03',
    title: 'Book Instantly if Vacant',
    description: 'If the room is open during your slot, lock in your reservation with one click.',
  },
  {
    number: '04',
    title: 'Smart Suggestions if Busy',
    description: 'If occupied, immediately view the room\'s next open slot or book a recommended alternative room.',
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Booking Flow</span>
          <h2 className="section-title">How Physical Room Booking Works</h2>
          <p className="section-subtitle">
            A fast, conflict-free workflow to find open room slots or discover smart alternatives in seconds.
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
