import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  Layers,
  Search,
  DoorOpen,
  Clock,
  User,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Download,
  Eye,
  XCircle,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import { formatDate } from '../../../utils/dateUtils';

export default function BookingMonitorTab({
  rooms = [],
  floors = [],
  bookings = [],
  search = '',
  onSearchChange,
  floorFilter = 'ALL',
  onFloorFilterChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  onInspectBooking,
  onCancelBooking,
  onExportCSV,
  onInspectRoom,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [activeView, setActiveView] = useState('grid'); // 'grid' (Floor Map) | 'list' (Table)
  const [localSearch, setLocalSearch] = useState(search);
  const [roomPage, setRoomPage] = useState(1);
  const [roomPageSize, setRoomPageSize] = useState(6);

  const now = new Date();
  const currentTimeISO = now.toISOString();

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearchChange) onSearchChange(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
  };

  const handleFloorChange = (newFloor) => {
    setRoomPage(1);
    if (onFloorFilterChange) onFloorFilterChange(newFloor);
  };

  // Compute live occupancy for each room right now
  const getRoomOccupancyStatus = (room) => {
    if (room.status === 'MAINTENANCE') {
      return { status: 'MAINTENANCE', label: 'Under Maintenance', color: 'amber' };
    }
    const currentBooking = bookings.find(
      (b) =>
        b.roomId === room.id &&
        b.status === 'CONFIRMED' &&
        b.startTime <= currentTimeISO &&
        b.endTime >= currentTimeISO
    );
    if (currentBooking) {
      return {
        status: 'OCCUPIED',
        label: 'Occupied Now',
        color: 'rose',
        booking: currentBooking,
      };
    }
    return { status: 'AVAILABLE', label: 'Vacant / Free', color: 'emerald' };
  };

  const filteredRooms = rooms.filter(
    (r) => floorFilter === 'ALL' || r.floor === floorFilter
  );
  const totalRooms = filteredRooms.length;
  const paginatedRooms = filteredRooms.slice(
    (roomPage - 1) * roomPageSize,
    roomPage * roomPageSize
  );

  return (
    <div className="superadmin-tab-content">
      {/* SuperAdmin Toolbar */}
      <div className="superadmin-toolbar">
        <form onSubmit={handleSearchSubmit} className="superadmin-search-form">
          <div className="superadmin-search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search reservations by title, booker, or room..."
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
          {/* Date Picker */}
          <div className="input-wrap input-wrap--date superadmin-date-filter">
            <Calendar size={14} className="input-icon" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="filter-date-input"
              title="Filter by reservation date"
            />
          </div>

          {/* Floor Dropdown */}
          <div className={`superadmin-dropdown-wrap superadmin-dropdown-wrap--compact ${floorFilter !== 'ALL' ? 'superadmin-dropdown-wrap--active' : ''}`}>
            <Layers size={15} className="filter-select-icon" />
            <select
              value={floorFilter}
              onChange={(e) => handleFloorChange(e.target.value)}
              className="superadmin-filter-select"
            >
              <option value="ALL">All Office Floors</option>
              {floors.map((fl) => (
                <option key={fl} value={fl}>{fl}</option>
              ))}
            </select>
          </div>

          {/* Status Segmented Buttons */}
          <div className="status-segment-group">
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('ALL')}
            >
              All <span>{totalCount > 0 ? totalCount : bookings.length}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'CONFIRMED' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('CONFIRMED')}
            >
              Confirmed <span>{confirmedCount}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'CANCELLED' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('CANCELLED')}
            >
              Cancelled <span>{cancelledCount}</span>
            </button>
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`btn btn--sm btn--icon-only ${activeView === 'grid' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setActiveView('grid')}
              title="Live Floor Occupancy Matrix"
            >
              <Activity size={14} />
            </button>
            <button
              type="button"
              className={`btn btn--sm btn--icon-only ${activeView === 'list' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setActiveView('list')}
              title="Reservation List View"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn--outline btn--sm export-btn"
            onClick={onExportCSV}
            title="Export reservation records to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Live Floor Occupancy (Visual Room Status Matrix / Live Table View) */}
      <div className="occupancy-matrix-section">
        <div className="occupancy-matrix-header">
          <div>
            <h3>Real-Time Physical Room Status</h3>
            <p>Live occupancy tracker across campus floors</p>
          </div>
          <div className="occupancy-legend">
            <span className="legend-item"><span className="legend-dot legend-dot--emerald" /> Vacant (Free)</span>
            <span className="legend-item"><span className="legend-dot legend-dot--rose" /> In Session (Occupied)</span>
            <span className="legend-item"><span className="legend-dot legend-dot--amber" /> Maintenance</span>
          </div>
        </div>

        {activeView === 'grid' ? (
          <div className="occupancy-room-grid">
            {paginatedRooms.length === 0 ? (
              <div className="occupancy-empty-state" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <DoorOpen size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No rooms found matching the selected floor filter.</p>
              </div>
            ) : (
              paginatedRooms.map((room) => {
                const occ = getRoomOccupancyStatus(room);
                return (
                  <div
                    key={room.id}
                    className={`occupancy-card occupancy-card--${occ.color}`}
                    onClick={() => onInspectRoom && onInspectRoom(room)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="occupancy-card__top">
                      <span className="floor-badge floor-badge--sm">
                        <Layers size={11} /> {room.floor}
                      </span>
                      <span className={`occupancy-status-pill occupancy-status-pill--${occ.color}`}>
                        <span className="pulse-dot" /> {occ.label}
                      </span>
                    </div>

                    <div className="occupancy-card__title">
                      <DoorOpen size={16} />
                      <h4>{room.name}</h4>
                    </div>

                    <div className="occupancy-card__meta">
                      <span><Users size={13} /> {room.capacity} seats</span>
                      <span><Clock size={13} /> {room.location || 'Main Zone'}</span>
                    </div>

                    {occ.status === 'OCCUPIED' && occ.booking && (
                      <div className="occupancy-active-session">
                        <div className="session-header">
                          <strong>In Session:</strong>
                          <span className="session-time">Until {occ.booking.endTime?.substring(11, 16)}</span>
                        </div>
                        <div className="session-title">"{occ.booking.title}"</div>
                        <div className="session-booker">
                          <User size={12} /> {occ.booking.bookerName}
                        </div>
                      </div>
                    )}

                    {occ.status === 'AVAILABLE' && (
                      <div className="occupancy-vacant-note">
                        <CheckCircle2 size={13} />
                        <span>Available for instant reservation</span>
                      </div>
                    )}

                    {occ.status === 'MAINTENANCE' && (
                      <div className="occupancy-maintenance-note">
                        <Wrench size={13} />
                        <span>Under scheduled facility servicing</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="occupancy-table-responsive table-responsive">
            <table className="superadmin-table occupancy-table">
              <thead>
                <tr>
                  <th>Room Name</th>
                  <th>Floor & Zone</th>
                  <th>Capacity</th>
                  <th>Current Live Status</th>
                  <th>Current Active Session</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="td-empty">
                      <DoorOpen size={32} className="empty-icon" />
                      <p>No rooms found matching the selected floor filter.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRooms.map((room) => {
                    const occ = getRoomOccupancyStatus(room);
                    return (
                      <tr
                        key={room.id}
                        onClick={() => onInspectRoom && onInspectRoom(room)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="td-strong">
                          <div className="entity-cell">
                            <div className="entity-cell__icon entity-cell__icon--indigo">
                              <DoorOpen size={15} />
                            </div>
                            <div className="entity-cell__content">
                              <div className="entity-cell__name">{room.name}</div>
                              <div className="entity-cell__sub">ID: #{room.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="room-floor-tag">
                            <strong>{room.floor}</strong>
                            <span>{room.location || 'Main Zone'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="capacity-pill">
                            <Users size={12} /> {room.capacity} seats
                          </span>
                        </td>
                        <td>
                          <span className={`occupancy-status-pill occupancy-status-pill--${occ.color}`}>
                            <span className="pulse-dot" /> {occ.label}
                          </span>
                        </td>
                        <td>
                          {occ.status === 'OCCUPIED' && occ.booking ? (
                            <div className="table-active-session">
                              <strong>"{occ.booking.title}"</strong>
                              <span>Booked by {occ.booking.bookerName} (until {occ.booking.endTime?.substring(11, 16)})</span>
                            </div>
                          ) : occ.status === 'MAINTENANCE' ? (
                            <span className="table-session-note table-session-note--amber">
                              <Wrench size={12} /> Facility Servicing
                            </span>
                          ) : (
                            <span className="table-session-note table-session-note--green">
                              <CheckCircle2 size={12} /> Available Now
                            </span>
                          )}
                        </td>
                        <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                          <div className="td-actions__group">
                            <button
                              type="button"
                              className="action-btn action-btn--inspect"
                              onClick={() => onInspectRoom && onInspectRoom(room)}
                              title="Inspect Room Details"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Universal Pagination for Real-Time Physical Room Status */}
        <Pagination
          currentPage={roomPage}
          pageSize={roomPageSize}
          totalItems={totalRooms}
          itemName="rooms"
          onPageChange={setRoomPage}
          onPageSizeChange={(newSize) => {
            setRoomPageSize(newSize);
            setRoomPage(1);
          }}
          pageSizeOptions={[3, 6, 9, 12, 24]}
          className="occupancy-matrix-pagination"
        />
      </div>

      {/* Desktop Reservation Log Table */}
      <div className="desktop-table-wrap" style={{ marginTop: '1.5rem' }}>
        <div className="table-header-title">
          <h4>Scheduled Reservations Master Log ({bookings.length} Records)</h4>
        </div>
        <div className="table-responsive">
          <table className="superadmin-table bookings-table">
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Meeting Title</th>
                <th>Room & Floor</th>
                <th>Reserved By</th>
                <th>Attendees</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td-empty">
                    <Activity size={32} className="empty-icon" />
                    <p>No room bookings match the selected date and filter criteria.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const isCancelled = booking.status === 'CANCELLED';
                  const startTimeDisplay = booking.startTime?.substring(11, 16);
                  const endTimeDisplay = booking.endTime?.substring(11, 16);

                  return (
                    <tr
                      key={booking.id}
                      onClick={() => onInspectBooking(booking)}
                    >
                      <td>
                        <div className="schedule-time-pill">
                          <Clock size={13} />
                          <span>{startTimeDisplay} - {endTimeDisplay}</span>
                        </div>
                        <span className="sub-date">{formatDate(booking.startTime)}</span>
                      </td>
                      <td className="td-strong">
                        <div className="entity-cell">
                          <div className="entity-cell__icon entity-cell__icon--blue">
                            <Activity size={15} />
                          </div>
                          <div className="entity-cell__content">
                            <div className="entity-cell__name">{booking.title}</div>
                            <div className="entity-cell__sub">ID: #{booking.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="room-floor-tag">
                          <strong>{booking.roomName}</strong>
                          <span>{booking.floor}</span>
                        </div>
                      </td>
                      <td>
                        <div className="booker-cell">
                          <span className="booker-name">{booking.bookerName}</span>
                          <span className="booker-dept">{booking.departmentName || 'Admin'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="capacity-pill">
                          <Users size={12} /> {booking.attendeesCount || 2}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${isCancelled ? 'status-pill--inactive' : 'status-pill--active'}`}>
                          {isCancelled ? 'Cancelled' : 'Confirmed'}
                        </span>
                      </td>
                      <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="td-actions__group">
                          <button
                            type="button"
                            className="action-btn action-btn--inspect"
                            onClick={() => onInspectBooking(booking)}
                            title="Inspect Booking Details"
                            aria-label={`Inspect ${booking.title}`}
                          >
                            <Eye size={14} />
                          </button>
                          {!isCancelled && onCancelBooking && (
                            <button
                              type="button"
                              className="action-btn action-btn--deactivate"
                              onClick={() => onCancelBooking(booking)}
                              title="Cancel Booking & Free Slot"
                              aria-label={`Cancel ${booking.title}`}
                            >
                              <XCircle size={14} />
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
      </div>

      {/* Mobile Card List (Visible on mobile/tablet < 768px) */}
      <div className="mobile-card-list">
        {bookings.length === 0 ? (
          <div className="mobile-empty-state">
            <Activity size={32} className="empty-icon" />
            <p>No reservations found for current filter.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';
            const startTimeDisplay = booking.startTime?.substring(11, 16);
            const endTimeDisplay = booking.endTime?.substring(11, 16);

            return (
              <div
                key={booking.id}
                className="mobile-card"
                onClick={() => onInspectBooking(booking)}
              >
                <div className="mobile-card__header">
                  <div className="mobile-card__header-left">
                    <div className="mobile-card__title-row">
                      <h4 className="mobile-card__title">{booking.title}</h4>
                      <span className="mobile-card__subtitle">
                        {booking.roomName} • {booking.floor}
                      </span>
                    </div>
                  </div>
                  <span className={`status-pill ${isCancelled ? 'status-pill--inactive' : 'status-pill--active'}`}>
                    {isCancelled ? 'Cancelled' : 'Confirmed'}
                  </span>
                </div>

                <div className="mobile-card__details">
                  <div className="mobile-card__info-row">
                    <Clock size={14} className="mobile-card__icon" />
                    <span>{formatDate(booking.startTime)} • <strong>{startTimeDisplay} - {endTimeDisplay}</strong></span>
                  </div>
                  <div className="mobile-card__info-row">
                    <User size={14} className="mobile-card__icon" />
                    <span>Booked by: <strong>{booking.bookerName}</strong> ({booking.departmentName || 'Admin'})</span>
                  </div>
                  <div className="mobile-card__info-row">
                    <Users size={14} className="mobile-card__icon" />
                    <span>Attendees: <strong>{booking.attendeesCount || 2} People</strong></span>
                  </div>
                </div>

                <div className="mobile-card__footer" onClick={(e) => e.stopPropagation()}>
                  <div className="mobile-card__footer-left">
                    <span className="code-pill">
                      <DoorOpen size={11} style={{ marginRight: '4px' }} />
                      {booking.roomName}
                    </span>
                  </div>
                  <div className="mobile-card__actions">
                    <button
                      type="button"
                      className="action-btn action-btn--inspect"
                      onClick={() => onInspectBooking(booking)}
                      title="Inspect Reservation"
                      aria-label={`Inspect ${booking.title}`}
                    >
                      <Eye size={15} />
                    </button>
                    {!isCancelled && onCancelBooking && (
                      <button
                        type="button"
                        className="action-btn action-btn--deactivate"
                        onClick={() => onCancelBooking(booking)}
                        title="Cancel Reservation"
                        aria-label={`Cancel ${booking.title}`}
                      >
                        <XCircle size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
