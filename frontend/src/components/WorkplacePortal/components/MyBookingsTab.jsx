import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Tag, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
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

const getBookingState = (booking) => {
  if (booking.status === 'CANCELLED') {
    return { key: 'CANCELLED', label: 'Cancelled', colorClass: 'status-pill--inactive', canCancel: false };
  }
  const end = new Date(booking.endTime || booking.date);
  const now = new Date();
  if (end < now) {
    return { key: 'COMPLETED', label: 'Completed', colorClass: 'status-pill--completed', canCancel: false };
  }
  const start = new Date(booking.startTime || booking.date);
  if (start <= now && end > now) {
    return { key: 'IN_PROGRESS', label: 'In Progress', colorClass: 'status-pill--active', canCancel: true };
  }
  return { key: 'CONFIRMED', label: 'Confirmed', colorClass: 'status-pill--active', canCancel: true };
};

export default function MyBookingsTab({
  myBookings = [],
  onCancelBooking,
  onGoToSlotFinder,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const paginatedBookings = myBookings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="portal-card bookings-panel">
      <div className="panel-header">
        <div>
          <h3>My Active Physical Room Reservations</h3>
          <p>Manage your upcoming meetings. Please release slots if your meeting finishes early.</p>
        </div>
        <span className="counter-pill">{myBookings.filter((b) => b.status !== 'CANCELLED').length} Active Slots</span>
      </div>

      {myBookings.length === 0 ? (
        <div className="empty-bookings">
          <Calendar size={40} />
          <p>You have no scheduled room bookings.</p>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onGoToSlotFinder}
          >
            Book a Room Slot
          </button>
        </div>
      ) : (
        <>
          <div className="bookings-list">
            {paginatedBookings.map((b) => {
              const state = getBookingState(b);
              const dateVal = b.startTime ? b.startTime.split('T')[0] : b.date;
              const timeRange = formatTimeRange(b.startTime, b.endTime, b.slot);

              return (
                <div className="booking-card-row" key={b.id}>
                  <div className="booking-card-row__left">
                    <div className="title-row">
                      <h4>{b.roomName}</h4>
                      <span className="purpose-pill">{b.title || b.purpose || 'Strategy Meeting'}</span>
                      <span className={`status-pill ${state.colorClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {state.label}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span>
                        <MapPin size={13} /> {b.floor || b.location || 'Main Floor'}
                      </span>
                      <span>
                        <Calendar size={13} /> {formatDate(dateVal)}
                      </span>
                      <span>
                        <Clock size={13} /> {timeRange}
                      </span>
                      <span>
                        <Tag size={13} /> {b.departmentName || b.department || 'General'}
                      </span>
                      {b.attendeesCount && (
                        <span>
                          👥 {b.attendeesCount} attendees
                        </span>
                      )}
                    </div>
                  </div>
                  {state.canCancel && (
                    <button
                      type="button"
                      className="btn btn--sm btn--release"
                      onClick={() => onCancelBooking(b)}
                    >
                      <XCircle size={14} /> Release Slot Early
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={myBookings.length}
            itemName="reservations"
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
