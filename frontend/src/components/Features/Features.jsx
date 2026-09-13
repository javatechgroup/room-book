import React from 'react';
import { CalendarCheck, Building2, Users, Shield, Clock, Bell } from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: CalendarCheck,
    title: 'Instant Room Booking',
    description:
      'See which meeting rooms are free right now. Reserve a conference room in one click — no double-bookings, ever.',
    color: '#3b82f6',
  },
  {
    icon: Building2,
    title: 'Multi-Company Ready',
    description:
      'Perfect for co-working spaces or enterprises with multiple offices. Each organization gets its own isolated workspace.',
    color: '#8b5cf6',
  },
  {
    icon: Users,
    title: 'Invite Participants',
    description:
      'Add colleagues to your meeting invite. Everyone gets notified with room details, time, and agenda automatically.',
    color: '#10b981',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Admins manage rooms and policies. Employees book and view availability. Every action secured with JWT authentication.',
    color: '#f59e0b',
  },
  {
    icon: Clock,
    title: 'Custom Booking Policies',
    description:
      'Set max meeting duration, advance booking limits, and cancellation windows to match how your organization works.',
    color: '#ef4444',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Automatic email alerts when meetings are booked, rescheduled, or cancelled. No one misses a meeting again.',
    color: '#06b6d4',
  },
];

function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">Everything You Need to Manage Meeting Rooms</h2>
          <p className="section-subtitle">
            End scheduling chaos. One platform to find, book, and manage every conference room across your organization.
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
