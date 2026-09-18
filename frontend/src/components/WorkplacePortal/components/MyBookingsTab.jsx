import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Tag, XCircle } from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import { formatDate } from '../../../utils/dateUtils';

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
            {paginatedBookings.map((b) => (
              <div className="booking-card-row" key={b.id}>
                <div className="booking-card-row__left">
                  <div className="title-row">
                    <h4>{b.roomName}</h4>
                    <span className="purpose-pill">{b.purpose}</span>
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
                <button
                  type="button"
                  className="btn btn--sm btn--release"
                  onClick={() => onCancelBooking(b)}
                >
                  <XCircle size={14} /> Release Slot Early
                </button>
              </div>
            ))}
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
