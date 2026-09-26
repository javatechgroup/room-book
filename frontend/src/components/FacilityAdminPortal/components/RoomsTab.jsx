import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  DoorOpen,
  Users,
  MapPin,
  Wrench,
  CheckCircle2,
  Edit2,
  Download,
  Plus,
  Eye,
  SlidersHorizontal,
  CalendarPlus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  Tv,
  Video,
  Wifi,
  Monitor,
  RotateCcw,
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

const getAmenityIcon = (name = '') => {
  const lower = String(name).toLowerCase();
  if (lower.includes('video') || lower.includes('conf') || lower.includes('camera')) {
    return <Video size={12} />;
  }
  if (lower.includes('tv') || lower.includes('display') || lower.includes('screen')) {
    return <Tv size={12} />;
  }
  if (lower.includes('wifi') || lower.includes('net') || lower.includes('internet')) {
    return <Wifi size={12} />;
  }
  return <Monitor size={12} />;
};

const getRoomAmenities = (room) => {
  if (Array.isArray(room.hardware) && room.hardware.length > 0) {
    return room.hardware.map((hw) => {
      const name = typeof hw === 'string' ? hw : hw.name || 'Equipment';
      return { name, icon: getAmenityIcon(name) };
    });
  }
  const cap = Number(room.capacity) || 0;
  if (cap >= 12) {
    return [
      { name: '4K Display', icon: <Tv size={12} /> },
      { name: 'Video Bar', icon: <Video size={12} /> },
      { name: 'Whiteboard', icon: <Monitor size={12} /> },
    ];
  }
  if (cap >= 6) {
    return [
      { name: 'HD Monitor', icon: <Tv size={12} /> },
      { name: 'Video Conf', icon: <Video size={12} /> },
      { name: 'Whiteboard', icon: <Monitor size={12} /> },
    ];
  }
  return [
    { name: 'HD Screen', icon: <Tv size={12} /> },
    { name: 'High-Speed WiFi', icon: <Wifi size={12} /> },
  ];
};

