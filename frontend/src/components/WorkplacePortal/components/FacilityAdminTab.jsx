import React from 'react';
import { Shield, Clock, Calendar, Wrench } from 'lucide-react';

export default function FacilityAdminTab({
  policies,
  onPoliciesChange,
  rooms,
  onToggleMaintenance,
}) {
  return (
    <div className="portal-card admin-panel">
      <div className="panel-header">
        <div>
          <h3>Facility Management & Booking Policies</h3>
          <p>Manage physical room availability, maintenance status, and reservation limits for Building A.</p>
        </div>
        <span className="admin-role-badge">
          <Shield size={14} /> Facility Admin
        </span>
      </div>

      {/* Policy Settings */}
      <div className="policies-grid">
        <div className="policy-card">
          <label htmlFor="max-slot">
            <Clock size={15} /> Maximum Consecutive Slot Duration
          </label>
          <select
            id="max-slot"
            value={policies.maxSlotHours}
            onChange={(e) =>
              onPoliciesChange({ ...policies, maxSlotHours: Number(e.target.value) })
            }
          >
            <option value={1}>1 Hour Maximum</option>
            <option value={2}>2 Hours Maximum (Company Standard)</option>
            <option value={3}>3 Hours Maximum</option>
            <option value={4}>4 Hours Maximum (Boardrooms only)</option>
          </select>
          <span className="policy-help">Enforced on all employee reservations across office floors.</span>
        </div>

        <div className="policy-card">
          <label htmlFor="adv-days">
            <Calendar size={15} /> Advance Reservation Window
          </label>
          <select
            id="adv-days"
            value={policies.advanceBookingDays}
            onChange={(e) =>
              onPoliciesChange({ ...policies, advanceBookingDays: Number(e.target.value) })
            }
          >
            <option value={7}>Up to 7 Days Ahead</option>
            <option value={14}>Up to 14 Days Ahead (Standard)</option>
            <option value={30}>Up to 30 Days Ahead</option>
          </select>
          <span className="policy-help">Limits how far in advance employees can book rooms.</span>
        </div>
      </div>

      {/* Room Maintenance Inventory Table */}
      <div className="admin-table-block">
        <h4>Physical Room Maintenance Status</h4>
        <div className="table-responsive">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Equipment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}
                  >
                    No physical rooms registered in this facility yet.
                  </td>
                </tr>
              ) : (
                rooms.map((rm) => (
                  <tr key={rm.id}>
                    <td>
                      <strong>{rm.name}</strong>
                      <div className="sub-txt">{rm.type}</div>
                    </td>
                    <td>
                      <span className="code-pill">{rm.code}</span>
                      <div className="sub-txt">{rm.wing}</div>
                    </td>
                    <td>{rm.capacity} Seats</td>
                    <td>
                      <span className="sub-txt">{rm.hardware.map((h) => h.name).join(', ')}</span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          rm.isUnderMaintenance ? 'status-pill--maint' : 'status-pill--ok'
                        }`}
                      >
                        {rm.isUnderMaintenance ? 'Maintenance Block' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn--sm ${
                          rm.isUnderMaintenance ? 'btn--outline' : 'btn--warn'
                        }`}
                        onClick={() => onToggleMaintenance(rm.id)}
                      >
                        <Wrench size={13} />
                        {rm.isUnderMaintenance ? 'Clear Block' : 'Block Maintenance'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
