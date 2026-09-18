import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Tag, XCircle } from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import { formatDate } from '../../../utils/dateUtils';

const isSlotInPast = (dateStr, slotStr) => {
  if (!dateStr || !slotStr) return false;
  try {
    const timeParts = slotStr.split('-');
    const endTimePart = (timeParts[1] || timeParts[0]).trim();
    const [time, period] = endTimePart.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = dateStr.split('-').map(Number);
    const slotEnd = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return slotEnd < new Date();
  } catch (_) {
    return false;
  }
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
        <span className="counter-pill">{myBookings.length} Active Slots</span>
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
              const isCompleted = isSlotInPast(b.date, b.slot);

              return (
                <div className="booking-card-row" key={b.id}>
                  <div className="booking-card-row__left">
                    <div className="title-row">
                      <h4>{b.roomName}</h4>
                      <span className="purpose-pill">{b.purpose}</span>
                      {isCompleted && (
                        <span className="status-pill status-pill--completed" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="meta-row">
                      <span>
                        <MapPin size={13} /> {b.floor}
                      </span>
                      <span>
                        <Calendar size={13} /> {formatDate(b.date)}
                      </span>
                      <span>
                        <Clock size={13} /> {b.slot}
                      </span>
                      <span>
                        <Tag size={13} /> {b.department}
                      </span>
                    </div>
                  </div>
                  {!isCompleted && (
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
