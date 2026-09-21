import React from 'react';
import { Shield, Clock, Calendar, Wrench } from 'lucide-react';
import Select from '../../common/Select/Select';

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
          <Select
            id="max-slot"
            label="Maximum Consecutive Slot Duration"
            icon={<Clock size={15} />}
            value={policies.maxSlotHours}
            onChange={(val) =>
              onPoliciesChange({ ...policies, maxSlotHours: Number(val) })
            }
            placeholder={null}
            options={[
              { value: 1, label: '1 Hour Maximum' },
              { value: 2, label: '2 Hours Maximum' },
              { value: 4, label: '4 Hours Maximum (Half Day)' },
              { value: 8, label: '8 Hours Maximum (Whole Workday)' },
              { value: 12, label: '12 Hours Maximum (Extended Day)' },
              { value: 24, label: '24 Hours Maximum (Full Day / 24h)' },
            ]}
          />
          <span className="policy-help" style={{ marginTop: '6px', display: 'block' }}>
            Enforced on all employee reservations across office floors.
          </span>
        </div>

        <div className="policy-card">
          <Select
            id="adv-days"
            label="Advance Reservation Window"
            icon={<Calendar size={15} />}
            value={policies.advanceBookingDays}
            onChange={(val) =>
              onPoliciesChange({ ...policies, advanceBookingDays: Number(val) })
            }
            placeholder={null}
            options={[
              { value: 7, label: 'Up to 7 Days Ahead' },
              { value: 14, label: 'Up to 14 Days Ahead (Standard)' },
              { value: 30, label: 'Up to 30 Days Ahead' },
            ]}
          />
          <span className="policy-help" style={{ marginTop: '6px', display: 'block' }}>
            Limits how far in advance employees can book rooms.
          </span>
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
                  <td colSpan={6} className="rooms-table-empty">
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
