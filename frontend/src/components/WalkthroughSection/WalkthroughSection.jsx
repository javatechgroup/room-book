import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Layers,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './WalkthroughSection.css';

export default function WalkthroughSection() {
  const { openLogin } = useAuth();
  // Interactive state for the live flow simulation
  const [simulationState, setSimulationState] = useState('occupied'); // 'available' or 'occupied'

  const handleScrollToLogin = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      openLogin();
    } else {
      const el = document.getElementById('login-gateway');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const input = document.getElementById('corp-email');
          if (input) input.focus();
        }, 500);
      }
    }
  };

  return (
    <section className="walkthrough-section" id="how-it-works">
      <div className="container">
        {/* Section Header */}
        <div className="walkthrough-header">
          <span className="section-tag section-tag--primary">
            <Sparkles size={14} /> The Booking Workflow
          </span>
          <h2 className="walkthrough-title">
            How We Simplify Physical Room Booking
          </h2>
          <p className="walkthrough-subtitle">
            Say goodbye to room clashes, spreadsheet sign-ups, and wandering corridors. 
            Here is how employees and teams secure physical company meeting spaces in seconds.
          </p>
        </div>

        {/* 3 Steps Overview Grid */}
        <div className="walkthrough-steps">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-card__badge">Step 1</div>
            <div className="step-card__icon">
              <Calendar size={24} />
            </div>
            <h3 className="step-card__title">Choose Slot & Campus Floor</h3>
            <p className="step-card__description">
              Select the desired date, meeting duration, and floor. The system immediately checks real-time slot occupancy across company physical rooms.
            </p>
            <div className="step-card__meta">
              <span>✓ Instant real-time scan</span>
              <span>✓ Floor 1 to Floor 4 coverage</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-card step-card--highlight">
            <div className="step-card__badge">Step 2</div>
            <div className="step-card__icon">
              <Sparkles size={24} />
            </div>
            <h3 className="step-card__title">Instant Lock or Smart Suggestions</h3>
            <p className="step-card__description">
              If the room is open, lock the slot with 1 click. If it is already booked, our engine immediately provides the room’s <strong>next availability</strong> and <strong>alternative rooms</strong>.
            </p>
            <div className="step-card__meta">
              <span>✓ Next available time recommendation</span>
              <span>✓ Same-slot alternate room options</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-card__badge">Step 3</div>
            <div className="step-card__icon">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="step-card__title">Zero Double-Bookings Guaranteed</h3>
            <p className="step-card__description">
              Once reserved, the slot is locked company-wide. No overlapping meetings, no disputes at the door, and full visibility for facility managers.
            </p>
            <div className="step-card__meta">
              <span>✓ Conflict-free reservation</span>
              <span>✓ Seamless team collaboration</span>
            </div>
          </div>
        </div>

        {/* Interactive Simulation Sandbox */}
        <div className="walkthrough-sim">
          <div className="sim-header">
            <div className="sim-header__title">
              <span className="sim-live-indicator"></span>
              <h4>Live Workflow Demonstration: See The Engine In Action</h4>
            </div>
            <div className="sim-toggle-group">
              <button
                type="button"
                className={`sim-toggle-btn ${simulationState === 'available' ? 'sim-toggle-btn--active' : ''}`}
                onClick={() => setSimulationState('available')}
              >
                <CheckCircle2 size={16} />
                Scenario A: Room Is Available
              </button>
              <button
                type="button"
                className={`sim-toggle-btn ${simulationState === 'occupied' ? 'sim-toggle-btn--active' : ''}`}
                onClick={() => setSimulationState('occupied')}
              >
                <AlertTriangle size={16} />
                Scenario B: Room Is Occupied (Smart Suggestions)
              </button>
            </div>
          </div>

          <div className="sim-body">
            {/* Input Context Box */}
            <div className="sim-context-bar">
              <div className="sim-context-item">
                <span className="label">Target Room</span>
                <span className="val"><Building2 size={15} /> Focus Pod 201</span>
              </div>
              <div className="sim-context-item">
                <span className="label">Location</span>
                <span className="val"><MapPin size={15} /> Floor 2 • East Wing</span>
              </div>
              <div className="sim-context-item">
                <span className="label">Requested Slot</span>
                <span className="val"><Clock size={15} /> Today, 10:00 AM – 11:00 AM</span>
              </div>
              <div className="sim-context-item">
                <span className="label">Capacity</span>
                <span className="val"><Users size={15} /> 4 Persons</span>
              </div>
            </div>

            {/* Scenario A: Available */}
            {simulationState === 'available' && (
              <div className="sim-result sim-result--available">
                <div className="sim-status-banner sim-status-banner--success">
                  <CheckCircle2 size={22} />
                  <div>
                    <strong>Slot is Available & Open for Reservation!</strong>
                    <p>Focus Pod 201 has no conflicting bookings for 10:00 AM – 11:00 AM.</p>
                  </div>
                </div>

                <div className="sim-available-card">
                  <div className="sim-room-detail">
                    <h5>Focus Pod 201 is ready for your team</h5>
                    <p>Equipped with 4K Video Display, Digital Whiteboard, and High-Speed LAN.</p>
                  </div>
                  <div className="sim-action-area">
                    <button type="button" className="btn btn--primary btn--sm" disabled>
                      <CheckCircle2 size={16} /> Confirm & Lock Slot
                    </button>
                    <span className="sim-note">Guaranteed conflict-free. Automatically registered to campus directory.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Scenario B: Occupied with Smart Suggestions */}
            {simulationState === 'occupied' && (
              <div className="sim-result sim-result--occupied">
                <div className="sim-status-banner sim-status-banner--warning">
                  <AlertTriangle size={22} />
                  <div>
                    <strong>Slot Occupied: Focus Pod 201 is currently reserved</strong>
                    <p>Reserved by <em>Engineering Sprint Planning (10:00 AM – 11:00 AM)</em>. Our engine suggests the following options:</p>
                  </div>
                </div>

                <div className="sim-suggestions-grid">
                  {/* Suggestion 1: Next Available Slot for the Same Room */}
                  <div className="suggestion-box suggestion-box--next-time">
                    <div className="suggestion-box__header">
                      <Clock size={18} className="suggestion-icon" />
                      <div>
                        <h6>Option 1: Next Open Slot for This Room</h6>
                        <span className="suggestion-sub">Wait for Focus Pod 201 to open</span>
                      </div>
                    </div>
                    <div className="suggestion-box__body">
                      <div className="slot-pill slot-pill--recommended">
                        <strong>Today, 11:30 AM – 12:30 PM</strong>
                        <span className="pill-badge">Open Right After Current Meeting</span>
                      </div>
                      <p className="suggestion-text">
                        The room will be cleaned and ready at 11:30 AM. You can book this slot directly without re-entering details.
                      </p>
                      <a href="#login-gateway" className="suggestion-action-btn" onClick={handleScrollToLogin}>
                        Select This Slot <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>

                  {/* Suggestion 2: Other Available Rooms in the Same Slot */}
                  <div className="suggestion-box suggestion-box--alt-rooms">
                    <div className="suggestion-box__header">
                      <Layers size={18} className="suggestion-icon" />
                      <div>
                        <h6>Option 2: Other Available Rooms Right Now</h6>
                        <span className="suggestion-sub">Keep your 10:00 AM – 11:00 AM schedule</span>
                      </div>
                    </div>
                    <div className="suggestion-box__body">
                      <div className="alt-rooms-list">
                        <div className="alt-room-row">
                          <div className="alt-room-info">
                            <strong>Team Room 204</strong>
                            <span>Floor 2 • 8 Seats • Projector & Screen</span>
                          </div>
                          <span className="status-chip status-chip--free">Available Now</span>
                        </div>
                        <div className="alt-room-row">
                          <div className="alt-room-info">
                            <strong>Focus Pod 302</strong>
                            <span>Floor 3 • 4 Seats • 4K Screen</span>
                          </div>
                          <span className="status-chip status-chip--free">Available Now</span>
                        </div>
                        <div className="alt-room-row">
                          <div className="alt-room-info">
                            <strong>Boardroom 401</strong>
                            <span>Floor 4 • 16 Seats • Full Conference Setup</span>
                          </div>
                          <span className="status-chip status-chip--free">Available Now</span>
                        </div>
                      </div>
                      <a href="#login-gateway" className="suggestion-action-btn" onClick={handleScrollToLogin}>
                        Switch Room for 10:00 AM <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Strip */}
        <div className="walkthrough-stats">
          <div className="stat-box">
            <span className="stat-box__value">0%</span>
            <span className="stat-box__label">Double-Booking Clashes</span>
          </div>
          <div className="stat-box">
            <span className="stat-box__value">&lt; 10s</span>
            <span className="stat-box__label">To Find & Reserve a Free Space</span>
          </div>
          <div className="stat-box">
            <span className="stat-box__value">100%</span>
            <span className="stat-box__label">Internal Physical Room Visibility</span>
          </div>
          <div className="stat-box">
            <span className="stat-box__value">2-Way</span>
            <span className="stat-box__label">Smart Suggestions (Next Slot + Other Rooms)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
