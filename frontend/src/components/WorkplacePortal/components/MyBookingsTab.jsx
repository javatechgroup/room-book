import React, { useState, useMemo, useCallback } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Radio,
  MapPin,
  Tag,
  CalendarPlus,
  DoorOpen,
  FileText,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';
import BookingInspectorDrawer from '../../FacilityAdminPortal/components/BookingInspectorDrawer';
import { formatDate } from '../../../utils/dateUtils';

const formatTimeRange = (startISO, endISO, slotFallback) => {
  if (slotFallback) return slotFallback;
  if (!startISO || !endISO) return 'Scheduled Slot';
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const formatH = (d) => {
      let h = d.getHours();
      const p = h >= 12 ? 'PM' : 'AM';
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      return `${String(h12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${p}`;
    };
    return `${formatH(s)} - ${formatH(e)}`;
  } catch (_) {
    return slotFallback || 'Scheduled Slot';
  }
};

export default function MyBookingsTab({
  myBookings = [],
  onCancelBooking,
  onEditBooking,
  onGoToSlotFinder,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const getBookingState = useCallback((booking) => {
    if (!booking) {
      return { key: 'UNKNOWN', label: 'Unknown', colorClass: 'status-pill--inactive', canCancel: false };
    }
    if (booking.status === 'CANCELLED') {
      return { key: 'CANCELLED', label: 'Cancelled', colorClass: 'status-pill--inactive', canCancel: false };
    }
    const end = new Date(booking.endTime || booking.date);
    const start = new Date(booking.startTime || booking.date);
    const now = new Date();
    if (end < now) {
      return { key: 'COMPLETED', label: 'Completed', colorClass: 'status-pill--completed', canCancel: false };
    }
    if (start <= now && end > now) {
      return { key: 'IN_PROGRESS', label: 'In Progress', colorClass: 'status-pill--active', canCancel: true };
    }
    return { key: 'CONFIRMED', label: 'Confirmed', colorClass: 'status-pill--active', canCancel: true };
  }, []);

  // Compute status counts for filter tabs
  const counts = useMemo(() => {
    let inProgress = 0;
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;

    for (const b of myBookings) {
      const state = getBookingState(b);
      if (state.key === 'IN_PROGRESS') inProgress++;
      else if (state.key === 'CONFIRMED') upcoming++;
      else if (state.key === 'COMPLETED') completed++;
      else if (state.key === 'CANCELLED') cancelled++;
    }

    return {
      all: myBookings.length,
      inProgress,
      upcoming,
      completed,
      cancelled,
    };
  }, [myBookings, getBookingState]);

  // Filtered & sorted reservations
  const filteredBookings = useMemo(() => {
    return [...myBookings]
      .sort((a, b) => new Date(b.startTime || b.date) - new Date(a.startTime || a.date))
      .filter((b) => {
        const state = getBookingState(b);

        // Status filter
        if (statusFilter === 'IN_PROGRESS' && state.key !== 'IN_PROGRESS') return false;
        if (statusFilter === 'UPCOMING' && state.key !== 'CONFIRMED') return false;
        if (statusFilter === 'COMPLETED' && state.key !== 'COMPLETED') return false;
        if (statusFilter === 'CANCELLED' && state.key !== 'CANCELLED') return false;

        // Search query
        if (search && search.trim()) {
          const q = search.trim().toLowerCase();
          const matchTitle = (b.title || b.purpose || '').toLowerCase().includes(q);
          const matchRoom = (b.roomName || '').toLowerCase().includes(q);
          const matchFloor = (b.floor || b.location || '').toLowerCase().includes(q);
          const matchDept = (b.departmentName || b.department || '').toLowerCase().includes(q);
          if (!matchTitle && !matchRoom && !matchFloor && !matchDept) return false;
        }

        return true;
      });
  }, [myBookings, statusFilter, search, getBookingState]);

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredBookings, page, pageSize]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="portal-card bookings-panel">
      {/* Header */}
      <div className="bookings-panel-header">
        <div>
          <h3>My Scheduled Reservations</h3>
          <p>Manage your reserved meeting spaces. Inspect details, export calendar invites, or release slots early.</p>
        </div>
        <span className="counter-pill">
          {myBookings.filter((b) => b.status !== 'CANCELLED').length} Active Slots
        </span>
      </div>

      {/* Toolbar: Search, Status Filter, and Book Button */}
      <div className="bookings-toolbar">
        <div className="bookings-toolbar__left">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by title, room, or floor..."
          />
        </div>

        <div className="bookings-toolbar__right">
          <div className="status-segment-group">
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusChange('ALL')}
            >
              All <span>{counts.all}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'IN_PROGRESS' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusChange('IN_PROGRESS')}
            >
              In Progress <span>{counts.inProgress}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'UPCOMING' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusChange('UPCOMING')}
            >
              Upcoming <span>{counts.upcoming}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'COMPLETED' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusChange('COMPLETED')}
            >
              Completed <span>{counts.completed}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'CANCELLED' ? 'status-segment-btn--active' : ''}`}
              onClick={() => handleStatusChange('CANCELLED')}
            >
              Cancelled <span>{counts.cancelled}</span>
            </button>
          </div>

          {onGoToSlotFinder && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onGoToSlotFinder}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarPlus size={14} />
              <span>Book a Room</span>
            </button>
          )}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-bookings" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <CalendarCheck2 size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
            {myBookings.length === 0
              ? 'You have no scheduled room reservations.'
              : 'No reservations match your filter criteria.'}
          </p>
          {myBookings.length === 0 && onGoToSlotFinder && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onGoToSlotFinder}
              style={{ marginTop: '12px' }}
            >
              Book a Room Slot
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (Matches Image 1) */}
          <div className="desktop-table-wrap">
            <div className="table-responsive">
              <table className="superadmin-table my-bookings-table">
              <thead>
                <tr>
                  <th>Time & Date</th>
                  <th>Meeting Title</th>
                  <th>Room & Floor</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((b) => {
                  const state = getBookingState(b);
                  const dateVal = b.startTime ? b.startTime.split('T')[0] : b.date;
                  const timeRange = formatTimeRange(b.startTime, b.endTime, b.slot);

                  return (
                    <tr
                      key={b.id}
                      className={state.key === 'IN_PROGRESS' ? 'tr--in-progress' : ''}
                      onClick={() => setSelectedBooking(b)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="schedule-time-col">
                          <div className="schedule-time-pill">
                            <Clock size={13} />
                            <span>{timeRange}</span>
                          </div>
                          <span className="sub-date">{formatDate(dateVal)}</span>
                        </div>
                      </td>

                      <td className="td-strong">
                        <div className="entity-cell entity-cell--single-row">
                          <div
                            className={`entity-cell__icon ${
                              state.key === 'IN_PROGRESS' ? 'entity-cell__icon--live' : ''
                            }`}
                          >
                            {state.key === 'IN_PROGRESS' ? (
                              <Radio size={15} className="blinking-live-icon" />
                            ) : (
                              <CalendarCheck2 size={15} />
                            )}
                          </div>
                          <div className="entity-cell__content entity-cell__content--single-row">
                            <span className="entity-cell__name" title={b.title || b.purpose}>
                              {b.title || b.purpose || 'Meeting'}
                            </span>
                            {(b.departmentName || b.department) && (
                              <span className="entity-cell__dept-badge">
                                {b.departmentName || b.department}
                              </span>
                            )}
                            {b.description && (
                              <span className="entity-cell__desc-inline" title={b.description}>
                                • {b.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="room-floor-inline">
                          <strong>{b.roomName}</strong>
                          <span className="room-floor-inline__floor">
                            • {b.floor
                              ? b.floor.toString().toLowerCase().includes('floor')
                                ? b.floor
                                : `Floor ${b.floor}`
                              : b.location || 'Main Floor'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="capacity-pill" title={`${b.attendeesCount || 2} Attendees`}>
                          <Users size={12} /> {b.attendeesCount || 2}
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
                            onClick={() => setSelectedBooking(b)}
                            title="Inspect Meeting Details"
                            aria-label={`Inspect ${b.title || b.purpose}`}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            onClick={() => onEditBooking && onEditBooking(b)}
                            disabled={!state.canCancel}
                            title={
                              state.canCancel
                                ? 'Edit & Reschedule in Book a Slot'
                                : 'Cannot edit past or cancelled reservation'
                            }
                            aria-label={`Edit ${b.title || b.purpose}`}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="action-btn action-btn--deactivate"
                            onClick={() => onCancelBooking(b)}
                            disabled={!state.canCancel}
                            title={
                              state.canCancel
                                ? 'Release Slot Early'
                                : 'Cannot release past or cancelled reservation'
                            }
                            aria-label={`Release ${b.title || b.purpose}`}
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Mobile Card List (< 768px) */}
          <div className="mobile-card-list">
            {paginatedBookings.map((b) => {
              const state = getBookingState(b);
              const dateVal = b.startTime ? b.startTime.split('T')[0] : b.date;
              const timeRange = formatTimeRange(b.startTime, b.endTime, b.slot);

              return (
                <div
                  key={b.id}
                  className="mobile-card"
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className="mobile-card__header">
                    <div>
                      <h4 className="mobile-card__title">{b.title || b.purpose || 'Meeting'}</h4>
                      <span className="mobile-card__subtitle">
                        {b.roomName} • {b.floor || b.location || 'Floor'}
                      </span>
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
                      <Clock size={14} />
                      <span>{formatDate(dateVal)} • <strong>{timeRange}</strong></span>
                    </div>
                    <div className="mobile-card__info-row">
                      <Users size={14} />
                      <span>Attendees: <strong>{b.attendeesCount || 2} People</strong></span>
                    </div>
                    {(b.department || b.departmentName) && (
                      <div className="mobile-card__info-row">
                        <Tag size={14} />
                        <span>Department: {b.departmentName || b.department}</span>
                      </div>
                    )}
                    {b.description && (
                      <div className="mobile-card__info-row">
                        <FileText size={14} />
                        <span>Notes: {b.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="mobile-card__footer" onClick={(e) => e.stopPropagation()}>
                    <span className="code-pill">
                      <DoorOpen size={12} style={{ marginRight: '4px' }} />
                      {b.roomName}
                    </span>

                    <div className="mobile-card__actions">
                      <button
                        type="button"
                        className="action-btn action-btn--inspect"
                        onClick={() => setSelectedBooking(b)}
                        title="Inspect Meeting Details"
                        aria-label="Inspect meeting details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-btn action-btn--edit"
                        onClick={() => onEditBooking && onEditBooking(b)}
                        disabled={!state.canCancel}
                        title={
                          state.canCancel
                            ? 'Edit & Reschedule in Book a Slot'
                            : 'Cannot edit slot'
                        }
                        aria-label="Edit reservation details"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-btn action-btn--deactivate"
                        onClick={() => onCancelBooking(b)}
                        disabled={!state.canCancel}
                        title={state.canCancel ? 'Release Slot Early' : 'Cannot release slot'}
                        aria-label="Release slot early"
                      >
                        <XCircle size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
            pageSizeOptions={[5, 10, 20]}
          />
        </>
      )}

      {/* Slide-out Inspector Drawer for Booking Details */}
      {selectedBooking && (
        <BookingInspectorDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancelBooking={async (bookingToCancel) => {
            const success = await onCancelBooking(bookingToCancel);
            if (success) {
              setSelectedBooking(null);
            }
          }}
          onEditBooking={(bookingToEdit) => {
            setSelectedBooking(null);
            if (onEditBooking) onEditBooking(bookingToEdit);
          }}
        />
      )}
    </div>
  );
}
