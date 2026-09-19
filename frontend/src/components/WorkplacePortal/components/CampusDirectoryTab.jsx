import React, { useState, useEffect } from 'react';
import { Building, MapPin, Users, ChevronRight } from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';

export default function CampusDirectoryTab({
  rooms = [],
  filteredDirectoryRooms = [],
  dirFloorFilter,
  onFloorFilterChange,
  dirSizeFilter,
  onSizeFilterChange,
  selectedSlot,
  onSelectRoomForBooking,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setPage(1);
  }, [dirFloorFilter, dirSizeFilter]);

  const paginatedRooms = filteredDirectoryRooms.slice((page - 1) * pageSize, page * pageSize);

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
          {Array.from(new Set(rooms.map((r) => r.floor).filter(Boolean))).sort().map((floor) => (
            <button
              key={floor}
              type="button"
              className={`dir-pill ${dirFloorFilter === floor ? 'dir-pill--active' : ''}`}
              onClick={() => onFloorFilterChange(floor)}
            >
              {floor}
            </button>
          ))}
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
          <div className="directory-empty-state">
            <Building size={36} className="directory-empty-state__icon" />
            <p className="directory-empty-state__title">
              No rooms match the selected criteria.
            </p>
            <p className="directory-empty-state__subtitle">
              Try adjusting your floor or capacity filters or add rooms in the console.
            </p>
          </div>
        ) : (
          paginatedRooms.map((r) => {
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

      {/* Universal Pagination */}
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={filteredDirectoryRooms.length}
        itemName="rooms"
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        pageSizeOptions={[6, 12, 24]}
      />
    </div>
  );
}
