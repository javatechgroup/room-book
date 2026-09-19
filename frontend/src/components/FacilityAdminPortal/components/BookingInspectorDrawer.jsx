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
  Radio,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

export default function BookingInspectorDrawer({
  booking,
  onClose,
  onCancelBooking,
}) {
  if (!booking) return null;

  const now = new Date();
  const startTime = booking.startTime?.substring(11, 16);
  const endTime = booking.endTime?.substring(11, 16);

  const getBookingState = () => {
    if (booking.status === 'CANCELLED') {
      return { key: 'CANCELLED', label: 'Cancelled Reservation', badgeClass: 'status-badge--inactive', canCancel: false };
    }
    const end = new Date(booking.endTime);
    const start = new Date(booking.startTime);
    if (now > end) {
      return { key: 'COMPLETED', label: 'Completed Session', badgeClass: 'status-badge--completed', canCancel: false };
    }
    if (now >= start && now <= end) {
      return { key: 'IN_PROGRESS', label: 'In Progress (Active Now)', badgeClass: 'status-badge--live', canCancel: true };
    }
    return { key: 'CONFIRMED', label: 'Confirmed Reservation', badgeClass: 'status-badge--active', canCancel: true };
  };

  const state = getBookingState();

  return (
    <div className="inspector-drawer-overlay" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-drawer__header">
          <div className="inspector-drawer__badge">
            <CalendarCheck2 size={16} />
            <span>Reservation Record</span>
          </div>
          <button type="button" className="inspector-drawer__close" onClick={onClose} aria-label="Close drawer" title="Close (Esc)">
            <X size={20} />
          </button>
        </div>

        <div className="inspector-drawer__body">
          <div className="inspector-hero">
            <div className="inspector-hero__avatar inspector-hero__avatar--booking">
              <CalendarCheck2 size={22} />
            </div>
            <div className="inspector-hero__info">
              <h2>{booking.title}</h2>
              <span className="inspector-hero__code">ID: #{booking.id} • {booking.roomName}</span>
            </div>
          </div>

          <div className="inspector-status-badge-row">
            <span className={`status-badge ${state.badgeClass}`}>
              {state.key === 'IN_PROGRESS' && <Radio size={13} className="blinking-live-icon" />}
              {state.key === 'CANCELLED' && <XCircle size={13} />}
              {state.key === 'CONFIRMED' && <span className="status-badge__dot" />}
              {state.key === 'COMPLETED' && <CheckCircle2 size={13} />}
              <span>{state.label}</span>
            </span>
            <span className="capacity-badge">
              <Users size={14} /> {booking.attendeesCount || 2} Attendees
            </span>
          </div>

          {state.canCancel && onCancelBooking && (
            <div className="inspector-quick-actions">
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => onCancelBooking(booking)}
              >
                <XCircle size={14} /> Cancel Reservation
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