export default function RoomsTab({
  rooms = [],
  floors = [],
  search = '',
  onSearchChange,
  floorFilter = 'ALL',
  onFloorFilterChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  sortBy = 'name',
  sortDir = 'asc',
  onSort,
  selectedRoomIds = [],
  onToggleSelect,
  onSelectAll,
  onOpenCreateRoom,
  onOpenEditRoom,
  onToggleMaintenance,
  onInspectRoom,
  onBookRoom,
  onBulkActivate,
  onBulkMaintenance,
  onExportCSV,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isAllSelected = rooms.length > 0 && rooms.every((r) => selectedRoomIds.includes(r.id));

  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;

  const roomsByFloor = React.useMemo(() => {
    const groups = {};
    rooms.forEach((room) => {
      const fl = room.floor || 'General Level';
      if (!groups[fl]) groups[fl] = [];
      groups[fl].push(room);
    });
    return Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [rooms]);

  return (
    <div className="superadmin-tab-content">
      {/* SuperAdmin Toolbar */}
      <div className="superadmin-toolbar">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search rooms by name, floor, or wing..."
        />

        <div className="superadmin-filter-group">
          {/* Floor Dropdown */}
          <Select
            size="sm"
            icon={<Layers size={14} />}
            value={floorFilter}
            onChange={(val) => onFloorFilterChange(val)}
            placeholder={null}
            options={[
              { value: 'ALL', label: `All Floors (${rooms.length})` },
              ...floors.map((fl) => {
                const count = rooms.filter((r) => r.floor === fl).length;
                return {
                  value: fl,
                  label: `${fl} (${count} ${count === 1 ? 'Room' : 'Rooms'})`,
                };
              }),
            ]}
            wrapperStyle={{ minWidth: '185px', width: 'auto' }}
          />

          {/* Status Segmented Buttons */}
          <div className="status-segment-group">
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('ALL')}
            >
              All <span>{totalCount > 0 ? totalCount : rooms.length}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'AVAILABLE' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('AVAILABLE')}
            >
              Available <span>{availableCount}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'MAINTENANCE' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('MAINTENANCE')}
            >
              Maintenance <span>{maintenanceCount}</span>
            </button>
          </div>

          {(search || floorFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                onSearchChange?.('');
                onFloorFilterChange?.('ALL');
                onStatusFilterChange?.('ALL');
              }}
              title="Reset room filters"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`btn btn--sm btn--icon-only ${viewMode === 'table' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <SlidersHorizontal size={14} />
            </button>
            <button
              type="button"
              className={`btn btn--sm btn--icon-only ${viewMode === 'cards' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setViewMode('cards')}
              title="Floor Card View"
            >
              <DoorOpen size={14} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn--outline btn--sm export-btn"
            onClick={onExportCSV}
            title="Export room inventory to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {onOpenCreateRoom && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onOpenCreateRoom}
            >
              <Plus size={15} />
              <span>Create Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedRoomIds.length > 0 && (
        <div className="bulk-toolbar">
          <div className="bulk-toolbar__info">
            <span className="bulk-badge">{selectedRoomIds.length}</span>
            <span>{selectedRoomIds.length === 1 ? 'room selected' : 'rooms selected'}</span>
          </div>
          <div className="bulk-toolbar__actions">
            <button
              type="button"
              className="bulk-btn bulk-btn--activate"
              onClick={onBulkActivate}
            >
              <CheckCircle2 size={14} /> Mark Available
            </button>
            <button
              type="button"
              className="bulk-btn bulk-btn--deactivate"
              onClick={onBulkMaintenance}
            >
              <Wrench size={14} /> Set Maintenance
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      {viewMode === 'table' ? (
        <div className="desktop-table-wrap">
          <div className="table-responsive">
            <table className="superadmin-table rooms-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={onSelectAll}
                      aria-label="Select all rooms"
                    />
                  </th>
                  <th className="th-sortable th-room-name" onClick={() => onSort && onSort('name')}>
                    <div className="th-content">
                      <span>Room Name & Specs</span>
                      {sortBy === 'name' ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="sort-idle" />
                      )}
                    </div>
                  </th>
                  <th className="th-sortable th-floor" onClick={() => onSort && onSort('floor')}>
                    <div className="th-content">
                      <span>Floor Location</span>
                      {sortBy === 'floor' ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="sort-idle" />
                      )}
                    </div>
                  </th>
                  <th className="th-sortable th-capacity" onClick={() => onSort && onSort('capacity')}>
                    <div className="th-content">
                      <span>Capacity</span>
                      {sortBy === 'capacity' ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="sort-idle" />
                      )}
                    </div>
                  </th>
                  <th className="th-sortable th-status" onClick={() => onSort && onSort('status')}>
                    <div className="th-content">
                      <span>Status</span>
                      {sortBy === 'status' ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="sort-idle" />
                      )}
                    </div>
                  </th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="td-empty">
                      <DoorOpen size={32} className="empty-icon" />
                      <p>
                        {search || floorFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? 'No meeting rooms match your active filters.'
                          : 'No meeting rooms configured yet.'}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                        {(search || floorFilter !== 'ALL' || statusFilter !== 'ALL') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => {
                              if (onSearchChange) onSearchChange('');
                              if (onFloorFilterChange) onFloorFilterChange('ALL');
                              if (onStatusFilterChange) onStatusFilterChange('ALL');
                            }}
                          >
                            Reset All Filters
                          </button>
                        )}
                        <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateRoom}>
                          <Plus size={14} /> Create Room
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => {
                    const isSelected = selectedRoomIds.includes(room.id);
                    const isMaintenance = room.status === 'MAINTENANCE';

                    return (
                      <tr
                        key={room.id}
                        className={isSelected ? 'tr--selected' : ''}
                        onClick={() => onInspectRoom(room)}
                      >
                        <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(room.id)}
                            aria-label={`Select room ${room.name}`}
                          />
                        </td>
                        <td className="td-room-name td-strong">
                          <div className="entity-cell">
                            <div className="entity-cell__icon entity-cell__icon--blue">
                              <DoorOpen size={16} />
                            </div>
                            <div className="entity-cell__content">
                              <div className="entity-cell__name">{room.name}</div>
                              <div className="entity-cell__sub" title={room.description || room.location || 'General Zone'}>
                                {room.description || room.location || 'General Zone'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="td-floor">
                          <span className="code-pill">
                            <Layers size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            {room.floor}
                          </span>
                        </td>
                        <td className="td-capacity">
                          <span className="capacity-pill">
                            <Users size={12} /> {room.capacity} People
                          </span>
                        </td>
                        <td className="td-status" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`status-badge-btn ${isMaintenance ? 'status-badge-btn--inactive' : 'status-badge-btn--active'}`}
                            onClick={() => onToggleMaintenance(room.id)}
                            title={`Click to toggle status (Currently: ${room.status})`}
                          >
                            <span className="status-badge__dot" />
                            <span>{isMaintenance ? 'Maintenance' : 'Available'}</span>
                          </button>
                        </td>
                        <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                          <div className="td-actions__group">
                            <button
                              type="button"
                              className="action-btn action-btn--inspect"
                              onClick={() => onInspectRoom(room)}
                              title="Inspect Room Specs"
                              aria-label={`Inspect ${room.name}`}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="action-btn action-btn--edit"
                              onClick={() => onOpenEditRoom(room)}
                              title="Edit Room Details"
                              aria-label={`Edit ${room.name}`}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className={`action-btn ${isMaintenance ? 'action-btn--activate' : 'action-btn--deactivate'}`}
                              onClick={() => onToggleMaintenance(room.id)}
                              title={isMaintenance ? 'Mark Available' : 'Set Maintenance'}
                              aria-label={isMaintenance ? `Activate ${room.name}` : `Set Maintenance for ${room.name}`}
                            >
                              {isMaintenance ? <CheckCircle2 size={14} /> : <Wrench size={14} />}
                            </button>
                            {!isMaintenance && onBookRoom && (
                              <button
                                type="button"
                                className="action-btn action-btn--book"
                                onClick={() => onBookRoom(room)}
                                title="Book Room Now"
                                aria-label={`Book ${room.name}`}
                              >
                                <CalendarPlus size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Universal Pagination (Table View) */}
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={totalCount || rooms.length}
            itemName="rooms"
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      ) : (
        /* Floor-based Cards View */
        <div className="dir-floors-container facility-rooms-cards-section">
          {roomsByFloor.map(([floorName, floorRooms]) => {
            const floorAvail = floorRooms.filter((r) => r.status === 'AVAILABLE').length;
            const floorSeats = floorRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);

            return (
              <div key={floorName} className="dir-floor-group facility-floor-card-group">
                <div className="dir-floor-header facility-floor-card-header">
                  <div className="dir-floor-header__main">
                    <div className="dir-floor-header__icon">
                      <Layers size={15} />
                    </div>
                    <div>
                      <h3 className="dir-floor-header__title">{floorName}</h3>
                      <span className="dir-floor-header__meta">
                        {floorRooms.length} {floorRooms.length === 1 ? 'Meeting Space' : 'Meeting Spaces'} • {floorSeats} Total Seats
                      </span>
                    </div>
                  </div>
                  <div className="dir-floor-header__stats">
                    <span className="dir-floor-stat-badge dir-floor-stat-badge--avail">
                      <span className="pulse-dot" />
                      <span>{floorAvail} Available</span>
                    </span>
                  </div>
                </div>

                <div className="directory-grid facility-rooms-card-grid">
                  {floorRooms.map((room) => {
                    const isMaintenance = room.status === 'MAINTENANCE';
                    const floorDisplay =
                      typeof room.floor === 'string' && room.floor.toLowerCase().includes('floor')
                        ? room.floor
                        : `Floor ${room.floor}`;
                    const category = room.type || getRoomCategory(room.capacity);
                    const amenities = getRoomAmenities(room);

                    return (
                      <div
                        key={room.id}
                        className={`dir-room-card facility-room-card ${
                          isMaintenance ? 'dir-room-card--maintenance' : 'dir-room-card--available'
                        }`}
                        onClick={() => onInspectRoom(room)}
                      >
                        <div className="dir-room-card__header">
                          <div className="dir-room-card__header-main">
                            <div
                              className={`dir-room-card__icon ${
                                isMaintenance
                                  ? 'dir-room-card__icon--maint'
                                  : 'dir-room-card__icon--active'
                              }`}
                            >
                              <DoorOpen size={18} />
                            </div>
                            <div className="dir-room-card__title-box">
                              <h4 title={room.name}>{room.name}</h4>
                              <div className="dir-room-card__tags">
                                <span className="dir-room-tag dir-room-tag--code">
                                  {room.code || `RM-${room.id}`}
                                </span>
                                <span className="dir-room-tag dir-room-tag--type">
                                  {category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`status-badge-btn ${
                              isMaintenance ? 'status-badge-btn--inactive' : 'status-badge-btn--active'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleMaintenance(room.id);
                            }}
                            title={`Click to toggle status (Currently: ${room.status})`}
                          >
                            <span className="status-badge__dot" />
                            <span>{isMaintenance ? 'Maintenance' : 'Available'}</span>
                          </button>
                        </div>

                        <div className="dir-room-card__body">
                          <div className="dir-room-card__meta-row">
                            <div className="dir-meta-item" title="Room Location">
                              <MapPin size={13} className="dir-meta-icon" />
                              <span>{room.location ? `${floorDisplay} • ${room.location}` : floorDisplay}</span>
                            </div>
                            <div className="dir-meta-item dir-meta-item--capacity" title="Room Capacity">
                              <Users size={13} className="dir-meta-icon" />
                              <span><strong>{room.capacity}</strong> Seats</span>
                            </div>
                          </div>

                          <p className="facility-room-desc" title={room.description}>
                            {room.description || `${category} equipped for hybrid conferencing, audio-visual display, and team discussions.`}
                          </p>

                          <div className="facility-hw-chips">
                            {amenities.map((item, idx) => (
                              <span className="facility-hw-tag" key={idx}>
                                {item.icon}
                                <span>{item.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="dir-room-card__footer facility-room-card__footer" onClick={(e) => e.stopPropagation()}>
                          <span className="facility-room-id-sub">
                            Room #{room.id}
                          </span>
                          <div className="facility-room-card__actions">
                            <button
                              type="button"
                              className="action-btn action-btn--inspect"
                              onClick={() => onInspectRoom(room)}
                              title="Inspect Room Specs"
                              aria-label={`Inspect ${room.name}`}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="action-btn action-btn--edit"
                              onClick={() => onOpenEditRoom(room)}
                              title="Edit Room Details"
                              aria-label={`Edit ${room.name}`}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className={`action-btn ${isMaintenance ? 'action-btn--activate' : 'action-btn--deactivate'}`}
                              onClick={() => onToggleMaintenance(room.id)}
                              title={isMaintenance ? 'Mark Available' : 'Set Maintenance'}
                              aria-label={isMaintenance ? `Mark ${room.name} available` : `Set maintenance for ${room.name}`}
                            >
                              {isMaintenance ? <CheckCircle2 size={14} /> : <Wrench size={14} />}
                            </button>
                            {!isMaintenance && onBookRoom && (
                              <button
                                type="button"
                                className="action-btn action-btn--book"
                                onClick={() => onBookRoom(room)}
                                title="Book Room Now"
                                aria-label={`Book ${room.name}`}
                              >
                                <CalendarPlus size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Universal Pagination (Cards View) */}
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={totalCount || rooms.length}
            itemName="rooms"
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}

      {/* Mobile Card List (Visible on mobile/tablet < 768px when viewMode is table) */}
      <div className="mobile-card-list">
        {rooms.length === 0 ? (
          <div className="mobile-empty-state">
            <DoorOpen size={32} className="empty-icon" />
            <p>No meeting rooms match your query.</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateRoom}>
              Create Room
            </button>
          </div>
        ) : (
          <>
            {rooms.map((room) => {
              const isSelected = selectedRoomIds.includes(room.id);
              const isMaintenance = room.status === 'MAINTENANCE';
              return (
                <div
                  key={room.id}
                  className={`mobile-card ${isSelected ? 'mobile-card--selected' : ''}`}
                  onClick={() => onInspectRoom(room)}
                >
                  <div className="mobile-card__header">
                    <div className="mobile-card__header-left">
                      <input
                        type="checkbox"
                        className="mobile-card-checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleSelect(room.id);
                        }}
                        aria-label={`Select ${room.name}`}
                      />
                      <div className="mobile-card__title-row">
                        <h4 className="mobile-card__title">{room.name}</h4>
                        <span className="mobile-card__subtitle">{room.floor} • {room.location || 'General Zone'}</span>
                      </div>
                    </div>
                    <span className={`status-pill ${isMaintenance ? 'status-pill--inactive' : 'status-pill--active'}`}>
                      {isMaintenance ? 'Maintenance' : 'Available'}
                    </span>
                  </div>

                  <div className="mobile-card__details">
                    <div className="mobile-card__info-row">
                      <Users size={14} className="mobile-card__icon" />
                      <span>Capacity: <strong>{room.capacity} People</strong></span>
                    </div>
                    {room.description && (
                      <div className="mobile-card__info-row">
                        <span className="mobile-card__text">{room.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="mobile-card__footer" onClick={(e) => e.stopPropagation()}>
                    <div className="mobile-card__footer-left">
                      <span className="code-pill">
                        <Layers size={11} style={{ marginRight: '4px' }} />
                        {room.floor}
                      </span>
                    </div>
                    <div className="mobile-card__actions">
                      <button
                        type="button"
                        className="action-btn action-btn--inspect"
                        onClick={() => onInspectRoom(room)}
                        title="Inspect Room Specs"
                        aria-label={`Inspect ${room.name}`}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-btn action-btn--edit"
                        onClick={() => onOpenEditRoom(room)}
                        title="Edit Room Details"
                        aria-label={`Edit ${room.name}`}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className={`action-btn ${isMaintenance ? 'action-btn--activate' : 'action-btn--deactivate'}`}
                        onClick={() => onToggleMaintenance(room.id)}
                        title={isMaintenance ? 'Mark Available' : 'Set Maintenance'}
                        aria-label={isMaintenance ? `Mark ${room.name} available` : `Set maintenance for ${room.name}`}
                      >
                        {isMaintenance ? <CheckCircle2 size={15} /> : <Wrench size={15} />}
                      </button>
                      {!isMaintenance && onBookRoom && (
                        <button
                          type="button"
                          className="action-btn action-btn--book"
                          onClick={() => onBookRoom(room)}
                          title="Book Room Now"
                          aria-label={`Book ${room.name}`}
                        >
                          <CalendarPlus size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={totalCount || rooms.length}
              itemName="rooms"
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
