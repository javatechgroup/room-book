import React from 'react';
import { X, DoorOpen, Layers, Users, MapPin, AlignLeft, CheckCircle2, Wrench } from 'lucide-react';

export default function RoomModal({
  isOpen,
  onClose,
  editingRoom,
  form,
  onChange,
  onSubmit,
  floors = [],
  onNavigateToFloors,
}) {
  if (!isOpen) return null;

  const isEdit = Boolean(editingRoom);
  // Normalize floors (handles array of objects or strings)
  const normalizedFloors = Array.from(
    new Set(
      floors.map((f) => (typeof f === 'string' ? f : f.name)).filter(Boolean)
    )
  );

  // If editing an existing room that has a floor not in the list, keep it visible
  if (form.floor && !normalizedFloors.includes(form.floor)) {
    normalizedFloors.push(form.floor);
  }

  return (
    <div className="superadmin-modal-overlay" onClick={onClose}>
      <div className="superadmin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="superadmin-modal-header">
          <div className="superadmin-modal-header__icon">
            <DoorOpen size={20} />
          </div>
          <div className="superadmin-modal-header__text">
            <h3>{isEdit ? 'Update Meeting Room' : 'Create New Meeting Room'}</h3>
            <p>{isEdit ? `Edit details for ${editingRoom.name}` : 'Add a physical conference space to an office floor'}</p>
          </div>
          <button type="button" className="superadmin-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="superadmin-modal-form">
          <div className="form-group">
            <label htmlFor="room-name">Room Name *</label>
            <div className="input-wrap">
              <DoorOpen size={16} className="input-icon" />
              <input
                id="room-name"
                type="text"
                placeholder="e.g., Focus Pod 101, Boardroom Alpha"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row form-row--2col">
            <div className="form-group">
              <label htmlFor="room-floor">Floor Location *</label>
              <div className="input-wrap">
                <Layers size={16} className="input-icon" />
                <select
                  id="room-floor"
                  value={form.floor || ''}
                  onChange={(e) => onChange({ ...form, floor: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    {normalizedFloors.length > 0 ? 'Select Office Floor' : 'No floors created yet'}
                  </option>
                  {normalizedFloors.map((fl) => (
                    <option key={fl} value={fl}>{fl}</option>
                  ))}
                </select>
              </div>
              {normalizedFloors.length === 0 && onNavigateToFloors && (
                <small style={{ color: 'var(--color-primary)', marginTop: '4px', display: 'block', cursor: 'pointer' }} onClick={onNavigateToFloors}>
                  + Create a floor first in Floors tab
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="room-capacity">Seating Capacity (People) *</label>
              <div className="input-wrap">
                <Users size={16} className="input-icon" />
                <input
                  id="room-capacity"
                  type="number"
                  min="1"
                  max="500"
                  placeholder="e.g., 6"
                  value={form.capacity}
                  onChange={(e) => onChange({ ...form, capacity: parseInt(e.target.value, 10) || '' })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="room-location">Wing / Specific Zone</label>
            <div className="input-wrap">
              <MapPin size={16} className="input-icon" />
              <input
                id="room-location"
                type="text"
                placeholder="e.g., East Wing - Near Elevator B"
                value={form.location}
                onChange={(e) => onChange({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="room-desc">Description & Equipment / Amenities</label>
            <div className="input-wrap">
              <AlignLeft size={16} className="input-icon input-icon--textarea" />
              <textarea
                id="room-desc"
                rows={3}
                placeholder="e.g., 85-inch 4K UHD display, omnidirectional mic array, digital whiteboard, ergonomic chairs..."
                value={form.description}
                onChange={(e) => onChange({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Operational Status</label>
            <div className="status-radio-group">
              <label className={`status-radio-card ${form.status === 'AVAILABLE' ? 'status-radio-card--active-green' : ''}`}>
                <input
                  type="radio"
                  name="room-status"
                  value="AVAILABLE"
                  checked={form.status === 'AVAILABLE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <CheckCircle2 size={16} />
                <div>
                  <strong>Available</strong>
                  <span>Open for staff reservations</span>
                </div>
              </label>

              <label className={`status-radio-card ${form.status === 'MAINTENANCE' ? 'status-radio-card--active-amber' : ''}`}>
                <input
                  type="radio"
                  name="room-status"
                  value="MAINTENANCE"
                  checked={form.status === 'MAINTENANCE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <Wrench size={16} />
                <div>
                  <strong>Under Maintenance</strong>
                  <span>Locked from new bookings</span>
                </div>
              </label>
            </div>
          </div>

          <div className="superadmin-modal-actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isEdit ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
