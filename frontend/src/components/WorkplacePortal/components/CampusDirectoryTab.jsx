import React, { useState, useEffect, useMemo } from 'react';
import { Building, MapPin, Users, ChevronRight, RotateCcw } from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';

export default function CampusDirectoryTab({
  rooms = [],
  floors = [],
  filteredDirectoryRooms = [],
  dirFloorFilter = 'all',
  onFloorFilterChange,
  dirSizeFilter = 'all',
  onSizeFilterChange,
  search = '',
  onSearchChange,
  selectedSlot,
  onSelectRoomForBooking,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setPage(1);
  }, [dirFloorFilter, dirSizeFilter, search]);

  const directoryFloorOptions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(floors)) {
      floors.forEach((f) => {
        if (typeof f === 'string' && f.trim()) set.add(f.trim());
        else if (f && typeof f === 'object' && f.name && typeof f.name === 'string') set.add(f.name.trim());
      });
    }
    if (Array.isArray(rooms)) {
      rooms.forEach((r) => {
        if (r.floor && typeof r.floor === 'string' && r.floor.trim()) set.add(r.floor.trim());
      });
    }
    return Array.from(set).sort();
  }, [floors, rooms]);

  const paginatedRooms = filteredDirectoryRooms.slice((page - 1) * pageSize, page * pageSize);

  const isFiltered = dirFloorFilter !== 'all' || dirSizeFilter !== 'all' || Boolean(search);

  const handleResetFilters = () => {
    if (onFloorFilterChange) onFloorFilterChange('all');
    if (onSizeFilterChange) onSizeFilterChange('all');
    if (onSearchChange) onSearchChange('');
  };

  return (
    <div className="portal-card directory-panel">
      <div className="directory-toolbar" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', maxWidth: '320px' }}>
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search rooms or pods..."
            ariaLabel="Search Campus Rooms"
          />
        </div>

        <div className="dir-pills" style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: '1 1 auto' }}>
          <button
            type="button"
            className={`dir-pill ${dirFloorFilter === 'all' ? 'dir-pill--active' : ''}`}
            onClick={() => onFloorFilterChange('all')}
          >
            All Floors ({rooms.length})
          </button>
          {directoryFloorOptions.map((floor) => {
            const count = rooms.filter((r) => r.floor === floor).length;
            return (
              <button
                key={floor}
                type="button"
                className={`dir-pill ${dirFloorFilter === floor ? 'dir-pill--active' : ''}`}
                onClick={() => onFloorFilterChange(floor)}
              >
                {floor} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        <div className="dir-size-select" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="dir-size" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Capacity:
          </label>
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
              Try adjusting your search query, floor, or capacity filters.
            </p>
            {isFiltered && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={handleResetFilters}
                style={{ marginTop: '12px' }}
              >
                <RotateCcw size={14} /> Reset All Filters
              </button>
            )}
          </div>
        ) : (
          paginatedRooms.map((r) => {
            const isAvail = !r.isUnderMaintenance && r.status !== 'MAINTENANCE';
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
                      r.isUnderMaintenance || r.status === 'MAINTENANCE'
                        ? 'status-indicator--maint'
                        : isAvail
                        ? 'status-indicator--free'
                        : 'status-indicator--busy'
                    }`}
                  >
                    {r.isUnderMaintenance || r.status === 'MAINTENANCE' ? 'Maintenance' : 'Available'}
                  </span>
                </div>

                <div className="dir-loc">
                  <MapPin size={13} /> {r.building || 'HQ'} • {r.wing || r.floor}
                </div>

                <div className="dir-specs">
                  <span className="spec-item">
                    <Users size={13} /> {r.capacity} Seats
                  </span>
                  <div className="dir-hw-chips">
                    {(r.hardware || []).map((hw) => (
                      <span className="hw-tag" key={hw.name}>
                        {hw.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--primary btn--sm btn--full"
                  onClick={() => onSelectRoomForBooking(r.id)}
                >
                  Book this Room <ChevronRight size={14} />
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
