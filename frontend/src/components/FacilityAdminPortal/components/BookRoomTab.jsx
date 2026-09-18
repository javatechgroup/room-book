import React, { useState } from 'react';
import {
  CalendarPlus,
  DoorOpen,
  Layers,
  Calendar,
  Clock,
  Building2,
  Users,
  AlignLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  CalendarCheck2,
  Ban,
  Search,
  Type,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import { formatDate } from '../../../utils/dateUtils';

const HOURS = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07'];
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

const PRESET_SLOTS = [
  { label: '09:00 - 10:00 AM', sH: '09', sM: '00', sP: 'AM', eH: '10', eM: '00', eP: 'AM' },
  { label: '10:00 - 11:00 AM', sH: '10', sM: '00', sP: 'AM', eH: '11', eM: '00', eP: 'AM' },
  { label: '11:00 AM - 12:00 PM', sH: '11', sM: '00', sP: 'AM', eH: '12', eM: '00', eP: 'PM' },
  { label: '02:00 - 03:00 PM', sH: '02', sM: '00', sP: 'PM', eH: '03', eM: '00', eP: 'PM' },
  { label: '03:00 - 04:00 PM', sH: '03', sM: '00', sP: 'PM', eH: '04', eM: '00', eP: 'PM' },
  { label: '04:00 - 05:00 PM', sH: '04', sM: '00', sP: 'PM', eH: '05', eM: '00', eP: 'PM' },
];

export default function BookRoomTab({
  rooms = [],
  floors = [],
  departments = [],
  myBookings = [],
  allBookings = [],
  onBookRoom,
  onCancelBooking,
  currentUser,
}) {
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [resPage, setResPage] = useState(1);
  const [resPageSize, setResPageSize] = useState(4);
  const [selectedRoomId, setSelectedRoomId] = useState(() => rooms[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Flexible Hour & Minute Dropdown State
  const [startHour, setStartHour] = useState('10');
  const [startMin, setStartMin] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');

  const [endHour, setEndHour] = useState('11');
  const [endMin, setEndMin] = useState('00');
  const [endPeriod, setEndPeriod] = useState('AM');

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Admin');
  const [attendeesCount, setAttendeesCount] = useState(4);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered rooms by floor
  const availableRoomsForFloor = rooms.filter(
    (r) => (selectedFloor === 'ALL' || r.floor === selectedFloor) && r.status !== 'MAINTENANCE'
  );

  const currentRoom = rooms.find((r) => r.id === Number(selectedRoomId)) || availableRoomsForFloor[0] || rooms[0];

  // Helper to convert 12h (HH, MM, AM/PM) to 24h ISO time string
  const to24Hour = (hStr, mStr, pStr) => {
    let h = Number(hStr);
    if (pStr === 'PM' && h < 12) h += 12;
    if (pStr === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${mStr}:00`;
  };

  const startTimeStr = `${selectedDate}T${to24Hour(startHour, startMin, startPeriod)}`;
  const endTimeStr = `${selectedDate}T${to24Hour(endHour, endMin, endPeriod)}`;

  // Calculate meeting duration in minutes
  const getDurationInMinutes = (sH, sM, sP, eH, eM, eP) => {
    let startH = Number(sH);
    if (sP === 'PM' && startH < 12) startH += 12;
    if (sP === 'AM' && startH === 12) startH = 0;
    const startTotal = startH * 60 + Number(sM);

    let endH = Number(eH);
    if (eP === 'PM' && endH < 12) endH += 12;
    if (eP === 'AM' && endH === 12) endH = 0;
    const endTotal = endH * 60 + Number(eM);

    return endTotal - startTotal;
  };

  const durationMinutes = getDurationInMinutes(startHour, startMin, startPeriod, endHour, endMin, endPeriod);
  const isValidTimeRange = durationMinutes > 0;

  const formatDurationText = (diffMinutes) => {
    if (diffMinutes <= 0) return null;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${mins} mins`;
  };

  const formattedTimeRange = `${startHour}:${startMin} ${startPeriod} - ${endHour}:${endMin} ${endPeriod}`;

  // Quick preset selector
  const handleSelectPreset = (p) => {
    setStartHour(p.sH);
    setStartMin(p.sM);
    setStartPeriod(p.sP);
    setEndHour(p.eH);
    setEndMin(p.eM);
    setEndPeriod(p.eP);
  };

  // Check if current room is occupied at selected time
  const conflictingBooking = allBookings.find(
    (b) =>
      b.roomId === currentRoom?.id &&
      b.status === 'CONFIRMED' &&
      b.startTime < endTimeStr &&
      b.endTime > startTimeStr
  );

  const isOccupied = Boolean(conflictingBooking);
  const isMaintenance = currentRoom?.status === 'MAINTENANCE';

  // Alternative rooms available during this exact slot
  const alternativeRooms = rooms.filter(
    (r) =>
      r.id !== currentRoom?.id &&
      r.status !== 'MAINTENANCE' &&
      !allBookings.some(
        (b) =>
          b.roomId === r.id &&
          b.status === 'CONFIRMED' &&
          b.startTime < endTimeStr &&
          b.endTime > startTimeStr
      )
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentRoom) return;
    if (isMaintenance) return;
    if (isOccupied) return;
    if (!isValidTimeRange) return;

    setIsSubmitting(true);
    await onBookRoom({
      roomId: currentRoom.id,
      title: title || `${currentRoom.name} Strategy Sync`,
      description,
      startTime: startTimeStr,
      endTime: endTimeStr,
      department,
      attendeesCount,
    });
    setIsSubmitting(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="superadmin-tab-content">
      <div className="book-room-grid">
        {/* Left Column: Interactive Booking Form */}
        <div className="booking-form-card">
          <div className="booking-form-card__header">
            <div className="booking-form-card__icon">
              <CalendarPlus size={22} />
            </div>
            <div>
              <h3>Reserve Physical Meeting Space</h3>
              <p>Select floor, room, and customizable time range for your session</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {/* Floor & Room Selectors */}
            <div className="form-row form-row--2col">
              <div className="form-group">
                <label htmlFor="booking-floor">Filter Floor</label>
                <div className="input-wrap">
                  <Layers size={16} className="input-icon" />
                  <select
                    id="booking-floor"
                    value={selectedFloor}
                    onChange={(e) => {
                      setSelectedFloor(e.target.value);
                      const firstRoom = rooms.find(
                        (r) => (e.target.value === 'ALL' || r.floor === e.target.value) && r.status !== 'MAINTENANCE'
                      );
                      if (firstRoom) setSelectedRoomId(firstRoom.id);
                    }}
                  >
                    <option value="ALL">All Office Floors</option>
                    {floors.map((fl) => (
                      <option key={fl} value={fl}>{fl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="booking-room">Select Meeting Room *</label>
                <div className="input-wrap">
                  <DoorOpen size={16} className="input-icon" />
                  <select
                    id="booking-room"
                    value={currentRoom?.id || ''}
                    onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                    required
                  >
                    {availableRoomsForFloor.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.floor} • {r.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="form-group">
              <label htmlFor="booking-date">Reservation Date *</label>
              <div className="input-wrap">
                <Calendar size={16} className="input-icon" />
                <input
                  id="booking-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      if (typeof e.target.showPicker === 'function') {
                        e.target.showPicker();
                      }
                    } catch (_) {}
                  }}
                  required
                />
              </div>
            </div>

            {/* Flexible Time Slot: Hour & Min Dropdowns */}
            <div className="form-group time-slot-picker-section">
              <div className="time-slot-header">
                <label>Meeting Time (Hour & Minute) *</label>
                {isValidTimeRange ? (
                  <span className="time-duration-pill">
                    <Clock size={12} /> {formatDurationText(durationMinutes)}
                  </span>
                ) : (
                  <span className="time-duration-pill time-duration-pill--error">
                    <AlertCircle size={12} /> End time must be after start time
                  </span>
                )}
              </div>

              <div className="time-picker-row form-row form-row--2col">
                {/* Start Time Dropdown Group */}
                <div className="time-picker-col">
                  <span className="time-picker-sublabel">Start Time</span>
                  <div className="time-picker-group">
                    <div className="time-select-wrap">
                      <select
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        aria-label="Start Hour"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <span className="time-colon">:</span>
                    <div className="time-select-wrap">
                      <select
                        value={startMin}
                        onChange={(e) => setStartMin(e.target.value)}
                        aria-label="Start Minute"
                      >
                        {MINUTES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="time-select-wrap time-select-wrap--period">
                      <select
                        value={startPeriod}
                        onChange={(e) => setStartPeriod(e.target.value)}
                        aria-label="Start AM/PM"
                      >
                        {PERIODS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* End Time Dropdown Group */}
                <div className="time-picker-col">
                  <span className="time-picker-sublabel">End Time</span>
                  <div className="time-picker-group">
                    <div className="time-select-wrap">
                      <select
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        aria-label="End Hour"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <span className="time-colon">:</span>
                    <div className="time-select-wrap">
                      <select
                        value={endMin}
                        onChange={(e) => setEndMin(e.target.value)}
                        aria-label="End Minute"
                      >
                        {MINUTES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="time-select-wrap time-select-wrap--period">
                      <select
                        value={endPeriod}
                        onChange={(e) => setEndPeriod(e.target.value)}
                        aria-label="End AM/PM"
                      >
                        {PERIODS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Preset Slot Chips */}
              <div className="quick-presets-container">
                <span className="quick-presets-label">Quick Presets:</span>
                <div className="quick-presets-chips">
                  {PRESET_SLOTS.map((p) => {
                    const isPresetSelected =
                      startHour === p.sH &&
                      startMin === p.sM &&
                      startPeriod === p.sP &&
                      endHour === p.eH &&
                      endMin === p.eM &&
                      endPeriod === p.eP;

                    const pStartStr = `${selectedDate}T${to24Hour(p.sH, p.sM, p.sP)}`;
                    const pEndStr = `${selectedDate}T${to24Hour(p.eH, p.eM, p.eP)}`;
                    const pConflict = allBookings.some(
                      (b) =>
                        b.roomId === currentRoom?.id &&
                        b.status === 'CONFIRMED' &&
                        b.startTime < pEndStr &&
                        b.endTime > pStartStr
                    );

                    return (
                      <button
                        key={p.label}
                        type="button"
                        className={`preset-chip ${isPresetSelected ? 'preset-chip--selected' : ''} ${pConflict ? 'preset-chip--occupied' : ''}`}
                        onClick={() => handleSelectPreset(p)}
                      >
                        <span>{p.label}</span>
                        {pConflict && <span className="preset-chip__tag">Busy</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Room Availability Status Banner */}
            {isMaintenance ? (
              <div className="booking-status-alert booking-status-alert--danger">
                <AlertCircle size={18} />
                <div>
                  <strong>Room Under Maintenance</strong>
                  <p>{currentRoom?.name} is currently offline for facility servicing. Please choose another space.</p>
                </div>
              </div>
            ) : !isValidTimeRange ? (
              <div className="booking-status-alert booking-status-alert--warning">
                <AlertCircle size={18} />
                <div>
                  <strong>Invalid Time Selection</strong>
                  <p>The meeting end time must occur after the start time.</p>
                </div>
              </div>
            ) : isOccupied ? (
              <div className="booking-status-alert booking-status-alert--warning">
                <AlertCircle size={18} />
                <div style={{ width: '100%' }}>
                  <strong>Time Slot Currently Occupied</strong>
                  <p>
                    Reserved by <strong>{conflictingBooking.bookerName}</strong> ({conflictingBooking.departmentName || 'Staff'}) for "{conflictingBooking.title}".
                  </p>
                  {alternativeRooms.length > 0 && (
                    <div className="alternative-rooms-callout">
                      <span className="alt-title"><Sparkles size={13} /> Free alternatives at {formattedTimeRange}:</span>
                      <div className="alt-buttons">
                        {alternativeRooms.slice(0, 3).map((alt) => (
                          <button
                            key={alt.id}
                            type="button"
                            className="btn btn--outline btn--xs"
                            onClick={() => setSelectedRoomId(alt.id)}
                          >
                            <DoorOpen size={12} /> {alt.name} ({alt.floor})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="booking-status-alert booking-status-alert--success">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Slot Available ({formattedTimeRange})</strong>
                  <p>{currentRoom?.name} on {currentRoom?.floor} is available for reservation.</p>
                </div>
              </div>
            )}

            {/* Title & Department */}
            <div className="form-row form-row--2col">
              <div className="form-group">
                <label htmlFor="booking-title">Meeting Title / Purpose *</label>
                <div className="input-wrap">
                  <Type size={16} className="input-icon" />
                  <input
                    id="booking-title"
                    type="text"
                    placeholder="e.g., Q3 Review, Team Sync"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="booking-dept">Department</label>
                <div className="input-wrap">
                  <Building2 size={16} className="input-icon" />
                  <select
                    id="booking-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Attendees & Description */}
            <div className="form-row form-row--2col">
              <div className="form-group">
                <label htmlFor="booking-attendees">Expected Attendees</label>
                <div className="input-wrap">
                  <Users size={16} className="input-icon" />
                  <input
                    id="booking-attendees"
                    type="number"
                    min="1"
                    max={currentRoom?.capacity || 20}
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="booking-notes">Special Equipment Notes</label>
                <div className="input-wrap">
                  <AlignLeft size={16} className="input-icon" />
                  <input
                    id="booking-notes"
                    type="text"
                    placeholder="e.g., Projector, Zoom setup"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isMaintenance || isOccupied || isSubmitting}
            >
              <CalendarPlus size={16} />
              <span>{isSubmitting ? 'Confirming Reservation...' : 'Confirm Room Reservation'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: "My Scheduled Reservations" with Self-Cancellation */}
        <div className="my-reservations-card">
          <div className="my-reservations-card__header">
            <div className="my-reservations-card__icon">
              <CalendarCheck2 size={20} />
            </div>
            <div>
              <h3>My Scheduled Reservations</h3>
              <p>Meetings booked by your Facility Admin account ({myBookings.length} total)</p>
            </div>
          </div>

          <div className="my-reservations-list">
            {myBookings.length === 0 ? (
              <div className="my-reservations-empty">
                <CalendarCheck2 size={36} />
                <h4>No Scheduled Reservations</h4>
                <p>You haven't reserved any meeting spaces yet. Use the booking form on the left to schedule a room.</p>
              </div>
            ) : (
              <>
                {myBookings.slice((resPage - 1) * resPageSize, resPage * resPageSize).map((b) => {
                  const isCancelled = b.status === 'CANCELLED';
                  const startTimeDisplay = b.startTime?.substring(11, 16) || '10:00';
                  const endTimeDisplay = b.endTime?.substring(11, 16) || '11:00';
                  const dateDisplay = formatDate(b.startTime);

                  return (
                    <div key={b.id} className={`my-reservation-item ${isCancelled ? 'my-reservation-item--cancelled' : ''}`}>
                      <div className="reservation-item-top">
                        <div className="reservation-time-pill">
                          <Clock size={13} />
                          <span>{startTimeDisplay} - {endTimeDisplay}</span>
                        </div>
                        {isCancelled ? (
                          <span className="status-pill status-pill--inactive">
                            Cancelled
                          </span>
                        ) : (
                          <span className="status-pill status-pill--active">
                            Confirmed
                          </span>
                        )}
                      </div>

                      <div className="reservation-info">
                        <h4>{b.title}</h4>
                        <div className="reservation-meta">
                          <span><DoorOpen size={13} /> {b.roomName}</span>
                          <span><Layers size={13} /> {b.floor}</span>
                          <span><Calendar size={13} /> {dateDisplay}</span>
                        </div>
                      </div>

                      {!isCancelled && onCancelBooking && (
                        <div className="reservation-item-footer">
                          <button
                            type="button"
                            className="btn btn--danger btn--xs"
                            onClick={() => onCancelBooking(b)}
                            title="Cancel this reservation and release the room"
                          >
                            <XCircle size={13} /> Cancel Reservation
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {myBookings.length > resPageSize && (
                  <Pagination
                    currentPage={resPage}
                    pageSize={resPageSize}
                    totalItems={myBookings.length}
                    itemName="bookings"
                    onPageChange={setResPage}
                    showPageSizeSelector={false}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
