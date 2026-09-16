import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Monitor,
  Building,
  Check,
  CalendarCheck2,
  Wrench,
  FileText,
  Tag,
} from 'lucide-react';
import DoorTabletPreview from './DoorTabletPreview';
import { TIME_SLOTS, FLOORS } from '../data/workplaceData';

export default function SlotFinderTab({
  rooms,
  filteredRooms,
  currentRoom,
  selectedFloor,
  onFloorChange,
  selectedRoomId,
  onRoomSelect,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotChange,
  bookingPurpose,
  onBookingPurposeChange,
  department,
  onDepartmentChange,
  isMaintenance,
  isOccupied,
  currentOccupant,
  alternativeRooms,
  policies,
  onBookRoom,
  isAdmin,
  onGoToAdmin,
}) {
  if (!currentRoom) {
    return (
      <div className="portal-card" style={{ padding: '64px 20px', textAlign: 'center' }}>
        <Building size={48} style={{ color: 'var(--text-faint)', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px' }}>
          No Physical Meeting Rooms Registered
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
          There are currently no meeting rooms configured for this facility.
          {isAdmin ? ' Use the Facilities Console tab to configure meeting rooms.' : ' Please contact your facility administrator to set up rooms.'}
        </p>
        {isAdmin && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onGoToAdmin}
          >
            Go to Facilities Console
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="portal-card">
      {/* Controls Bar */}
      <div className="finder-controls">
        <div className="control-box">
          <label htmlFor="slot-floor">
            <Building size={14} /> Office Floor
          </label>
          <select
            id="slot-floor"
            value={selectedFloor}
            onChange={(e) => onFloorChange(e.target.value)}
          >
            {FLOORS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="control-box">
          <label htmlFor="slot-room">
            <MapPin size={14} /> Physical Room
          </label>
          <select
            id="slot-room"
            value={currentRoom.id}
            onChange={(e) => onRoomSelect(e.target.value)}
          >
            {filteredRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code} • {r.capacity} seats)
              </option>
            ))}
          </select>
        </div>

        <div className="control-box">
          <label htmlFor="slot-date">
            <Calendar size={14} /> Date
          </label>
          <input
            id="slot-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        <div className="control-box">
          <label htmlFor="slot-time">
            <Clock size={14} /> Desired Slot
          </label>
          <select
            id="slot-time"
            value={selectedSlot}
            onChange={(e) => onSlotChange(e.target.value)}
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Location & Hardware Info */}
      <div className="finder-meta-strip">
        <div className="meta-tag-group">
          <span className="code-pill">{currentRoom.code}</span>
          <strong>{currentRoom.name}</strong>
          <span className="type-pill">{currentRoom.type}</span>
        </div>
        <div className="meta-text">
          <MapPin size={13} /> {currentRoom.building} • {currentRoom.wing}
        </div>
        <div className="meta-text">
          <Users size={13} /> Capacity: {currentRoom.capacity} People
        </div>
        <div className="meta-hardware">
          <Monitor size={13} /> {currentRoom.hardware.map((h) => h.name).join(' • ')}
        </div>
      </div>

      {/* Main Split: Slot Check & Suggestions (Left) + Door Tablet Preview (Right) */}
      <div className="finder-main-split">
        {/* Left: Slot Status & Conflict Suggestions */}
        <div className="finder-result-area">
          {isMaintenance ? (
            /* MAINTENANCE STATE */
            <div className="status-panel status-panel--maintenance">
              <div className="status-panel-header">
                <Wrench size={20} />
                <div>
                  <h3>{currentRoom.name} is Temporarily Offline</h3>
                  <p>Workplace Facilities is currently servicing equipment in this room.</p>
                </div>
              </div>
              {alternativeRooms.length > 0 && (
                <div className="alt-rooms-box">
                  <span className="alt-box-title">
                    <Sparkles size={14} /> Recommended Available Alternative Rooms
                  </span>
                  <div className="alt-cards-list">
                    {alternativeRooms.slice(0, 2).map((alt) => (
                      <div className="alt-row" key={alt.id}>
                        <div>
                          <strong>{alt.name}</strong>
                          <span className="alt-sub">
                            {alt.wing} • {alt.capacity} seats
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => handleBookRoom(alt.id, alt.name, selectedSlot, alt.wing)}
                        >
                          Book Room <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isOccupied ? (
            /* OCCUPIED STATE: SHOW SMART SUGGESTIONS */
            <div className="status-panel status-panel--occupied">
              <div className="status-panel-header">
                <AlertTriangle size={20} />
                <div>
                  <h3>
                    {currentRoom.name} is Booked for {selectedSlot}
                  </h3>
                  <p>
                    Reserved by <strong>{currentOccupant?.team || 'Another Team'}</strong> for "
                    <em>{currentOccupant?.purpose || 'Scheduled Meeting'}</em>".
                  </p>
                </div>
              </div>

              <div className="suggestions-deck">
                {/* Suggestion 1: Next open slot in this room */}
                <div className="suggestion-card">
                  <div className="suggestion-card__tag">
                    <Clock size={13} /> Next Available Opening in This Room
                  </div>
                  <div className="suggestion-time">{currentRoom.nextAvailableSlot}</div>
                  <p className="suggestion-note">
                    Earliest open 1-hour window in {currentRoom.name} without moving floors.
                  </p>
                  <button
                    type="button"
                    className="btn btn--primary btn--full btn--sm"
                    onClick={() =>
                      onBookRoom(
                        currentRoom.id,
                        currentRoom.name,
                        currentRoom.nextAvailableSlot,
                        currentRoom.wing
                      )
                    }
                  >
                    <CalendarCheck2 size={15} /> Book Next Available Slot
                  </button>
                </div>

                {/* Suggestion 2: Alternative rooms available in the company */}
                <div className="suggestion-card suggestion-card--alt">
                  <div className="suggestion-card__tag suggestion-card__tag--purple">
                    <Sparkles size={13} /> Other Rooms Available at {selectedSlot}
                  </div>
                  <div className="alt-cards-list">
                    {alternativeRooms.length > 0 ? (
                      alternativeRooms.slice(0, 2).map((alt) => (
                        <div className="alt-row" key={alt.id}>
                          <div>
                            <strong>{alt.name}</strong>
                            <span className="alt-sub">
                              {alt.wing} • {alt.capacity} seats
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={() => onBookRoom(alt.id, alt.name, selectedSlot, alt.wing)}
                          >
                            Book <ArrowRight size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-alt">No alternative rooms open during this specific window.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* AVAILABLE STATE: DIRECT BOOKING */
            <div className="status-panel status-panel--available">
              <div className="status-panel-header">
                <CheckCircle size={20} />
                <div>
                  <h3>
                    {currentRoom.name} is Free during {selectedSlot}
                  </h3>
                  <p>Zero conflicting reservations on {currentRoom.wing}. Enter details to reserve:</p>
                </div>
              </div>

              <div className="booking-input-row">
                <div className="input-group">
                  <label htmlFor="bp-title">
                    <FileText size={13} /> Meeting Title / Purpose *
                  </label>
                  <input
                    id="bp-title"
                    type="text"
                    value={bookingPurpose}
                    onChange={(e) => onBookingPurposeChange(e.target.value)}
                    placeholder="e.g. Sprint Planning, Client Demo, Design Review"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="bp-dept">
                    <Tag size={13} /> Department / Team *
                  </label>
                  <input
                    id="bp-dept"
                    type="text"
                    value={department}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                    placeholder="e.g. Engineering, Product, Finance"
                    required
                  />
                </div>
              </div>

              <div className="booking-action-bar">
                <div className="perks-list">
                  <span>
                    <Check size={14} /> Zero overlap guaranteed
                  </span>
                  <span>
                    <Check size={14} /> Door tablet sync
                  </span>
                  <span>
                    <Check size={14} /> Max {policies.maxSlotHours}-hour duration rule
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--primary btn--lg"
                  onClick={() =>
                    onBookRoom(
                      currentRoom.id,
                      currentRoom.name,
                      selectedSlot,
                      currentRoom.wing
                    )
                  }
                >
                  <CalendarCheck2 size={17} /> Confirm Room Booking for {selectedSlot}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Digital Door Tablet Display Preview */}
        <DoorTabletPreview
          currentRoom={currentRoom}
          isMaintenance={isMaintenance}
          isOccupied={isOccupied}
          selectedSlot={selectedSlot}
          currentOccupant={currentOccupant}
          bookingPurpose={bookingPurpose}
          department={department}
        />
      </div>
    </div>
  );
}
