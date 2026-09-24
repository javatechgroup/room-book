import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  MapPin,
  Users,
  ChevronRight,
  RotateCcw,
  Layers,
  DoorOpen,
  Monitor,
  Wrench,
  CalendarPlus,
  Video,
  Tv,
  Wifi,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';
import Select from '../../common/Select/Select';

const getRoomCategory = (capacity) => {
  const cap = Number(capacity) || 0;
  if (cap <= 4) return 'Focus Pod';
  if (cap <= 8) return 'Team Room';
  if (cap <= 14) return 'Conference Room';
  return 'Boardroom';
};

const getHardwareIcon = (name = '') => {
  const lower = String(name).toLowerCase();
  if (lower.includes('video') || lower.includes('conf') || lower.includes('camera')) {
    return <Video size={12} className="hw-tag__icon" />;
  }
  if (lower.includes('tv') || lower.includes('display') || lower.includes('screen')) {
    return <Tv size={12} className="hw-tag__icon" />;
  }
  if (lower.includes('wifi') || lower.includes('net') || lower.includes('internet')) {
    return <Wifi size={12} className="hw-tag__icon" />;
  }
  return <Monitor size={12} className="hw-tag__icon" />;
};

const getRoomAmenities = (room) => {
  if (Array.isArray(room.hardware) && room.hardware.length > 0) {
    return room.hardware.map((hw) => {
      const name = typeof hw === 'string' ? hw : hw.name || 'Equipment';
      return { name, icon: getHardwareIcon(name) };
    });
  }
  const cap = Number(room.capacity) || 0;
  if (cap >= 12) {
    return [
      { name: '4K Display', icon: <Tv size={12} className="hw-tag__icon" /> },
      { name: 'Video Bar', icon: <Video size={12} className="hw-tag__icon" /> },
      { name: 'Whiteboard', icon: <Monitor size={12} className="hw-tag__icon" /> },
    ];
  }
  if (cap >= 6) {
    return [
      { name: 'HD Monitor', icon: <Tv size={12} className="hw-tag__icon" /> },
      { name: 'Video Conf', icon: <Video size={12} className="hw-tag__icon" /> },
      { name: 'Whiteboard', icon: <Monitor size={12} className="hw-tag__icon" /> },
    ];
  }
  return [
    { name: 'HD Screen', icon: <Tv size={12} className="hw-tag__icon" /> },
    { name: 'High-Speed WiFi', icon: <Wifi size={12} className="hw-tag__icon" /> },
  ];
};

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
  const [pageSize, setPageSize] = useState(12);

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
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [floors, rooms]);

  const paginatedRooms = useMemo(() => {
    return filteredDirectoryRooms.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredDirectoryRooms, page, pageSize]);

  // Group rooms by floor for better readability
  const roomsByFloor = useMemo(() => {
    const groups = {};
    paginatedRooms.forEach((r) => {
      const fl = r.floor || 'General Floor Space';
      if (!groups[fl]) groups[fl] = [];
      groups[fl].push(r);
    });

    return Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [paginatedRooms]);

  const isFiltered = dirFloorFilter !== 'all' || dirSizeFilter !== 'all' || Boolean(search);

  const handleResetFilters = () => {
    if (onFloorFilterChange) onFloorFilterChange('all');
    if (onSizeFilterChange) onSizeFilterChange('all');
    if (onSearchChange) onSearchChange('');
  };

  return (
    <div className="portal-card directory-panel">
      {/* Search and Dropdowns Toolbar */}
      <div className="directory-toolbar">
        <div className="dir-search-wrap">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search rooms by name, code, or wing..."
            ariaLabel="Search Campus Rooms"
          />
        </div>

        <div className="dir-toolbar-filters">
          {/* 1. Floor Dropdown (Dynamic, Safe for Any Number of Floors) */}
          <div className="dir-filter-item">
            <Select
              id="dir-floor-filter"
              size="sm"
              icon={<Layers size={14} />}
              value={dirFloorFilter}
              onChange={onFloorFilterChange}
              placeholder={null}
              options={[
                { label: `All Floors (${rooms.length})`, value: 'all' },
                ...directoryFloorOptions.map((fl) => {
                  const count = rooms.filter((r) => r.floor === fl).length;
                  return {
                    label: `${fl} (${count} ${count === 1 ? 'Room' : 'Rooms'})`,
                    value: fl,
                  };
                }),
              ]}
              wrapperStyle={{ minWidth: '185px', width: 'auto' }}
            />
          </div>

          {/* 2. Capacity Dropdown */}
          <div className="dir-filter-item">
            <Select
              id="dir-size-filter"
              size="sm"
              icon={<Users size={14} />}
              value={dirSizeFilter}
              onChange={onSizeFilterChange}
              placeholder={null}
              options={[
                { label: 'All Capacities', value: 'all' },
                { label: 'Focus Pods (2 - 4 seats)', value: 'small' },
                { label: 'Team Rooms (6 - 10 seats)', value: 'medium' },
                { label: 'Boardrooms (12+ seats)', value: 'large' },
              ]}
              wrapperStyle={{ minWidth: '185px', width: 'auto' }}
            />
          </div>

          {isFiltered && (
            <button
              type="button"
              className="btn btn--secondary btn--sm dir-reset-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Campus Rooms Content Area */}
      <div className="directory-content-area">
        {filteredDirectoryRooms.length === 0 ? (
          <div className="directory-empty-state">
            <Building size={36} className="directory-empty-state__icon" />
            <p className="directory-empty-state__title">
              No rooms match the selected criteria.
            </p>
            <p className="directory-empty-state__subtitle">
              Try adjusting your search query, floor selection, or capacity filters.
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
          /* 3. Rooms Grouped with Floor for Better Readability */
          <div className="dir-floors-container">
            {roomsByFloor.map(([floorName, floorRooms]) => {
              const availCount = floorRooms.filter(
                (r) => !r.isUnderMaintenance && r.status !== 'MAINTENANCE'
              ).length;
              const totalCapacity = floorRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);

              return (
                <div key={floorName} className="dir-floor-group">
                  {/* Floor Group Header */}
                  <div className="dir-floor-header">
                    <div className="dir-floor-header__main">
                      <div className="dir-floor-header__icon">
                        <Layers size={15} />
                      </div>
                      <div>
                        <h3 className="dir-floor-header__title">{floorName}</h3>
                        <span className="dir-floor-header__meta">
                          {floorRooms.length} {floorRooms.length === 1 ? 'Meeting Space' : 'Meeting Spaces'} • {totalCapacity} Total Seats
                        </span>
                      </div>
                    </div>

                    <div className="dir-floor-header__stats">
                      <span className="dir-floor-stat-badge dir-floor-stat-badge--avail">
                        <span className="pulse-dot" />
                        <span>{availCount} Available</span>
                      </span>
                    </div>
                  </div>

                  {/* 2. Spacious Detailed Room Card Grid */}
                  <div className="directory-grid">
                    {floorRooms.map((r) => {
                      const isMaint = r.isUnderMaintenance || r.status === 'MAINTENANCE';
                      const category = r.type || getRoomCategory(r.capacity);
                      const amenities = getRoomAmenities(r);

                      return (
                        <div
                          key={r.id}
                          className={`dir-room-card ${
                            isMaint ? 'dir-room-card--maintenance' : 'dir-room-card--available'
                          }`}
                        >
                          <div className="dir-room-card__header">
                            <div className="dir-room-card__header-main">
                              <div
                                className={`dir-room-card__icon ${
                                  isMaint
                                    ? 'dir-room-card__icon--maint'
                                    : 'dir-room-card__icon--active'
                                }`}
                              >
                                <DoorOpen size={18} />
                              </div>
                              <div className="dir-room-card__title-box">
                                <h4 title={r.name}>{r.name}</h4>
                                <div className="dir-room-card__tags">
                                  <span className="dir-room-tag dir-room-tag--code">
                                    {r.code || `RM-${r.id}`}
                                  </span>
                                  <span className="dir-room-tag dir-room-tag--type">
                                    {category}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <span
                              className={`status-pill ${
                                isMaint ? 'status-pill--inactive' : 'status-pill--active'
                              }`}
                            >
                              <span className="status-pill__dot" />
                              <span>{isMaint ? 'Maintenance' : 'Available'}</span>
                            </span>
                          </div>

                          <div className="dir-room-card__body">
                            <div className="dir-room-card__meta-row">
                              <div className="dir-meta-item" title="Room Location">
                                <MapPin size={13} className="dir-meta-icon" />
                                <span>{r.building || 'HQ'} • {r.wing || r.floor}</span>
                              </div>
                              <div className="dir-meta-item dir-meta-item--capacity" title="Room Capacity">
                                <Users size={13} className="dir-meta-icon" />
                                <span><strong>{r.capacity}</strong> Seats</span>
                              </div>
                            </div>

                            <p className="dir-room-desc" title={r.description}>
                              {r.description || `${category} equipped for hybrid conferencing, audio-visual display, and team discussions.`}
                            </p>

                            <div className="dir-hw-chips">
                              {amenities.map((item, idx) => (
                                <span className="hw-tag" key={idx}>
                                  {item.icon}
                                  <span>{item.name}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="dir-room-card__footer">
                            <button
                              type="button"
                              className={`btn btn--sm btn--full dir-room-book-btn ${
                                isMaint ? 'btn--outline dir-btn--disabled' : 'btn--primary'
                              }`}
                              onClick={() => !isMaint && onSelectRoomForBooking(r.id)}
                              disabled={isMaint}
                            >
                              {isMaint ? (
                                <>
                                  <Wrench size={14} />
                                  <span>Under Maintenance</span>
                                </>
                              ) : (
                                <>
                                  <CalendarPlus size={14} />
                                  <span>Book Room</span>
                                  <ChevronRight size={14} />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Universal Pagination */}
      {filteredDirectoryRooms.length > pageSize && (
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
          pageSizeOptions={[6, 12, 24, 48]}
        />
      )}
    </div>
  );
}
