import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Hourglass,
  ArrowRight,
  Info,
} from 'lucide-react';
import './PolicyShowcase.css';

// Company-level policy archetypes (applied company-wide to all rooms of that tenant)
const POLICY_PRESETS = {
  standard: {
    name: 'Standard Corporate',
    tagline: 'Balanced company-wide policy for regular enterprise workflows',
    maxAdvanceDays: 30,
    minDuration: 30,
    maxDuration: 4,
    cancellationCutoff: 30,
  },
  strict: {
    name: 'High-Demand / Strict',
    tagline: 'High-turnover policy for companies with high meeting space contention',
    maxAdvanceDays: 14,
    minDuration: 15,
    maxDuration: 2,
    cancellationCutoff: 15,
  },
  flexible: {
    name: 'Flexible Enterprise',
    tagline: 'Extended planning horizons for companies with long-range projects',
    maxAdvanceDays: 60,
    minDuration: 30,
    maxDuration: 6,
    cancellationCutoff: 45,
  },
};

export default function PolicyShowcase() {
  const [activePresetKey, setActivePresetKey] = useState('standard');
  const activePreset = POLICY_PRESETS[activePresetKey];

  return (
    <section className="policy-showcase" id="booking-policies">
      <div className="container">
        {/* Section Header */}
        <div className="policy-header">
          <span className="section-tag section-tag--primary">
            <ShieldCheck size={14} /> Company-Level Governance
          </span>
          <h2 className="policy-title">
            Company Booking Policies Enforced in Real-Time
          </h2>
          <p className="policy-subtitle">
            Every company defines its own global booking guardrails. Our backend engine
            strictly validates every reservation against these 4 company-wide policy rules before confirming any slot.
          </p>
        </div>

        {/* The 4 Exact Company Policy Rules (1:1 with BookingPolicy entity) */}
        <div className="policy-cards-grid">
          {/* Rule 1: Max Advance Window */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--blue">
              <Calendar size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Anti-Squatting</div>
              <h3 className="policy-card__title">Maximum Advance Booking Window</h3>
              <p className="policy-card__desc">
                Restricts how far in advance employees can reserve any room (e.g. 14 to 60 days max).
                Prevents room squatting for tentative meetings months down the road.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Stops date hoarding; preserves slots for active projects</span>
              </div>
            </div>
          </div>

          {/* Rule 2: Minimum Duration */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--emerald">
              <Hourglass size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Schedule Integrity</div>
              <h3 className="policy-card__title">Minimum Booking Duration</h3>
              <p className="policy-card__desc">
                Sets a baseline slot threshold (e.g. 15 or 30 minutes). Prevents micro-fragmentation
                that leaves awkward, unusable 5-minute gaps in company schedules.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Prevents fragmented, orphaned calendar gaps</span>
              </div>
            </div>
          </div>

          {/* Rule 3: Maximum Duration */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--amber">
              <Clock size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Anti-Hogging</div>
              <h3 className="policy-card__title">Maximum Booking Duration</h3>
              <p className="policy-card__desc">
                Imposes a firm cap on single reservations (e.g. 2 to 6 hours max). Stops individuals
                from monopolizing rooms for entire days and locking out coworkers.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Guarantees fair room rotation across all departments</span>
              </div>
            </div>
          </div>

          {/* Rule 4: Cancellation Cutoff */}
          <div className="policy-card">
            <div className="policy-card__icon-wrapper policy-card__icon--purple">
              <RotateCcw size={22} />
            </div>
            <div className="policy-card__content">
              <div className="policy-card__badge">Ghost Prevention</div>
              <h3 className="policy-card__title">Cancellation Cutoff Window</h3>
              <p className="policy-card__desc">
                Requires cancellations to occur before a set cutoff (e.g. 15 to 45 min prior to meeting start).
                Abandoned slots are promptly returned to the company pool.
              </p>
              <div className="policy-card__impact">
                <CheckCircle2 size={15} />
                <span>Auto-recovers unused rooms for waiting colleagues</span>
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
                <h4>Interactive Company Policy Preview</h4>
                <p>Toggle between company profiles to see how the system enforces these 4 global rules:</p>
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
                <span className="rule-tag">maxAdvanceBookingDays</span>
              </div>
              <div className="policy-rule-pill">
                <span className="rule-label">Min Slot Duration</span>
                <span className="rule-value">{activePreset.minDuration} Mins</span>
                <span className="rule-tag">minBookingDurationMinutes</span>
              </div>
              <div className="policy-rule-pill">
                <span className="rule-label">Max Slot Duration</span>
                <span className="rule-value">{activePreset.maxDuration} Hours</span>
                <span className="rule-tag">maxBookingDurationHours</span>
              </div>
              <div className="policy-rule-pill">
                <span className="rule-label">Cancellation Cutoff</span>
                <span className="rule-value">{activePreset.cancellationCutoff} Mins</span>
                <span className="rule-tag">cancellationCutoffMinutes</span>
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
                    <strong>2-Hour Team Standup for Next Thursday</strong>
                    <p>✓ Within {activePreset.maxAdvanceDays}-day limit • Duration ≤ {activePreset.maxDuration}h • Approved instantly</p>
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
            <span>Facility Admins configure these 4 company-wide thresholds in the admin portal. They apply uniformly to all meeting spaces in the company.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
