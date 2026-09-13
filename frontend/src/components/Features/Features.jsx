import React from 'react';
import {
  CalendarCheck,
  Building2,
  Sparkles,
  Shield,
  Clock,
  Monitor,
} from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: CalendarCheck,
    title: 'Real-Time Physical Slot Check',
    description:
      'Verify live availability for any company conference room, boardroom, or focus pod before reserving.',
    color: '#3b82f6',
  },
  {
    icon: Sparkles,
    title: 'Smart Alternative Room Finder',
    description:
      'When your preferred room is occupied, get instant suggestions for matching available rooms across your company floors.',
    color: '#8b5cf6',
  },
  {
    icon: Clock,
    title: 'Next-Available Slot Suggestions',
    description:
      'Avoid endless calendar searching. The system automatically computes and suggests the earliest next open slot for the busy room.',
    color: '#10b981',
  },
  {
    icon: Monitor,
    title: 'Room Equipment & Capacity',
    description:
      'Browse physical rooms equipped with video bars, displays, whiteboards, and exact seating capacities.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Strict Anti-Overlap Enforcement',
    description:
      'Prevents double-bookings and scheduling collisions with slot validation and company-defined duration limits.',
    color: '#ef4444',
  },
  {
    icon: Building2,
    title: 'Multi-Floor Office Administration',
    description:
      'Facility managers and admins can manage physical rooms, schedule maintenance, and enforce booking policies.',
    color: '#06b6d4',
  },
];

function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Room Management</span>
          <h2 className="section-title">Built for Company Physical Meeting Rooms</h2>
          <p className="section-subtitle">
            Eliminate room collisions, optimize physical office spaces, and find open slots or alternatives in seconds.
          </p>
        </div>
        <div className="features__grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div
                className="feature-card__icon"
                style={{ backgroundColor: `${f.color}15`, color: f.color }}
              >
                <f.icon size={24} />
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
