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
import DatePicker from '../../common/DatePicker/DatePicker';
import Select from '../../common/Select/Select';
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

const getInitialTimes = () => {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  let h = nextHour.getHours();
  let nextH = (h + 1) % 24;

  const formatH = (hour24) => {
    const period = hour24 >= 12 ? 'PM' : 'AM';
    let h12 = hour24 % 12;
    if (h12 === 0) h12 = 12;
    return { hour: String(h12).padStart(2, '0'), period };
  };

  const startObj = formatH(h);
  const endObj = formatH(nextH);
  return {
    startHour: startObj.hour,
    startMin: '00',
    startPeriod: startObj.period,
    endHour: endObj.hour,
    endMin: '00',
    endPeriod: endObj.period,
  };
};

export default function BookRoomTab({
  rooms = [],
  floors = [],
  departments = [],
  myBookings = [],
  allBookings = [],
  onBookRoom,
  onCancelBooking,
  currentUser,
  onNavigateToMyBookings,
}) {
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedRoomId, setSelectedRoomId] = useState(() => rooms[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Flexible Hour & Minute Dropdown State initialized to upcoming hour
  const [startHour, setStartHour] = useState(() => getInitialTimes().startHour);
  const [startMin, setStartMin] = useState(() => getInitialTimes().startMin);
  const [startPeriod, setStartPeriod] = useState(() => getInitialTimes().startPeriod);

  const [endHour, setEndHour] = useState(() => getInitialTimes().endHour);
  const [endMin, setEndMin] = useState(() => getInitialTimes().endMin);
  const [endPeriod, setEndPeriod] = useState(() => getInitialTimes().endPeriod);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(4);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered rooms by floor
  const availableRoomsForFloor = rooms.filter(
    (r) => (selectedFloor === 'ALL' || r.floor === selectedFloor) && r.status !== 'MAINTENANCE'
  );

  const currentRoom = rooms.find((r) => r.id === Number(selectedRoomId)) || availableRoomsForFloor[0] || rooms[0];

  // Sort bookings latest first
  const sortedMyBookings = [...myBookings].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  );
  const latestThreeBookings = sortedMyBookings.slice(0, 3);

  // Helper to convert 12h (HH, MM, AM/PM) to 24h ISO time string
  const to24Hour = (hStr, mStr, pStr) => {
    let h = Number(hStr);
    if (pStr === 'PM' && h < 12) h += 12;
    if (pStr === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${mStr}:00`;
  };

  const startTimeStr = `${selectedDate}T${to24Hour(startHour, startMin, startPeriod)}`;
  const endTimeStr = `${selectedDate}T${to24Hour(endHour, endMin, endPeriod)}`;

  const isPastTime = new Date(startTimeStr) < new Date();

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
    if (isPastTime) return;
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
              <Select
                id="booking-floor"
                label="Filter Floor"
                icon={<Layers size={16} />}
                value={selectedFloor}
                onChange={(val) => {
                  setSelectedFloor(val);
                  const firstRoom = rooms.find(
                    (r) => (val === 'ALL' || r.floor === val) && r.status !== 'MAINTENANCE'
                  );
                  if (firstRoom) setSelectedRoomId(firstRoom.id);
                }}
                options={[
                  { value: 'ALL', label: 'All Office Floors' },
                  ...floors.map((fl) => ({ value: fl, label: fl })),
                ]}
                placeholder={null}
              />

              <Select
                id="booking-room"
                label="Select Meeting Room *"
                icon={<DoorOpen size={16} />}
                value={currentRoom?.id || ''}
                onChange={(val) => setSelectedRoomId(Number(val))}
                options={availableRoomsForFloor.map((r) => ({
                  value: r.id,
                  label: `${r.name} (${r.floor} • ${r.capacity} seats)`,
                }))}
                placeholder={availableRoomsForFloor.length === 0 ? '-- No rooms on this floor --' : '-- Select Meeting Room --'}
                required
              />
            </div>

            {/* Date Picker */}
            <div className="form-group">
              <label htmlFor="booking-date">Reservation Date *</label>
              <DatePicker
                id="booking-date"
                minDate={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={setSelectedDate}
              />
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
                    const isPastPreset = new Date(pStartStr) < new Date();
                    const pConflict = !isPastPreset && allBookings.some(
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
                        disabled={isPastPreset}
                        className={`preset-chip ${isPresetSelected ? 'preset-chip--selected' : ''} ${pConflict ? 'preset-chip--occupied' : ''} ${isPastPreset ? 'preset-chip--past' : ''}`}
                        onClick={() => !isPastPreset && handleSelectPreset(p)}
                        title={isPastPreset ? 'Past time slot cannot be booked' : pConflict ? 'Room is already occupied' : 'Click to select this slot'}
                      >
                        <span>{p.label}</span>
                        {isPastPreset && <span className="preset-chip__tag">Past</span>}
                        {!isPastPreset && pConflict && <span className="preset-chip__tag">Busy</span>}
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
            ) : isPastTime ? (
              <div className="booking-status-alert booking-status-alert--danger">
                <AlertCircle size={18} />
                <div>
                  <strong>Selected Time is in the Past</strong>
                  <p>You cannot book a room for an elapsed time slot ({formattedTimeRange}). Please choose a current or future time.</p>
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

              <Select
                id="booking-dept"
                label="Department"
                icon={<Building2 size={16} />}
                value={department}
                onChange={(val) => setDepartment(val)}
                options={departments.map((d) => ({
                  value: d.name,
                  label: d.name,
                }))}
                placeholder={departments.length === 0 ? '-- No departments registered --' : '-- Select Department --'}
              />
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
              disabled={isMaintenance || isPastTime || isOccupied || !isValidTimeRange || isSubmitting}
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
              <h3>My Recent Reservations</h3>
              <p>
                {myBookings.length > 3
                  ? `Showing 3 latest of ${myBookings.length} total reservations`
                  : `Meetings booked by your Facility Admin account (${myBookings.length} total)`}
              </p>
            </div>
          </div>

          <div className="my-reservations-list">
            {sortedMyBookings.length === 0 ? (
              <div className="my-reservations-empty">
                <CalendarCheck2 size={36} />
                <h4>No Scheduled Reservations</h4>
                <p>You haven't reserved any meeting spaces yet. Use the booking form on the left to schedule a room.</p>
              </div>
            ) : (
              <>
                {latestThreeBookings.map((b) => {
                  const isCancelled = b.status === 'CANCELLED';
                  const startTimeDisplay = b.startTime?.substring(11, 16) || '10:00';
                  const endTimeDisplay = b.endTime?.substring(11, 16) || '11:00';
                  const dateDisplay = formatDate(b.startTime);

                  const bEnd = new Date(b.endTime);
                  const isCompleted = !isCancelled && bEnd < new Date();
                  const bStart = new Date(b.startTime);
                  const isInProgress = !isCancelled && new Date() >= bStart && new Date() <= bEnd;

                  return (
                    <div key={b.id} className={`my-reservation-item ${isCancelled ? 'my-reservation-item--cancelled' : ''} ${isInProgress ? 'my-reservation-item--in-progress' : ''}`}>
                      <div className="reservation-item-top">
                        <div className="reservation-time-pill">
                          <Clock size={13} />
                          <span>{startTimeDisplay} - {endTimeDisplay}</span>
                        </div>
                        {isCancelled ? (
                          <span className="status-pill status-pill--inactive">
                            Cancelled
                          </span>
                        ) : isInProgress ? (
                          <span className="status-pill status-pill--live">
                            In Progress
                          </span>
                        ) : isCompleted ? (
                          <span className="status-pill status-pill--completed">
                            Completed
                          </span>
                        ) : (
                          <span className="status-pill status-pill--active">
                            Confirmed
                          </span>
                        )}
                      </div>

                      <div className="reservation-info">
                        <h4 title={b.title}>{b.title}</h4>
                        <div className="reservation-meta">
                          <span><DoorOpen size={13} /> {b.roomName}</span>
                          <span><Layers size={13} /> {b.floor}</span>
                          <span><Calendar size={13} /> {dateDisplay}</span>
                        </div>
                      </div>

                      {!isCancelled && !isCompleted && onCancelBooking && (
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

                {/* Navigation to dedicated full paginated My Bookings Tab */}
                {onNavigateToMyBookings && (
                  <div className="my-reservations-card__all-footer" style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed #e2e8f0' }}>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm btn--full"
                      onClick={onNavigateToMyBookings}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      title="Open full dedicated My Bookings page"
                    >
                      <CalendarCheck2 size={14} />
                      <span>View All My Bookings ({myBookings.length}) &rarr;</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
