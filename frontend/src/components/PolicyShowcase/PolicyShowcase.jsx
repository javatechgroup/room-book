import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Users,
  Building,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import './PolicyShowcase.css';

const POLICY_PRESETS = {
  balanced: {
    name: 'Corporate Standard',
    tagline: 'Balanced configuration for mid to large enterprises',
    maxAdvanceDays: 30,
    minDuration: 30,
    maxDuration: 4,
    cancellationCutoff: 30,
  },
  highTurnover: {
    name: 'High-Turnover Campus',
    tagline: 'Optimized for high-velocity teams and fast room turnover',
    maxAdvanceDays: 14,
    minDuration: 15,
    maxDuration: 2,
    cancellationCutoff: 15,
  },
  executive: {
    name: 'Executive & Boardrooms',
    tagline: 'Extended planning windows for quarterly and board meetings',
    maxAdvanceDays: 60,
    minDuration: 60,
    maxDuration: 8,
    cancellationCutoff: 60,
  },
};

export default function PolicyShowcase() {
  const [activePresetKey, setActivePresetKey] = useState('balanced');
  const activePreset = POLICY_PRESETS[activePresetKey];

  return (
    <section className="policy-showcase" id="booking-policies">
      <div className="container">
        {/* Section Header */}
        <div className="policy-header">
          <span className="section-tag section-tag--primary">
            <ShieldCheck size={14} /> Corporate Governance & Fair Use
          </span>
          <h2 className="policy-title">
            Company-Level Booking Policies Enforced in Real-Time
          </h2>
          <p className="policy-subtitle">
            Say goodbye to room squatting, all-day room hogging, and ghost meetings.
            Every company defines its own automated booking guardrails, which our backend engine
            strictly validates before any reservation is approved.
          </p>
        </div>

        {/* 4 Core Company Policies Grid */}
        <div className="policy-cards-grid">
          {/* Card 1: Max Advance Window */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--blue">
              <Calendar size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Anti-Squatting</div>
              <h3 className="policy-card__title">Maximum Advance Booking Window</h3>
              <p className="policy-card__desc">
                Sets a maximum forward limit (e.g. 14 to 60 days). Employees cannot hoard
                prime boardrooms quarters in advance for tentative discussions.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Prevents calendar lock-up & keeps slots open for active sprints</span>
              </div>
            </div>
          </div>

          {/* Card 2: Duration Limits */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--amber">
              <Clock size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Anti-Hogging</div>
              <h3 className="policy-card__title">Meeting Duration Guardrails</h3>
              <p className="policy-card__desc">
                Enforces minimum slots (e.g. 15–30 min) to avoid fragmented schedules, and caps single reservations
                (e.g. max 4 hours) to stop solo room monopolization.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Guarantees healthy room turnover across all departments</span>
              </div>
            </div>
          </div>

          {/* Card 3: Cancellation Cutoff */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--emerald">
              <RotateCcw size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Ghost-Meeting Prevention</div>
              <h3 className="policy-card__title">Automated Cancellation Cutoff</h3>
              <p className="policy-card__desc">
                Requires cancellations to occur before a defined threshold (e.g. 30 min before start).
                Abandoned slots are promptly returned to the company-wide pool.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Recovers empty rooms so waiting colleagues can book immediately</span>
              </div>
            </div>
          </div>

          {/* Card 4: Role & Capacity Governance */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--purple">
              <Users size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Smart Allocation</div>
              <h3 className="policy-card__title">Attendee Capacity & Floor Governance</h3>
              <p className="policy-card__desc">
                Facility administrators configure room sizes, wings, and attendee minimums, ensuring small 2-person
                chats are guided toward Focus Pods instead of large Boardrooms.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Optimizes physical office real estate & energy footprint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Policy Simulation Widget */}
        <div className="policy-simulator">
          <div className="policy-simulator__top">
            <div className="policy-simulator__header">
              <Sliders size={20} className="simulator-icon" />
              <div>
                <h4>Interactive Policy Preview: See Company Guardrails in Action</h4>
                <p>Toggle between company profiles to see how the system validates booking constraints:</p>
              </div>
            </div>

            {/* Presets Tabs */}
            <div className="policy-presets-bar">
              {Object.entries(POLICY_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  className={`preset-btn ${activePresetKey === key ? 'preset-btn--active' : ''}`}
                  onClick={() => setActivePresetKey(key)}
                >
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Preset Inspector */}
          <div className="policy-simulator__body">
            <div className="policy-simulator__rules-summary">
              <div className="policy-rule-pill">
                <span className="rule-label">Max Advance Window</span>
                <span className="rule-value">{activePreset.maxAdvanceDays} Days</span>
                <span className="rule-tag">Booking limit</span>
              </div>
              <div className="policy-rule-pill">
                <span className="rule-label">Min Slot Duration</span>
                <span className="rule-value">{activePreset.minDuration} Mins</span>
                <span className="rule-tag">No fragmentation</span>
              </div>
              <div className="policy-rule-pill">
                <span className="rule-label">Max Slot Duration</span>
                <span className="rule-value">{activePreset.maxDuration} Hours</span>
                <span className="rule-tag">Anti-hogging cap</span>
              </div>
              <div className="policy-rule-pill">
                <span className="rule-label">Cancellation Cutoff</span>
                <span className="rule-value">{activePreset.cancellationCutoff} Mins</span>
                <span className="rule-tag">Ghost prevention</span>
              </div>
            </div>

            {/* Live Enforcement Feedback Card */}
            <div className="policy-validation-box">
              <div className="validation-header">
                <span className="live-badge">Automated Policy Enforcement Check</span>
                <span className="preset-caption">{activePreset.tagline}</span>
              </div>

              <div className="validation-scenarios">
                <div className="scenario-item scenario-item--success">
                  <CheckCircle2 size={18} className="scenario-icon" />
                  <div className="scenario-text">
                    <strong>2-Hour Team Standup for Next Thursday (Floor 2, Focus Pod 201)</strong>
                    <p>✓ Within {activePreset.maxAdvanceDays}-day limit • Duration ≤ {activePreset.maxDuration}h • Allowed & Approved instantly</p>
                  </div>
                </div>

                <div className="scenario-item scenario-item--denied">
                  <AlertTriangle size={18} className="scenario-icon" />
                  <div className="scenario-text">
                    <strong>Attempting to Book 5-Hour Slot 90 Days in Advance</strong>
                    <p>✕ Exceeds max {activePreset.maxDuration}h limit & exceeds {activePreset.maxAdvanceDays}-day window • Blocked with friendly guidance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="policy-simulator__footer">
            <Info size={15} />
            <span>Facility Admins can customize these exact thresholds anytime inside their company admin dashboard.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
