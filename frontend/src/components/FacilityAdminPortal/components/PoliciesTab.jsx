import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Save,
  Info,
  Sliders,
  Building,
} from 'lucide-react';
import { facilityApi } from '../../../api/facilityApi';
import { useToast } from '../../../context/ToastContext';

const DEFAULT_POLICY = {
  maxAdvanceBookingDays: 30,
  minBookingDurationMinutes: 30,
  maxBookingDurationHours: 4,
  cancellationCutoffMinutes: 30,
};

export default function PoliciesTab({ companyId, companyName }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [originalPolicy, setOriginalPolicy] = useState(DEFAULT_POLICY);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchPolicy();
  }, [companyId]);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await facilityApi.getBookingPolicy(companyId ? { companyId } : {});
      if (res.success && res.data) {
        setPolicy({
          maxAdvanceBookingDays: res.data.maxAdvanceBookingDays ?? 30,
          minBookingDurationMinutes: res.data.minBookingDurationMinutes ?? 30,
          maxBookingDurationHours: res.data.maxBookingDurationHours ?? 4,
          cancellationCutoffMinutes: res.data.cancellationCutoffMinutes ?? 30,
        });
        setOriginalPolicy({
          maxAdvanceBookingDays: res.data.maxAdvanceBookingDays ?? 30,
          minBookingDurationMinutes: res.data.minBookingDurationMinutes ?? 30,
          maxBookingDurationHours: res.data.maxBookingDurationHours ?? 4,
          cancellationCutoffMinutes: res.data.cancellationCutoffMinutes ?? 30,
        });
        if (res.data.updatedAt) {
          setLastUpdated(res.data.updatedAt);
        }
      }
    } catch (err) {
      console.error('Failed to load booking policy', err);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    policy.maxAdvanceBookingDays !== originalPolicy.maxAdvanceBookingDays ||
    policy.minBookingDurationMinutes !== originalPolicy.minBookingDurationMinutes ||
    policy.maxBookingDurationHours !== originalPolicy.maxBookingDurationHours ||
    policy.cancellationCutoffMinutes !== originalPolicy.cancellationCutoffMinutes;

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        companyId,
        maxAdvanceBookingDays: Number(policy.maxAdvanceBookingDays),
        minBookingDurationMinutes: Number(policy.minBookingDurationMinutes),
        maxBookingDurationHours: Number(policy.maxBookingDurationHours),
        cancellationCutoffMinutes: Number(policy.cancellationCutoffMinutes),
      };

      const res = await facilityApi.updateBookingPolicy(payload, companyId ? { companyId } : {});
      if (res.success) {
        toast.success('Policy Updated', 'Company booking policies saved successfully.');
        setOriginalPolicy({ ...policy });
        setLastUpdated(new Date().toISOString());
      } else {
        toast.error('Update Failed', res.error || 'Failed to save booking policy.');
      }
    } catch (err) {
      toast.error('Error', err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setPolicy({ ...DEFAULT_POLICY });
  };

  const handleDiscard = () => {
    setPolicy({ ...originalPolicy });
  };

  if (loading) {
    return (
      <div className="policy-loading-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="btn-spinner" style={{ margin: '0 auto 16px', width: '28px', height: '28px' }} />
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>
          Loading active company booking policies...
        </p>
      </div>
    );
  }

  return (
    <div className="policies-tab-container">
      {/* Policy Header Banner */}
      <div className="policy-header-banner">
        <div className="policy-header-banner__info">
          <div className="policy-header-banner__title-row">
            <div className="policy-header-banner__icon">
              <ShieldCheck size={20} />
            </div>
            <h2 className="policy-header-banner__title">
              Company Booking Policies
            </h2>
            {companyName && (
              <span className="policy-header-banner__badge">
                <Building size={12} /> {companyName}
              </span>
            )}
          </div>
          <p className="policy-header-banner__desc">
            Configure reservation boundaries, duration limits, and cancellation windows for your workplace.
            Rules are enforced in real-time across all employee bookings.
          </p>
        </div>

        <div className="policy-header-banner__actions">
          {hasChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="btn btn--outline"
              disabled={saving}
            >
              Discard Changes
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="btn btn--primary"
            disabled={!hasChanges || saving}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Policy Changes'}
          </button>
        </div>
      </div>

      <div className="policy-content-grid">
        {/* Left Column: Interactive Settings Cards */}
        <div className="policy-settings-col">
          {/* Setting 1: Advance Booking Window */}
          <div className="policy-card">
            <div className="policy-card__header">
              <div className="policy-card__title-group">
                <div className="policy-card__icon policy-card__icon--green">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="policy-card__title">
                    Maximum Advance Booking Window
                  </h3>
                  <span className="policy-card__desc">
                    How far into the future employees are permitted to schedule meetings.
                  </span>
                </div>
              </div>
              <div className="policy-card__value-badge">
                <span className="policy-card__value-num">
                  {policy.maxAdvanceBookingDays}
                </span>
                <span className="policy-card__value-unit">days</span>
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div className="policy-presets--days">
              {[7, 14, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setPolicy({ ...policy, maxAdvanceBookingDays: days })}
                  className={`policy-preset-btn ${policy.maxAdvanceBookingDays === days ? 'policy-preset-btn--active' : ''}`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <input
              type="range"
              min="1"
              max="180"
              value={policy.maxAdvanceBookingDays}
              onChange={(e) => setPolicy({ ...policy, maxAdvanceBookingDays: Number(e.target.value) })}
              className="policy-slider"
            />
            <div className="policy-slider-legend">
              <span>1 Day (Next day only)</span>
              <span>180 Days (6 Months)</span>
            </div>
          </div>

          {/* Setting 2: Minimum Booking Duration */}
          <div className="policy-card">
            <div className="policy-card__header">
              <div className="policy-card__title-group">
                <div className="policy-card__icon policy-card__icon--amber">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="policy-card__title">
                    Minimum Booking Duration
                  </h3>
                  <span className="policy-card__desc">
                    Prevents fragmented, ultra-short reservations (e.g. 5-minute slots).
                  </span>
                </div>
              </div>
              <div className="policy-card__value-badge">
                <span className="policy-card__value-num">
                  {policy.minBookingDurationMinutes}
                </span>
                <span className="policy-card__value-unit">mins</span>
              </div>
            </div>

            <div className="policy-presets--min-duration">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPolicy({ ...policy, minBookingDurationMinutes: mins })}
                  className={`policy-preset-btn ${policy.minBookingDurationMinutes === mins ? 'policy-preset-btn--active' : ''}`}
                >
                  {mins} Mins
                </button>
              ))}
            </div>
          </div>

          {/* Setting 3: Maximum Booking Duration */}
          <div className="policy-card">
            <div className="policy-card__header">
              <div className="policy-card__title-group">
                <div className="policy-card__icon policy-card__icon--purple">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="policy-card__title">
                    Maximum Booking Duration
                  </h3>
                  <span className="policy-card__desc">
                    Caps single reservations to prevent room monopolization.
                  </span>
                </div>
              </div>
              <div className="policy-card__value-badge">
                <span className="policy-card__value-num">
                  {policy.maxBookingDurationHours}
                </span>
                <span className="policy-card__value-unit">hours</span>
              </div>
            </div>

            <div className="policy-presets--max-duration">
              {[1, 2, 4, 6, 8, 12].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setPolicy({ ...policy, maxBookingDurationHours: hours })}
                  className={`policy-preset-btn ${policy.maxBookingDurationHours === hours ? 'policy-preset-btn--active' : ''}`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Setting 4: Cancellation Cutoff Window */}
          <div className="policy-card">
            <div className="policy-card__header">
              <div className="policy-card__title-group">
                <div className="policy-card__icon policy-card__icon--red">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="policy-card__title">
                    Cancellation Cutoff Deadline
                  </h3>
                  <span className="policy-card__desc">
                    Minimum notice required for employees to cancel their reservation.
                  </span>
                </div>
              </div>
              <div className="policy-card__value-badge">
                <span className="policy-card__value-num">
                  {policy.cancellationCutoffMinutes}
                </span>
                <span className="policy-card__value-unit">mins</span>
              </div>
            </div>

            <div className="policy-presets--cutoff">
              {[
                { label: 'Anytime (0m)', val: 0 },
                { label: '15 Mins', val: 15 },
                { label: '30 Mins', val: 30 },
                { label: '1 Hour', val: 60 },
                { label: '2 Hours', val: 120 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPolicy({ ...policy, cancellationCutoffMinutes: opt.val })}
                  className={`policy-preset-btn ${policy.cancellationCutoffMinutes === opt.val ? 'policy-preset-btn--active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary & Rules Explanation */}
        <div className="policy-summary-col">
          {/* Active Policy Summary Card */}
          <div className="policy-summary-card">
            <h4 className="policy-summary-title">
              <CheckCircle2 size={16} color="var(--primary-600, #2563eb)" />
              Active Workplace Rules Preview
            </h4>

            <div className="policy-summary-list">
              <div className="policy-summary-row">
                <span className="policy-summary-label">Scheduling Window:</span>
                <strong className="policy-summary-val">
                  Up to {policy.maxAdvanceBookingDays} days ahead
                </strong>
              </div>

              <div className="policy-summary-row">
                <span className="policy-summary-label">Allowed Duration:</span>
                <strong className="policy-summary-val">
                  {policy.minBookingDurationMinutes}m – {policy.maxBookingDurationHours}h
                </strong>
              </div>

              <div className="policy-summary-row">
                <span className="policy-summary-label">Cancel Deadline:</span>
                <strong className="policy-summary-val">
                  {policy.cancellationCutoffMinutes === 0
                    ? 'No cutoff (Anytime)'
                    : `${policy.cancellationCutoffMinutes}m before start`}
                </strong>
              </div>
            </div>

            <div className="policy-info-box">
              <Info size={16} color="var(--primary-600, #2563eb)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Facility Admin Exemption:</strong> Facility Admins retain override authority to cancel or reassign any meeting room at any time regardless of cancellation deadlines.
              </span>
            </div>

            {lastUpdated && (
              <div className="policy-sync-text">
                Last policy sync: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="policy-actions-card">
            <h4 className="policy-summary-title">
              Policy Actions
            </h4>
            <div className="policy-actions-list">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="btn btn--outline btn--full"
                style={{
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={14} /> Reset Recommended Defaults
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="btn btn--primary btn--full"
                disabled={!hasChanges || saving}
                style={{
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
