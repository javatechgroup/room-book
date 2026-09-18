import React, { useState, useEffect } from 'react';
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
  Radio,
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
  const [bookingPage, setBookingPage] = useState(page || 1);
  const [bookingPageSize, setBookingPageSize] = useState(pageSize || 5);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Real-time heartbeat ticker: automatically recalculates statuses every 15 seconds without requiring page refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime;

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Dynamic booking state helper
  const getBookingLifecycleState = (booking) => {
    if (!booking) {
      return { key: 'UNKNOWN', label: 'Unknown', colorClass: 'status-pill--inactive', canCancel: false };
    }
    if (booking.status === 'CANCELLED') {
      return {
        key: 'CANCELLED',
        label: 'Cancelled',
        colorClass: 'status-pill--inactive',
        canCancel: false,
      };
    }
    const end = new Date(booking.endTime);
    const start = new Date(booking.startTime);
    if (now > end) {
      return {
        key: 'COMPLETED',
        label: 'Completed',
        colorClass: 'status-pill--completed',
        canCancel: false,
      };
    }
    if (now >= start && now <= end) {
      return {
        key: 'IN_PROGRESS',
        label: 'In Progress',
        colorClass: 'status-pill--live',
        canCancel: true,
      };
    }
    return {
      key: 'CONFIRMED',
      label: 'Confirmed',
      colorClass: 'status-pill--active',
      canCancel: true,
    };
  };

  const inProgressCount = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    const s = new Date(b.startTime);
    const e = new Date(b.endTime);
    return now >= s && now <= e;
  }).length;

  const upcomingCount = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    const s = new Date(b.startTime);
    return s > now;
  }).length;

  const completedCount = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    const e = new Date(b.endTime);
    return e < now;
  }).length;

  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  const displayedBookings = [...bookings]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .filter((b) => {
      if (statusFilter === 'ALL') return true;
      const state = getBookingLifecycleState(b);
      if (statusFilter === 'IN_PROGRESS') return state.key === 'IN_PROGRESS';
      if (statusFilter === 'CONFIRMED' || statusFilter === 'UPCOMING') return state.key === 'CONFIRMED';
      if (statusFilter === 'COMPLETED') return state.key === 'COMPLETED';
      if (statusFilter === 'CANCELLED') return state.key === 'CANCELLED';
      return true;
    });

  const paginatedBookings = displayedBookings.slice(
    (bookingPage - 1) * bookingPageSize,
    bookingPage * bookingPageSize
  );

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setBookingPage(1);
    if (onSearchChange) onSearchChange(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setBookingPage(1);
    if (onSearchChange) onSearchChange('');
  };

  const handleFloorChange = (newFloor) => {
    setRoomPage(1);
    setBookingPage(1);
    if (onFloorFilterChange) onFloorFilterChange(newFloor);
  };

  const handleStatusFilterChange = (newStatus) => {
    setBookingPage(1);
    if (onStatusFilterChange) onStatusFilterChange(newStatus);
  };

  // Compute live occupancy for each room right now
  const getRoomOccupancyStatus = (room) => {
    if (room.status === 'MAINTENANCE') {
      return { status: 'MAINTENANCE', label: 'Under Maintenance', color: 'amber', isInProgress: false };
    }
    const currentBooking = bookings.find((b) => {
      if (b.status === 'CANCELLED') return false;
      const matchesRoom =
        (b.roomId !== undefined && room.id !== undefined && String(b.roomId) === String(room.id)) ||
        (b.roomName && room.name && b.roomName.trim().toLowerCase() === room.name.trim().toLowerCase());
      if (!matchesRoom) return false;
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      return now >= start && now <= end;
    });

    if (currentBooking) {
      return {
        status: 'OCCUPIED',
        label: 'In Session Now',
        color: 'rose',
        booking: currentBooking,
        isInProgress: true,
      };
    }
    return { status: 'AVAILABLE', label: 'Vacant / Free', color: 'emerald', isInProgress: false };
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
              onChange={(e) => {
                setBookingPage(1);
                if (onDateFilterChange) onDateFilterChange(e.target.value);
              }}
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
              onClick={() => handleStatusFilterChange('ALL')}
            >
              All <span>{bookings.length}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'IN_PROGRESS' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusFilterChange('IN_PROGRESS')}
            >
              <span className="live-blinking-dot" /> In Progress <span>{inProgressCount}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'CONFIRMED' || statusFilter === 'UPCOMING' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusFilterChange('UPCOMING')}
            >
              Upcoming <span>{upcomingCount}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'COMPLETED' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusFilterChange('COMPLETED')}
            >
              Completed <span>{completedCount}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'CANCELLED' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusFilterChange('CANCELLED')}
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
            <span className="legend-item"><span className="live-blinking-dot" /> In Session (Occupied)</span>
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
                    className={`occupancy-card occupancy-card--${occ.color} ${occ.isInProgress ? 'occupancy-card--in-progress' : ''}`}
                    onClick={() => onInspectRoom && onInspectRoom(room)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="occupancy-card__top">
                      <span className="floor-badge floor-badge--sm">
                        <Layers size={11} /> {room.floor}
                      </span>
                      {occ.isInProgress ? (
                        <span className="occupancy-status-pill occupancy-status-pill--live">
                          <Radio size={12} className="blinking-live-icon" /> In Session Now
                        </span>
                      ) : (
                        <span className={`occupancy-status-pill occupancy-status-pill--${occ.color}`}>
                          <span className="pulse-dot" /> {occ.label}
                        </span>
                      )}
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
                          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1d4ed8' }}>
                            <Radio size={12} className="blinking-live-icon" /> In Session:
                          </strong>
                          <span className="session-time">Until {occ.booking.endTime?.substring(11, 16)}</span>
                        </div>
                        <div className="session-title" title={occ.booking.title}>
                          "{occ.booking.title}"
                        </div>
                        <div className="session-booker" title={occ.booking.bookerName}>
                          <User size={12} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {occ.booking.bookerName}
                          </span>
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
                        className={`occupancy-table-row ${occ.isInProgress ? 'tr--in-progress' : ''}`}
                        onClick={() => onInspectRoom && onInspectRoom(room)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="td-strong">
                          <div className="entity-cell">
                            <div className={`entity-cell__icon ${occ.isInProgress ? 'entity-cell__icon--blue' : 'entity-cell__icon--indigo'}`}>
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
                          {occ.isInProgress ? (
                            <span className="occupancy-status-pill occupancy-status-pill--live">
                              <Radio size={12} className="blinking-live-icon" /> In Session Now
                            </span>
                          ) : (
                            <span className={`occupancy-status-pill occupancy-status-pill--${occ.color}`}>
                              <span className="pulse-dot" /> {occ.label}
                            </span>
                          )}
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
          <h4>Scheduled Reservations Master Log ({displayedBookings.length} Records)</h4>
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
              {displayedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td-empty">
                    <Activity size={32} className="empty-icon" />
                    <p>No room bookings match the selected date and filter criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => {
                  const state = getBookingLifecycleState(booking);
                  const startTimeDisplay = booking.startTime?.substring(11, 16);
                  const endTimeDisplay = booking.endTime?.substring(11, 16);

                  return (
                    <tr
                      key={booking.id}
                      className={state.key === 'IN_PROGRESS' ? 'tr--in-progress' : ''}
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
                          <div className={`entity-cell__icon ${state.key === 'IN_PROGRESS' ? 'entity-cell__icon--blue' : 'entity-cell__icon--blue'}`}>
                            {state.key === 'IN_PROGRESS' ? (
                              <Radio size={15} className="blinking-live-icon" />
                            ) : (
                              <Activity size={15} />
                            )}
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
                        <span className={`status-pill ${state.colorClass}`}>
                          {state.key === 'IN_PROGRESS' && <Radio size={12} className="blinking-live-icon" />}
                          {state.key === 'CANCELLED' && <XCircle size={12} />}
                          {state.key === 'CONFIRMED' && <span className="pulse-dot" />}
                          {state.key === 'COMPLETED' && <CheckCircle2 size={12} />}
                          <span>{state.label}</span>
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
                          {state.canCancel && onCancelBooking && (
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

        {/* Universal Pagination for Scheduled Reservations Master Log */}
        <Pagination
          currentPage={bookingPage}
          pageSize={bookingPageSize}
          totalItems={displayedBookings.length}
          itemName="reservations"
          onPageChange={(newPage) => {
            setBookingPage(newPage);
            if (onPageChange) onPageChange(newPage);
          }}
          onPageSizeChange={(newSize) => {
            setBookingPageSize(newSize);
            setBookingPage(1);
            if (onPageSizeChange) onPageSizeChange(newSize);
          }}
          pageSizeOptions={[3, 5, 10, 20]}
          className="bookings-log-pagination"
        />
      </div>

      {/* Mobile Card List (Visible on mobile/tablet < 768px) */}
      <div className="mobile-card-list">
        {displayedBookings.length === 0 ? (
          <div className="mobile-empty-state">
            <Activity size={32} className="empty-icon" />
            <p>No reservations found for current filter.</p>
          </div>
        ) : (
          paginatedBookings.map((booking) => {
            const state = getBookingLifecycleState(booking);
            const startTimeDisplay = booking.startTime?.substring(11, 16);
            const endTimeDisplay = booking.endTime?.substring(11, 16);

            return (
              <div
                key={booking.id}
                className={`mobile-card ${state.key === 'IN_PROGRESS' ? 'tr--in-progress' : ''}`}
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
                  <span className={`status-pill ${state.colorClass}`}>
                    {state.key === 'IN_PROGRESS' && <Radio size={12} className="blinking-live-icon" />}
                    {state.key === 'CANCELLED' && <XCircle size={12} />}
                    {state.key === 'CONFIRMED' && <span className="pulse-dot" />}
                    {state.key === 'COMPLETED' && <CheckCircle2 size={12} />}
                    <span>{state.label}</span>
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
                    {state.canCancel && onCancelBooking && (
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

      {displayedBookings.length > 0 && (
        <Pagination
          currentPage={bookingPage}
          pageSize={bookingPageSize}
          totalItems={displayedBookings.length}
          itemName="reservations"
          onPageChange={(newPage) => {
            setBookingPage(newPage);
            if (onPageChange) onPageChange(newPage);
          }}
          onPageSizeChange={(newSize) => {
            setBookingPageSize(newSize);
            setBookingPage(1);
            if (onPageSizeChange) onPageSizeChange(newSize);
          }}
          pageSizeOptions={[3, 5, 10, 20]}
          className="bookings-log-pagination mobile-only-pagination"
        />
      )}
    </div>
  );
}
