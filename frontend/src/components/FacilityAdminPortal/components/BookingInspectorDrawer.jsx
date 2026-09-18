import React from 'react';
import {
  X,
  CalendarCheck2,
  DoorOpen,
  Layers,
  User,
  Building2,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

export default function BookingInspectorDrawer({
  booking,
  onClose,
  onCancelBooking,
}) {
  if (!booking) return null;

  const isCancelled = booking.status === 'CANCELLED';
  const startTime = booking.startTime?.substring(11, 16);
  const endTime = booking.endTime?.substring(11, 16);

  return (
    <div className="inspector-drawer-overlay" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-drawer__header">
          <div className="inspector-drawer__badge">
            <CalendarCheck2 size={16} />
            <span>Reservation Record</span>
          </div>
          <button type="button" className="inspector-drawer__close" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="inspector-drawer__body">
          <div className="inspector-hero">
            <div className="inspector-hero__avatar inspector-hero__avatar--booking">
              <CalendarCheck2 size={30} />
            </div>
            <div className="inspector-hero__info">
              <h2>{booking.title}</h2>
              <span className="inspector-hero__code">ID: #{booking.id} • {booking.roomName}</span>
            </div>
          </div>

          <div className="inspector-status-badge-row">
            <span className={`status-badge ${isCancelled ? 'status-badge--inactive' : 'status-badge--active'}`}>
              <span className="status-badge__dot" />
              {isCancelled ? 'Cancelled' : 'Confirmed Reservation'}
            </span>
            <span className="capacity-badge">
              <Users size={14} /> {booking.attendeesCount || 2} Attendees
            </span>
          </div>

          {!isCancelled && onCancelBooking && (
            <div className="inspector-quick-actions">
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => onCancelBooking(booking)}
              >
                <XCircle size={14} /> Cancel & Free Room
              </button>
            </div>
          )}

          <div className="inspector-section">
            <h4 className="inspector-section__title">Reservation Schedule</h4>
            <div className="inspector-meta-list">
              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Calendar size={14} /> Date
                </span>
                <span className="meta-value">{formatDate(booking.startTime)}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Clock size={14} /> Time Slot
                </span>
                <span className="meta-value">{startTime} - {endTime}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <DoorOpen size={14} /> Room
                </span>
                <span className="meta-value">{booking.roomName}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Layers size={14} /> Floor Location
                </span>
                <span className="meta-value">{booking.floor} ({booking.location || 'Main Zone'})</span>
              </div>
            </div>
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">Booker Information</h4>
            <div className="inspector-meta-list">
              <div className="inspector-meta-item">
                <span className="meta-label">
                  <User size={14} /> Reserved By
                </span>
                <span className="meta-value">{booking.bookerName}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Building2 size={14} /> Department
                </span>
                <span className="meta-value">{booking.departmentName || 'Admin'}</span>
              </div>
            </div>
          </div>

          {booking.description && (
            <div className="inspector-section">
              <h4 className="inspector-section__title">Meeting Notes</h4>
              <p className="inspector-desc-box">{booking.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
