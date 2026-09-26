import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Layers,
  Search,
  DoorOpen,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  CalendarPlus,
  Radio,
  Download,
  Repeat,
  RotateCcw,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';
import Select from '../../common/Select/Select';
import CancelRecurringModal from '../../common/CancelRecurringModal/CancelRecurringModal';
import { formatDate } from '../../../utils/dateUtils';

export default function FacilityMyBookingsTab({
  myBookings = [],
  floors = [],
  onInspectBooking,
  onCancelBooking,
  onEditBooking,
  onOpenBookRoom,
  onExportCSV,
}) {
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [recurringBookingToCancel, setRecurringBookingToCancel] = useState(null);

  const handleRequestCancel = useCallback((booking) => {
    if (booking?.recurrenceId) {
      setRecurringBookingToCancel(booking);
    } else {
      onCancelBooking && onCancelBooking(booking, false);
    }
  }, [onCancelBooking]);

  // 15s real-time heartbeat ticker to dynamically transition meetings from In Progress -> Completed
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime;

  // Dynamic booking state helper
  const getBookingLifecycleState = useCallback((booking) => {
    if (!booking) {
      return { key: 'UNKNOWN', label: 'Unknown', colorClass: 'status-pill--inactive', canCancel: false, canEdit: false };
    }
    if (booking.status === 'CANCELLED') {
      return {
        key: 'CANCELLED',
        label: 'Cancelled',
        colorClass: 'status-pill--inactive',
        canCancel: false,
        canEdit: false,
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
        canEdit: false,
      };
    }
    if (now >= start && now <= end) {
      return {
        key: 'IN_PROGRESS',
        label: 'In Progress',
        colorClass: 'status-pill--live',
        canCancel: true,
        canEdit: false,
      };
    }
    return {
      key: 'CONFIRMED',
      label: 'Confirmed',
      colorClass: 'status-pill--active',
      canCancel: true,
      canEdit: true,
    };
  }, [now]);

  // Memoized Status counts
  const { inProgressCount, upcomingCount, completedCount, cancelledCount } = useMemo(() => {
    let inProgress = 0;
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;

    for (const b of myBookings) {
      if (b.status === 'CANCELLED') {
        cancelled++;
      } else {
        const s = new Date(b.startTime);
        const e = new Date(b.endTime);
        if (now >= s && now <= e) inProgress++;
        else if (s > now) upcoming++;
        else if (e < now) completed++;
      }
    }

    return { inProgressCount: inProgress, upcomingCount: upcoming, completedCount: completed, cancelledCount: cancelled };
  }, [myBookings, now]);

  // Memoized Filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    return [...myBookings]
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .filter((b) => {
        // Floor filter
        if (floorFilter !== 'ALL' && b.floor !== floorFilter) return false;

        // Status filter
        if (statusFilter !== 'ALL') {
          const state = getBookingLifecycleState(b);
          if (statusFilter === 'IN_PROGRESS' && state.key !== 'IN_PROGRESS') return false;
          if ((statusFilter === 'CONFIRMED' || statusFilter === 'UPCOMING') && state.key !== 'CONFIRMED') return false;
          if (statusFilter === 'COMPLETED' && state.key !== 'COMPLETED') return false;
          if (statusFilter === 'CANCELLED' && state.key !== 'CANCELLED') return false;
        }

        // Search filter
        if (search && search.trim()) {
          const q = search.trim().toLowerCase();
          const matchesTitle = b.title && b.title.toLowerCase().includes(q);
          const matchesRoom = b.roomName && b.roomName.toLowerCase().includes(q);
          const matchesDesc = b.description && b.description.toLowerCase().includes(q);
          if (!matchesTitle && !matchesRoom && !matchesDesc) return false;
        }

        return true;
      });
  }, [myBookings, floorFilter, statusFilter, search, getBookingLifecycleState]);

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
  }, [filteredBookings, page, pageSize]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleFloorChange = (newFloor) => {
    setFloorFilter(newFloor);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || floorFilter !== 'ALL' || statusFilter !== 'ALL');

  const handleResetFilters = () => {
    setSearch('');
    setFloorFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  return (
    <div className="superadmin-tab-content">
      {/* Toolbar */}
      <div className="superadmin-toolbar">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search my reservations by title, room, or notes..."
        />

        <div className="superadmin-filter-group">
          {/* Floor Dropdown */}
          <Select
            size="sm"
            icon={<Layers size={15} />}
            value={floorFilter}
            onChange={(val) => handleFloorChange(val)}
            placeholder={null}
            options={[
              { value: 'ALL', label: 'All Office Floors' },
              ...floors.map((fl) => ({ value: fl, label: fl })),
            ]}
            wrapperStyle={{ minWidth: '175px', width: 'auto' }}
          />

          {/* Status Segmented Buttons */}
          <div className="status-segment-group">
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusFilterChange('ALL')}
            >
              All <span>{myBookings.length}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'IN_PROGRESS' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusFilterChange('IN_PROGRESS')}
            >
              <span className="live-blinking-dot" /> In&nbsp;Progress <span>{inProgressCount}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'UPCOMING' ? 'status-segment-btn--active' : ''}`}
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

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleResetFilters}
              title="Reset all filters"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {onOpenBookRoom && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onOpenBookRoom}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <CalendarPlus size={14} />
              <span>Book a Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table-wrap" style={{ marginTop: '1.25rem' }}>
        <div className="table-header-title">
          <h4>My Scheduled Reservations ({filteredBookings.length} Records)</h4>
        </div>
        <div className="table-responsive">
          <table className="superadmin-table my-bookings-table">
            <thead>
              <tr>
                <th className="th-booking-time">Time Slot</th>
                <th className="th-booking-title">Meeting Title</th>
                <th className="th-booking-room">Room & Floor</th>
                <th className="th-booking-attendees">Attendees</th>
                <th className="th-status">Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="td-empty">
                    <CalendarCheck2 size={32} className="empty-icon" />
                    <p>No reservations found matching your selected filter criteria.</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        style={{ marginTop: '0.75rem' }}
                        onClick={handleResetFilters}
                      >
                        Clear Search & Filters
                      </button>
                    )}
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
                      onClick={() => onInspectBooking && onInspectBooking(booking)}
                    >
                      <td className="td-booking-time">
                        <div className="schedule-time-col">
                          <div className="schedule-time-pill">
                            <Clock size={13} />
                            <span>{startTimeDisplay} - {endTimeDisplay}</span>
                          </div>
                          <span className="sub-date">{formatDate(booking.startTime)}</span>
                        </div>
                      </td>
                      <td className="td-booking-title td-strong">
                        <div className="entity-cell entity-cell--single-row">
                          <div className={`entity-cell__icon ${state.key === 'IN_PROGRESS' ? 'entity-cell__icon--blue' : 'entity-cell__icon--blue'}`}>
                            {state.key === 'IN_PROGRESS' ? (
                              <Radio size={15} className="blinking-live-icon" />
                            ) : (
                              <CalendarCheck2 size={15} />
                            )}
                          </div>
                          <div className="entity-cell__content entity-cell__content--single-row">
                            <span className="entity-cell__name" title={booking.title}>{booking.title}</span>
                            {booking.recurrenceId && (
                              <span
                                className="recurrence-badge"
                                title={`Recurring reservation (${booking.recurrenceRule || 'Series'})`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  color: '#d97706',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                }}
                              >
                                <Repeat size={10} /> {booking.recurrenceRule || 'RECURRING'}
                              </span>
                            )}
                            {(booking.departmentName || booking.companyName) && (
                              <span className="entity-cell__dept-badge">
                                {booking.departmentName || booking.companyName}
                              </span>
                            )}
                            {booking.description && (
                              <span className="entity-cell__desc-inline" title={booking.description}>
                                • {booking.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="td-booking-room">
                        <div className="room-floor-inline">
                          <strong>{booking.roomName}</strong>
                          <span className="room-floor-inline__floor">
                            • {booking.floor
                              ? (booking.floor.toString().toLowerCase().includes('floor')
                                ? booking.floor
                                : `Floor ${booking.floor}`)
                              : booking.location || 'Main Floor'}
                          </span>
                        </div>
                      </td>
                      <td className="td-booking-attendees">
                        <span className="capacity-pill" title={`${booking.attendeesCount || 2} Attendees`}>
                          <Users size={12} /> {booking.attendeesCount || 2}
                        </span>
                      </td>
                      <td className="td-status">
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
                          {onInspectBooking && (
                            <button
                              type="button"
                              className="action-btn action-btn--inspect"
                              onClick={() => onInspectBooking(booking)}
                              title="Inspect Reservation Details"
                              aria-label={`Inspect ${booking.title}`}
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          {onEditBooking && (
                            <button
                              type="button"
                              className="action-btn action-btn--edit"
                              onClick={() => onEditBooking(booking)}
                              disabled={!state.canEdit}
                              title={
                                state.key === 'IN_PROGRESS'
                                  ? 'Meeting has already begun — editing is locked'
                                  : state.canEdit
                                  ? 'Edit room, time, or participants'
                                  : 'Cannot edit past or cancelled reservation'
                              }
                              aria-label={`Edit ${booking.title}`}
                            >
                              <Edit2 size={15} />
                            </button>
                          )}
                          {onCancelBooking && (
                            <button
                              type="button"
                              className="action-btn action-btn--deactivate"
                              onClick={() => handleRequestCancel(booking)}
                              disabled={!state.canCancel}
                              title={state.canCancel ? 'Cancel Reservation & Free Room' : 'Cannot cancel past or cancelled reservation'}
                              aria-label={`Cancel ${booking.title}`}
                            >
                              <XCircle size={15} />
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

        {/* Universal Pagination for My Bookings */}
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredBookings.length}
          itemName="reservations"
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[3, 5, 10, 20]}
          className="bookings-log-pagination"
        />
      </div>

      {/* Mobile Card List (< 768px) */}
      <div className="mobile-card-list">
        {filteredBookings.length === 0 ? (
          <div className="mobile-empty-state">
            <CalendarCheck2 size={32} className="empty-icon" />
            <p>No reservations found for current filter.</p>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                style={{ marginTop: '0.75rem' }}
                onClick={handleResetFilters}
              >
                Clear Search & Filters
              </button>
            )}
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
                onClick={() => onInspectBooking && onInspectBooking(booking)}
              >
                <div className="mobile-card__header">
                  <div className="mobile-card__header-left">
                    <div className="mobile-card__title-row">
                      <h4 className="mobile-card__title" title={booking.title}>{booking.title}</h4>
                      <span className="mobile-card__subtitle">
                        {booking.roomName} • {booking.floor}
                      </span>
                      {booking.recurrenceId && (
                        <div style={{ marginTop: '4px' }}>
                          <span
                            className="recurrence-badge"
                            title={`Recurring reservation (${booking.recurrenceRule || 'Series'})`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: '#d97706',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                            }}
                          >
                            <Repeat size={10} /> {booking.recurrenceRule || 'RECURRING'}
                          </span>
                        </div>
                      )}
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
                    {onInspectBooking && (
                      <button
                        type="button"
                        className="action-btn action-btn--inspect"
                        onClick={() => onInspectBooking(booking)}
                        title="Inspect Reservation"
                        aria-label={`Inspect ${booking.title}`}
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    {state.canCancel && onCancelBooking && (
                      <button
                        type="button"
                        className="action-btn action-btn--deactivate"
                        onClick={() => handleRequestCancel(booking)}
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

      {filteredBookings.length > 0 && (
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredBookings.length}
          itemName="reservations"
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[3, 5, 10, 20]}
          className="bookings-log-pagination mobile-only-pagination"
        />
      )}

      {/* Recurrence Cancellation Scope Modal */}
      {recurringBookingToCancel && (
        <CancelRecurringModal
          isOpen={Boolean(recurringBookingToCancel)}
          booking={recurringBookingToCancel}
          onCancelSingle={(target) => {
            setRecurringBookingToCancel(null);
            onCancelBooking && onCancelBooking(target, false);
          }}
          onCancelSeries={(target) => {
            setRecurringBookingToCancel(null);
            onCancelBooking && onCancelBooking(target, true);
          }}
          onClose={() => setRecurringBookingToCancel(null)}
        />
      )}
    </div>
  );
}
