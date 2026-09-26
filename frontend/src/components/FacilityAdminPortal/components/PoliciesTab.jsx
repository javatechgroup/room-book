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
      <div
        className="policy-header-banner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: 'var(--card-bg, #ffffff)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color, #e2e8f0)',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--primary-600, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 650, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
              Company Booking Policies
            </h2>
            {companyName && (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Building size={12} /> {companyName}
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted, #64748b)', fontSize: '0.88rem', maxWidth: '640px' }}>
            Configure reservation boundaries, duration limits, and cancellation windows for your workplace.
            Rules are enforced in real-time across all employee bookings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="btn btn--outline"
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
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
            style={{
              padding: '8px 18px',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: !hasChanges ? 0.7 : 1,
            }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Policy Changes'}
          </button>
        </div>
      </div>

      <div
        className="policy-content-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Interactive Settings Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Setting 1: Advance Booking Window */}
          <div
            className="policy-card"
            style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '22px',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                    Maximum Advance Booking Window
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                    How far into the future employees are permitted to schedule meetings.
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600, #2563eb)' }}>
                  {policy.maxAdvanceBookingDays}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', marginLeft: '4px' }}>days</span>
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[7, 14, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setPolicy({ ...policy, maxAdvanceBookingDays: days })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: policy.maxAdvanceBookingDays === days ? 'var(--primary-600, #2563eb)' : 'var(--border-color, #e2e8f0)',
                    background: policy.maxAdvanceBookingDays === days ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: policy.maxAdvanceBookingDays === days ? 'var(--primary-600, #2563eb)' : 'var(--text-primary, #334155)',
                    fontSize: '0.82rem',
                    fontWeight: policy.maxAdvanceBookingDays === days ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
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
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-600, #2563eb)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
              <span>1 Day (Next day only)</span>
              <span>180 Days (6 Months)</span>
            </div>
          </div>

          {/* Setting 2: Minimum Booking Duration */}
          <div
            className="policy-card"
            style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '22px',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                    Minimum Booking Duration
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                    Prevents fragmented, ultra-short reservations (e.g. 5-minute slots).
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600, #2563eb)' }}>
                  {policy.minBookingDurationMinutes}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', marginLeft: '4px' }}>mins</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPolicy({ ...policy, minBookingDurationMinutes: mins })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: policy.minBookingDurationMinutes === mins ? 'var(--primary-600, #2563eb)' : 'var(--border-color, #e2e8f0)',
                    background: policy.minBookingDurationMinutes === mins ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: policy.minBookingDurationMinutes === mins ? 'var(--primary-600, #2563eb)' : 'var(--text-primary, #334155)',
                    fontSize: '0.82rem',
                    fontWeight: policy.minBookingDurationMinutes === mins ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Setting 3: Maximum Booking Duration */}
          <div
            className="policy-card"
            style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '22px',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                    Maximum Booking Duration
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                    Caps single reservations to prevent room monopolization.
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600, #2563eb)' }}>
                  {policy.maxBookingDurationHours}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', marginLeft: '4px' }}>hours</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 4, 6, 8, 12].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setPolicy({ ...policy, maxBookingDurationHours: hours })}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: policy.maxBookingDurationHours === hours ? 'var(--primary-600, #2563eb)' : 'var(--border-color, #e2e8f0)',
                    background: policy.maxBookingDurationHours === hours ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: policy.maxBookingDurationHours === hours ? 'var(--primary-600, #2563eb)' : 'var(--text-primary, #334155)',
                    fontSize: '0.82rem',
                    fontWeight: policy.maxBookingDurationHours === hours ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Setting 4: Cancellation Cutoff Window */}
          <div
            className="policy-card"
            style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '22px',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                    Cancellation Cutoff Deadline
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                    Minimum notice required for employees to cancel their reservation.
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600, #2563eb)' }}>
                  {policy.cancellationCutoffMinutes}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', marginLeft: '4px' }}>mins</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
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
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: policy.cancellationCutoffMinutes === opt.val ? 'var(--primary-600, #2563eb)' : 'var(--border-color, #e2e8f0)',
                    background: policy.cancellationCutoffMinutes === opt.val ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: policy.cancellationCutoffMinutes === opt.val ? 'var(--primary-600, #2563eb)' : 'var(--text-primary, #334155)',
                    fontSize: '0.8rem',
                    fontWeight: policy.cancellationCutoffMinutes === opt.val ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary & Rules Explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Policy Summary Card */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
            }}
          >
            <h4
              style={{
                fontSize: '0.94rem',
                fontWeight: 650,
                margin: '0 0 16px 0',
                color: 'var(--text-primary, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} color="var(--primary-600, #2563eb)" />
              Active Workplace Rules Preview
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary, #f8fafc)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #64748b)' }}>Scheduling Window:</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary, #0f172a)' }}>
                  Up to {policy.maxAdvanceBookingDays} days ahead
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary, #f8fafc)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #64748b)' }}>Allowed Duration:</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary, #0f172a)' }}>
                  {policy.minBookingDurationMinutes}m – {policy.maxBookingDurationHours}h
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary, #f8fafc)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #64748b)' }}>Cancel Deadline:</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary, #0f172a)' }}>
                  {policy.cancellationCutoffMinutes === 0
                    ? 'No cutoff (Anytime)'
                    : `${policy.cancellationCutoffMinutes}m before start`}
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: '18px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.06)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                display: 'flex',
                gap: '10px',
                fontSize: '0.8rem',
                color: 'var(--text-muted, #475569)',
                lineHeight: 1.4,
              }}
            >
              <Info size={16} color="var(--primary-600, #2563eb)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Facility Admin Exemption:</strong> Facility Admins and Super Admins retain override authority to cancel or reassign any meeting room at any time regardless of cancellation deadlines.
              </span>
            </div>

            {lastUpdated && (
              <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', textAlign: 'right' }}>
                Last policy sync: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text-primary, #0f172a)' }}>
              Policy Actions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="btn btn--outline"
                style={{
                  width: '100%',
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
                className="btn btn--primary"
                disabled={!hasChanges || saving}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: !hasChanges ? 0.7 : 1,
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
