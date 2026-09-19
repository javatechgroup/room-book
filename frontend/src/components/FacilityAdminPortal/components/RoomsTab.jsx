import React, { useState } from 'react';
import {
  Search,
  Layers,
  DoorOpen,
  Users,
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
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';

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
  onSelectAll,
  onToggleSelect,
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
  const [localSearch, setLocalSearch] = useState(search);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isAllSelected = rooms.length > 0 && rooms.every((r) => selectedRoomIds.includes(r.id));

  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearchChange) onSearchChange(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
  };

  return (
    <div className="superadmin-tab-content">
      {/* SuperAdmin Toolbar */}
      <div className="superadmin-toolbar">
        <form onSubmit={handleSearchSubmit} className="superadmin-search-form">
          <div className="superadmin-search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search rooms by name, floor, or wing..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="superadmin-search-input"
            />
            {localSearch && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <button type="submit" className="btn btn--primary btn--sm search-submit-btn">
            <Search size={14} />
            <span>Search</span>
          </button>
        </form>

        <div className="superadmin-filter-group">
          {/* Floor Dropdown */}
          <div className={`superadmin-dropdown-wrap superadmin-dropdown-wrap--compact ${floorFilter !== 'ALL' ? 'superadmin-dropdown-wrap--active' : ''}`}>
            <Layers size={15} className="filter-select-icon" />
            <select
              value={floorFilter}
              onChange={(e) => onFloorFilterChange(e.target.value)}
              className="superadmin-filter-select"
            >
              <option value="ALL">All Office Floors</option>
              {floors.map((fl) => (
                <option key={fl} value={fl}>{fl}</option>
              ))}
            </select>
            <ChevronDown size={14} className="filter-select-arrow" />
          </div>

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
                  <th className="th-sortable" onClick={() => onSort && onSort('name')}>
                    <div className="th-content">
                      <span>Room Name & Specs</span>
                      {sortBy === 'name' ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="sort-idle" />
                      )}
                    </div>
                  </th>
                  <th className="th-sortable" onClick={() => onSort && onSort('floor')}>
                    <div className="th-content">
                      <span>Floor Location</span>
                      {sortBy === 'floor' ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="sort-idle" />
                      )}
                    </div>
                  </th>
                  <th className="th-sortable" onClick={() => onSort && onSort('capacity')}>
                    <div className="th-content">
                      <span>Capacity</span>
                      {sortBy === 'capacity' ? (
                        sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="sort-idle" />
                      )}
                    </div>
                  </th>
                  <th className="th-sortable" onClick={() => onSort && onSort('status')}>
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
                      <p>No meeting rooms match your current filter.</p>
                      <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateRoom}>
                        <Plus size={14} /> Create Room
                      </button>
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
                        <td className="td-strong">
                          <div className="entity-cell">
                            <div className="entity-cell__icon entity-cell__icon--blue">
                              <DoorOpen size={16} />
                            </div>
                            <div className="entity-cell__content">
                              <div className="entity-cell__name">{room.name}</div>
                              <div className="entity-cell__sub">
                                {room.description
                                  ? room.description.length > 55
                                    ? `${room.description.substring(0, 55)}...`
                                    : room.description
                                  : room.location || 'General Zone'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="code-pill">
                            <Layers size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            {room.floor}
                          </span>
                        </td>
                        <td>
                          <span className="capacity-pill">
                            <Users size={12} /> {room.capacity} People
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
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
        <div className="facility-rooms-cards-section">
          <div className="facility-rooms-card-grid">
            {rooms.map((room) => {
              const isMaintenance = room.status === 'MAINTENANCE';
              const floorDisplay = typeof room.floor === 'string' && room.floor.toLowerCase().includes('floor')
                ? room.floor
                : `Floor ${room.floor}`;

              return (
                <div key={room.id} className="facility-room-card" onClick={() => onInspectRoom(room)}>
                  <div className="facility-room-card__header">
                    <div className="facility-room-card__header-top">
                      <span className="code-pill">
                        <Layers size={11} style={{ marginRight: '4px' }} /> {floorDisplay}
                      </span>
                      <span className={`status-pill ${isMaintenance ? 'status-pill--inactive' : 'status-pill--active'}`}>
                        <span className="status-pill__dot" />
                        {isMaintenance ? 'Maintenance' : 'Available'}
                      </span>
                    </div>
                    <h4 className="facility-room-card__title" title={room.name}>{room.name}</h4>
                  </div>

                  <div className="facility-room-card__body">
                    <div className="room-card-meta">
                      <div className="room-card-meta__item">
                        <Users size={13} className="room-card-meta__icon" />
                        <span>Capacity: <strong>{room.capacity} People</strong></span>
                      </div>
                      {room.location && (
                        <div className="room-card-meta__item">
                          <DoorOpen size={13} className="room-card-meta__icon" />
                          <span>{room.location}</span>
                        </div>
                      )}
                    </div>
                    <p className="room-card-desc">
                      {room.description || 'Standard display setup and conference seating.'}
                    </p>
                  </div>

                  <div className="facility-room-card__footer" onClick={(e) => e.stopPropagation()}>
                    <div className="facility-room-card__footer-meta">
                      <span className="room-seats-pill">
                        <Users size={12} />
                        <span>{room.capacity} Seats</span>
                      </span>
                    </div>
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
