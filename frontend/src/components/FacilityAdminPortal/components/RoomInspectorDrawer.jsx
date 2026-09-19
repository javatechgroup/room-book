import React from 'react';
import {
  X,
  DoorOpen,
  Layers,
  Users,
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
  CalendarCheck2,
  Edit2,
  CalendarPlus,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

export default function RoomInspectorDrawer({
  room,
  onClose,
  onEdit,
  onToggleMaintenance,
  onBookRoom,
  todayBookings = [],
}) {
  if (!room) return null;

  const isMaintenance = room.status === 'MAINTENANCE';
  const roomBookings = todayBookings.filter(
    (b) => b.roomId === room.id && b.status !== 'CANCELLED'
  );

  return (
    <div className="inspector-drawer-overlay" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-drawer__header">
          <div className="inspector-drawer__badge">
            <DoorOpen size={16} />
            <span>Room Specifications</span>
          </div>
          <button type="button" className="inspector-drawer__close" onClick={onClose} aria-label="Close drawer" title="Close (Esc)">
            <X size={20} />
          </button>
        </div>

        <div className="inspector-drawer__body">
          <div className="inspector-hero">
            <div className="inspector-hero__avatar inspector-hero__avatar--room">
              <DoorOpen size={22} />
            </div>
            <div className="inspector-hero__info">
              <h2>{room.name}</h2>
              <span className="inspector-hero__code">{room.floor} • {room.location || 'Main Zone'}</span>
            </div>
          </div>

          <div className="inspector-status-badge-row">
            <span className={`status-badge ${isMaintenance ? 'status-badge--inactive' : 'status-badge--active'}`}>
              <span className="status-badge__dot" />
              {isMaintenance ? 'Under Maintenance' : 'Available for Booking'}
            </span>
            <span className="capacity-badge">
              <Users size={14} /> {room.capacity} Seats
            </span>
          </div>

          <div className="inspector-quick-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                if (onClose) onClose();
                if (onEdit) onEdit(room);
              }}
            >
              <Edit2 size={14} /> Edit Room
            </button>
            <button
              type="button"
              className={`btn btn--sm ${isMaintenance ? 'btn--success' : 'btn--warning'}`}
              onClick={() => onToggleMaintenance(room.id)}
            >
              {isMaintenance ? (
                <>
                  <CheckCircle2 size={14} /> Make Available
                </>
              ) : (
                <>
                  <Wrench size={14} /> Maintenance
                </>
              )}
            </button>
            {!isMaintenance && onBookRoom && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  if (onClose) onClose();
                  if (onBookRoom) onBookRoom(room);
                }}
              >
                <CalendarPlus size={14} /> Book Room
              </button>
            )}
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">Facility Details</h4>
            <div className="inspector-meta-list">
              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Layers size={14} /> Floor
                </span>
                <span className="meta-value">{room.floor}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <MapPin size={14} /> Location / Wing
                </span>
                <span className="meta-value">{room.location || 'General Zone'}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Users size={14} /> Capacity
                </span>
                <span className="meta-value">{room.capacity} people max</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Clock size={14} /> Created
                </span>
                <span className="meta-value">{formatDate(room.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">Equipment & Amenities</h4>
            <p className="inspector-desc-box">
              {room.description || 'Standard display screen, conference table, and power outlets.'}
            </p>
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">
              Today's Schedule ({roomBookings.length} {roomBookings.length === 1 ? 'Slot' : 'Slots'})
            </h4>
            {roomBookings.length === 0 ? (
              <div className="inspector-empty-schedule">
                <CheckCircle2 size={18} />
                <span>No active reservations today. Slot is fully vacant.</span>
              </div>
            ) : (
              <div className="inspector-schedule-list">
                {roomBookings.map((b) => (
                  <div key={b.id} className="inspector-schedule-item">
                    <div className="schedule-time">
                      <Clock size={13} />
                      <span>{b.startTime?.substring(11, 16)} - {b.endTime?.substring(11, 16)}</span>
                    </div>
                    <div className="schedule-details">
                      <strong>{b.title}</strong>
                      <span>Booked by {b.bookerName} ({b.departmentName || 'Staff'})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
