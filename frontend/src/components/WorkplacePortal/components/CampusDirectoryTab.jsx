import React from 'react';
import { Building, MapPin, Users, ChevronRight } from 'lucide-react';

export default function CampusDirectoryTab({
  rooms,
  filteredDirectoryRooms,
  dirFloorFilter,
  onFloorFilterChange,
  dirSizeFilter,
  onSizeFilterChange,
  selectedSlot,
  onSelectRoomForBooking,
}) {
  return (
    <div className="portal-card directory-panel">
      <div className="directory-toolbar">
        <div className="dir-pills">
          <button
            type="button"
            className={`dir-pill ${dirFloorFilter === 'all' ? 'dir-pill--active' : ''}`}
            onClick={() => onFloorFilterChange('all')}
          >
            All Floors ({rooms.length})
          </button>
          <button
            type="button"
            className={`dir-pill ${dirFloorFilter === 'floor-4' ? 'dir-pill--active' : ''}`}
            onClick={() => onFloorFilterChange('floor-4')}
          >
            Floor 4 — Executive
          </button>
          <button
            type="button"
            className={`dir-pill ${dirFloorFilter === 'floor-3' ? 'dir-pill--active' : ''}`}
            onClick={() => onFloorFilterChange('floor-3')}
          >
            Floor 3 — Collaborative Labs
          </button>
          <button
            type="button"
            className={`dir-pill ${dirFloorFilter === 'floor-2' ? 'dir-pill--active' : ''}`}
            onClick={() => onFloorFilterChange('floor-2')}
          >
            Floor 2 — Team Hub
          </button>
          <button
            type="button"
            className={`dir-pill ${dirFloorFilter === 'floor-1' ? 'dir-pill--active' : ''}`}
            onClick={() => onFloorFilterChange('floor-1')}
          >
            Floor 1 — Focus Pods
          </button>
        </div>

        <div className="dir-size-select">
          <label htmlFor="dir-size">Capacity:</label>
          <select
            id="dir-size"
            value={dirSizeFilter}
            onChange={(e) => onSizeFilterChange(e.target.value)}
          >
            <option value="all">All Sizes</option>
            <option value="small">Focus Pods (2 - 4 seats)</option>
            <option value="medium">Team Rooms (6 - 10 seats)</option>
            <option value="large">Boardrooms (12+ seats)</option>
          </select>
        </div>
      </div>

      <div className="directory-grid">
        {filteredDirectoryRooms.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '48px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Building size={36} style={{ color: 'var(--text-faint)', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
              No rooms match the selected criteria.
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              Try adjusting your floor or capacity filters or add rooms in the console.
            </p>
          </div>
        ) : (
          filteredDirectoryRooms.map((r) => {
            const isAvail = !r.isUnderMaintenance && !r.occupiedSlots.includes(selectedSlot);
            return (
              <div className="dir-room-card" key={r.id}>
                <div className="dir-room-card__header">
                  <div>
                    <span className="room-code-tag">{r.code}</span>
                    <h4>{r.name}</h4>
                    <span className="dir-type">{r.type}</span>
                  </div>
                  <span
                    className={`status-indicator ${
                      r.isUnderMaintenance
                        ? 'status-indicator--maint'
                        : isAvail
                        ? 'status-indicator--free'
                        : 'status-indicator--busy'
                    }`}
                  >
                    {r.isUnderMaintenance ? 'Maintenance' : isAvail ? 'Vacant' : 'In Session'}
                  </span>
                </div>

                <div className="dir-loc">
                  <MapPin size={13} /> {r.building} • {r.wing}
                </div>

                <div className="dir-specs">
                  <span className="spec-item">
                    <Users size={13} /> {r.capacity} Seats
                  </span>
                  <div className="dir-hw-chips">
                    {r.hardware.map((hw) => (
                      <span className="hw-tag" key={hw.name}>
                        {hw.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--outline btn--sm btn--full"
                  onClick={() => onSelectRoomForBooking(r.id)}
                >
                  Check Slots for this Room <ChevronRight size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
