import React, { useState, useMemo, useEffect } from 'react';
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
  DoorOpen,
  Check,
  CalendarCheck2,
  Wrench,
  FileText,
  Tag,
  Search,
  Filter,
} from 'lucide-react';
import RoomInfoCard from './RoomInfoCard';
import SearchInput from '../../common/SearchInput/SearchInput';
import DatePicker from '../../common/DatePicker/DatePicker';

const HOURS = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07'];
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

const DURATION_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
  { label: 'Full Day (8h)', minutes: 480 },
];

const getInitialUpcomingTime = () => {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();

  // Round up to nearest 15-minute slot
  if (m > 45) {
    h = (h + 1) % 24;
    m = 0;
  } else if (m > 30) {
    m = 45;
  } else if (m > 15) {
    m = 30;
  } else {
    m = 15;
  }

  const period = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  return {
    hour: String(h12).padStart(2, '0'),
    min: String(m).padStart(2, '0'),
    period,
  };
};

export default function SlotFinderTab({
  rooms = [],
  floors = [],
  dayOccupancy = [],
  selectedFloor = 'All Floors',
  onFloorChange,
  selectedRoomId,
  onRoomSelect,
  selectedDate,
  onDateChange,
  bookingPurpose,
  onBookingPurposeChange,
  department,
  onDepartmentChange,
  policies = { maxSlotHours: 2 },
  onBookRoom,
  isAdmin = false,
  onGoToAdmin,
  onGoToMyBookings,
  currentUser,
  isLoading = false,
  editingBooking = null,
  onCancelEdit,
}) {
  // Time and duration selection
  const [startHour, setStartHour] = useState(() => getInitialUpcomingTime().hour);
  const [startMin, setStartMin] = useState(() => getInitialUpcomingTime().min);
  const [startPeriod, setStartPeriod] = useState(() => getInitialUpcomingTime().period);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [attendeesCount, setAttendeesCount] = useState(4);
  const [description, setDescription] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [roomSearch, setRoomSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize time and duration when editing an existing reservation
  useEffect(() => {
    if (editingBooking && editingBooking.startTime && editingBooking.endTime) {
      try {
        const s = new Date(editingBooking.startTime);
        const e = new Date(editingBooking.endTime);
        let h = s.getHours();
        const p = h >= 12 ? 'PM' : 'AM';
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        setStartHour(String(h12).padStart(2, '0'));
        setStartMin(String(s.getMinutes()).padStart(2, '0'));
        setStartPeriod(p);

        const diffMins = Math.round((e.getTime() - s.getTime()) / (60 * 1000));
        if (diffMins > 0) setDurationMinutes(diffMins);
        if (editingBooking.attendeesCount) setAttendeesCount(editingBooking.attendeesCount);
        if (editingBooking.description) setDescription(editingBooking.description);
      } catch (_) {}
    }
  }, [editingBooking]);

  // Time String Calculations
  const to24Hour = (hStr, mStr, pStr) => {
    let h = Number(hStr);
    if (pStr === 'PM' && h < 12) h += 12;
    if (pStr === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${mStr}:00`;
  };

  const startTimeStr = `${selectedDate}T${to24Hour(startHour, startMin, startPeriod)}`;

  // Calculate End Time Date object and ISO string
  const { endTimeStr, formattedEndTime, formattedTimeRange } = useMemo(() => {
    let h = Number(startHour);
    if (startPeriod === 'PM' && h < 12) h += 12;
    if (startPeriod === 'AM' && h === 12) h = 0;

    const [year, month, day] = selectedDate.split('-').map(Number);
    const startObj = new Date(year, month - 1, day, h, Number(startMin), 0);
    const endObj = new Date(startObj.getTime() + durationMinutes * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const endISO = `${endObj.getFullYear()}-${pad(endObj.getMonth() + 1)}-${pad(endObj.getDate())}T${pad(
      endObj.getHours()
    )}:${pad(endObj.getMinutes())}:00`;

    let endH = endObj.getHours();
    const endP = endH >= 12 ? 'PM' : 'AM';
    let endH12 = endH % 12;
    if (endH12 === 0) endH12 = 12;
    const endFormatted = `${String(endH12).padStart(2, '0')}:${pad(endObj.getMinutes())} ${endP}`;
    const range = `${startHour}:${startMin} ${startPeriod} - ${endFormatted}`;

    return {
      endTimeStr: endISO,
      formattedEndTime: endFormatted,
      formattedTimeRange: range,
    };
  }, [selectedDate, startHour, startMin, startPeriod, durationMinutes]);

  // Check if slot start time is in the past
  const isPastTime = useMemo(() => {
    try {
      const now = new Date();
      const slotStart = new Date(startTimeStr);
      return slotStart < now;
    } catch (_) {
      return false;
    }
  }, [startTimeStr]);

  // Floor options from DB (filtered for the user's company) and room metadata
  const floorOptions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(floors)) {
      floors.forEach((f) => {
        if (typeof f === 'string' && f.trim()) {
          set.add(f.trim());
        } else if (f && typeof f === 'object' && f.name && typeof f.name === 'string') {
          set.add(f.name.trim());
        }
      });
    }
    if (Array.isArray(rooms)) {
      rooms.forEach((r) => {
        if (r.floor && typeof r.floor === 'string' && r.floor.trim()) {
          set.add(r.floor.trim());
        }
      });
    }
    return ['All Floors', ...Array.from(set).sort()];
  }, [floors, rooms]);

  // Filtered rooms for the selector and list
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesFloor = selectedFloor === 'All Floors' || r.floor === selectedFloor;
      const matchesSize = sizeFilter === 'all' || r.sizeCategory === sizeFilter;
      const matchesSearch =
        !roomSearch ||
        r.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
        (r.code && r.code.toLowerCase().includes(roomSearch.toLowerCase()));
      return matchesFloor && matchesSize && matchesSearch;
    });
  }, [rooms, selectedFloor, sizeFilter, roomSearch]);

  // Group filtered rooms by Floor
  const roomsByFloor = useMemo(() => {
    const map = new Map();
    filteredRooms.forEach((room) => {
      const floorKey = room.floor || 'Main Floor';
      if (!map.has(floorKey)) {
        map.set(floorKey, []);
      }
      map.get(floorKey).push(room);
    });
    // Sort floor keys
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredRooms]);

  // Current active room
  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === Number(selectedRoomId)) || filteredRooms[0] || rooms[0] || null;
  }, [rooms, selectedRoomId, filteredRooms]);

  // Check if current room is occupied at the chosen time window
  const conflictingBooking = useMemo(() => {
    if (!currentRoom) return null;
    return dayOccupancy.find(
      (b) =>
        b.roomId === currentRoom.id &&
        b.status === 'CONFIRMED' &&
        b.startTime < endTimeStr &&
        b.endTime > startTimeStr
    );
  }, [currentRoom, dayOccupancy, startTimeStr, endTimeStr]);

  const isOccupied = Boolean(conflictingBooking);
  const isMaintenance = currentRoom?.status === 'MAINTENANCE' || currentRoom?.isUnderMaintenance;

  // Occupant details for the door display & suggestion cards
  const currentOccupant = useMemo(() => {
    if (!conflictingBooking) return null;
    return {
      team: conflictingBooking.departmentName || 'Reserved Team',
      purpose: conflictingBooking.title || 'Scheduled Strategy Meeting',
      booker: conflictingBooking.bookerName || 'Colleague',
      endTime: conflictingBooking.endTime,
    };
  }, [conflictingBooking]);

  // Calculate next available opening in this room
  const nextAvailableSlotText = useMemo(() => {
    if (!conflictingBooking) return formattedTimeRange;
    try {
      const conflictEnd = new Date(conflictingBooking.endTime);
      let h = conflictEnd.getHours();
      const p = h >= 12 ? 'PM' : 'AM';
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      const pad = (n) => String(n).padStart(2, '0');
      const nextStartFormatted = `${String(h12).padStart(2, '0')}:${pad(conflictEnd.getMinutes())} ${p}`;

      const nextEnd = new Date(conflictEnd.getTime() + durationMinutes * 60 * 1000);
      let nextEndH = nextEnd.getHours();
      const nextEndP = nextEndH >= 12 ? 'PM' : 'AM';
      let nextEndH12 = nextEndH % 12;
      if (nextEndH12 === 0) nextEndH12 = 12;
      const nextEndFormatted = `${String(nextEndH12).padStart(2, '0')}:${pad(nextEnd.getMinutes())} ${nextEndP}`;

      return `${nextStartFormatted} - ${nextEndFormatted}`;
    } catch (_) {
      return 'Later Today';
    }
  }, [conflictingBooking, formattedTimeRange, durationMinutes]);

  // Alternative rooms free during this exact time window
  const alternativeRooms = useMemo(() => {
    if (!currentRoom) return [];
    return rooms.filter(
      (r) =>
        r.id !== currentRoom.id &&
        !r.isUnderMaintenance &&
        r.status !== 'MAINTENANCE' &&
        !dayOccupancy.some(
          (b) =>
            b.roomId === r.id &&
            b.status === 'CONFIRMED' &&
            b.startTime < endTimeStr &&
            b.endTime > startTimeStr
        )
    );
  }, [rooms, currentRoom, dayOccupancy, startTimeStr, endTimeStr]);

  // Helper to jump date
  const setQuickDate = (type) => {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    const iso = d.toISOString().split('T')[0];
    onDateChange(iso);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!currentRoom) return;
    if (isMaintenance || isOccupied || isPastTime) return;

    setIsSubmitting(true);
    const result = await onBookRoom({
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      floor: currentRoom.floor || currentRoom.wing || 'Main Floor',
      title: bookingPurpose || `${currentRoom.name} Meeting`,
      description,
      startTime: startTimeStr,
      endTime: endTimeStr,
      slotTimeText: formattedTimeRange,
      department: department || currentUser?.department || 'General',
      attendeesCount: Number(attendeesCount) || 2,
    });
    setIsSubmitting(false);

    if (result && result.success) {
      onBookingPurposeChange('');
      setDescription('');
    }
  };

  if (isLoading) {
    return (
      <div className="portal-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading conference rooms and availability...</p>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="portal-card slot-finder-empty-state">
        <Building size={48} className="slot-finder-empty-state__icon" />
        <h3 className="slot-finder-empty-state__title">No Physical Meeting Rooms Registered</h3>
        <p className="slot-finder-empty-state__desc">
          No meeting rooms were found for your organization in the database. Please contact your facility administrator to register conference rooms.
        </p>
        {isAdmin && (
          <button type="button" className="btn btn--primary btn--sm" onClick={onGoToAdmin}>
            Configure Rooms in Admin Console
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="portal-card">
      {/* ───────────────── EDITING / RESCHEDULE BANNER ───────────────── */}
      {editingBooking && (
        <div className="editing-booking-banner">
          <div className="editing-booking-banner__content">
            <span className="editing-booking-banner__badge">Rescheduling</span>
            <div className="editing-booking-banner__text">
              <strong>Updating Reservation #{editingBooking.id}: "{editingBooking.title || editingBooking.purpose || 'Meeting'}"</strong>
              <p>Pick a new time slot, date, or room. Confirming will save your changes and release the previous slot.</p>
            </div>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onCancelEdit}
              style={{ flexShrink: 0 }}
            >
              Cancel Editing
            </button>
          )}
        </div>
      )}

      {/* ───────────────── CONTROLS BAR ───────────────── */}
      <div className="finder-controls">
        {/* Floor Selection */}
        <div className="control-box">
          <div className="control-box-header">
            <label htmlFor="slot-floor">
              <Building size={14} /> Floor / Wing
            </label>
          </div>
          <select
            id="slot-floor"
            value={selectedFloor}
            onChange={(e) => {
              onFloorChange(e.target.value);
              const firstInFloor = rooms.find(
                (r) => e.target.value === 'All Floors' || r.floor === e.target.value
              );
              if (firstInFloor) onRoomSelect(firstInFloor.id);
            }}
          >
            {floorOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="control-box">
          <div className="control-box-header">
            <label htmlFor="slot-date">
              <Calendar size={14} /> Date
            </label>
            <div className="quick-date-pills">
              <button
                type="button"
                className={`quick-date-btn ${
                  selectedDate === new Date().toISOString().split('T')[0] ? 'quick-date-btn--active' : ''
                }`}
                onClick={() => setQuickDate('today')}
              >
                Today
              </button>
              <button
                type="button"
                className="quick-date-btn"
                onClick={() => setQuickDate('tomorrow')}
              >
                Tmrw
              </button>
            </div>
          </div>
          <DatePicker
            id="slot-date"
            minDate={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={onDateChange}
          />
        </div>

        {/* Start Time Dial */}
        <div className="control-box">
          <div className="control-box-header">
            <label>
              <Clock size={14} /> Start Time
            </label>
          </div>
          <div className="time-dial-container">
            <select
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              aria-label="Start Hour"
              className="time-dial-select"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="time-dial-separator">:</span>
            <select
              value={startMin}
              onChange={(e) => setStartMin(e.target.value)}
              aria-label="Start Minute"
              className="time-dial-select"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className="time-dial-separator" style={{ margin: '0 2px' }} />
            <select
              value={startPeriod}
              onChange={(e) => setStartPeriod(e.target.value)}
              aria-label="Start Period"
              className="time-dial-select"
              style={{ fontWeight: 800 }}
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="control-box">
          <div className="control-box-header">
            <label htmlFor="slot-duration">
              <Clock size={14} /> Duration
            </label>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)' }}>
              {durationMinutes >= 60
                ? `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 ? ` ${durationMinutes % 60}m` : ''}`
                : `${durationMinutes}m`}
            </span>
          </div>
          <select
            id="slot-duration"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            style={{ width: '100%', height: '42px', fontWeight: 600 }}
          >
            <optgroup label="Short Meetings">
              <option value={15}>15 Minutes (Quick Sync)</option>
              <option value={30}>30 Minutes (Standup)</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>1 Hour (Standard)</option>
            </optgroup>
            <optgroup label="Extended Sessions">
              <option value={75}>1 Hour 15 Minutes</option>
              <option value={90}>1.5 Hours</option>
              <option value={120}>2 Hours (Workshop / Review)</option>
              <option value={150}>2.5 Hours</option>
              <option value={180}>3 Hours</option>
              <option value={240}>4 Hours (Half Day)</option>
            </optgroup>
            <optgroup label="Full Day / Extended">
              <option value={300}>5 Hours</option>
              <option value={360}>6 Hours</option>
              <option value={420}>7 Hours</option>
              <option value={480}>8 Hours (Full Working Day)</option>
              <option value={540}>9 Hours (Entire Day)</option>
              <option value={600}>10 Hours</option>
              <option value={720}>12 Hours (All Day Event)</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* ───────────────── ROOM SELECTION STRIP ───────────────── */}
      <div className="finder-meta-strip" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div className="meta-tag-group">
            <span className="code-pill">{currentRoom?.code}</span>
            <strong style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>{currentRoom?.name}</strong>
            <span className="type-pill">{currentRoom?.type}</span>
          </div>
          <div className="meta-text">
            <MapPin size={13} /> {currentRoom?.wing}
          </div>
          <div className="meta-text">
            <Users size={13} /> Max: {currentRoom?.capacity} People
          </div>
        </div>

        {/* Live Slot Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Selected Slot: <strong>{formattedTimeRange}</strong>
          </span>
          <span
            className={`status-pill ${
              isMaintenance
                ? 'status-pill--maintenance'
                : isPastTime
                ? 'status-pill--inactive'
                : isOccupied
                ? 'status-pill--inactive'
                : 'status-pill--active'
            }`}
            style={{ fontWeight: 700 }}
          >
            {isMaintenance
              ? 'Maintenance'
              : isPastTime
              ? 'Time Passed'
              : isOccupied
              ? 'Booked'
              : 'Available'}
          </span>
        </div>
      </div>

      {/* ───────────────── ROOM SELECTOR CAROUSEL / PILLS (GROUPED BY FLOOR) ───────────────── */}
      <div className="room-switcher-bar">
        <div className="room-switcher-label">
          <DoorOpen size={15} />
          <span>Switch Room:</span>
        </div>
        <div className="room-switcher-scroll">
          {roomsByFloor.map(([floorName, floorRooms]) => (
            <div key={floorName} className="room-floor-group">
              <div className="room-floor-group-badge">
                <Building size={12} />
                <span>{floorName}</span>
              </div>
              <div className="room-floor-group-items">
                {floorRooms.map((room) => {
                  const isRoomActive = room.id === currentRoom?.id;
                  const isRoomConflict = dayOccupancy.some(
                    (b) =>
                      b.roomId === room.id &&
                      b.status === 'CONFIRMED' &&
                      b.startTime < endTimeStr &&
                      b.endTime > startTimeStr
                  );
                  const isRoomMaint = room.status === 'MAINTENANCE' || room.isUnderMaintenance;

                  return (
                    <button
                      key={room.id}
                      type="button"
                      className={`room-switcher-pill ${isRoomActive ? 'room-switcher-pill--active' : ''}`}
                      onClick={() => onRoomSelect(room.id)}
                      title={`${room.name} — ${room.floor || floorName} • ${room.capacity} seats`}
                    >
                      <span
                        className="room-switcher-dot"
                        style={{
                          backgroundColor: isRoomActive
                            ? '#ffffff'
                            : isRoomMaint
                            ? '#f59e0b'
                            : isRoomConflict
                            ? '#ef4444'
                            : '#10b981',
                          boxShadow: isRoomActive ? '0 0 6px rgba(255, 255, 255, 0.85)' : 'none',
                        }}
                      />
                      <span className="room-switcher-name">{room.name}</span>
                      <span className="room-switcher-capacity">({room.capacity} seats)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────── MAIN SPLIT: RESULT & DOOR TABLET ───────────────── */}
      <div className="finder-main-split">
        {/* Left Column: Slot Status, Alternatives, or Direct Booking Form */}
        <div className="finder-result-area">
          {isMaintenance ? (
            /* ═══════ MAINTENANCE STATE ═══════ */
            <div className="status-panel status-panel--maintenance">
              <div className="status-panel-header">
                <Wrench size={24} />
                <div>
                  <h3>{currentRoom?.name || 'Meeting Room'} is Temporarily Offline</h3>
                  <p>Facilities is currently servicing this room's hardware or HVAC system.</p>
                </div>
              </div>
              {alternativeRooms.length > 0 && (
                <div className="alt-rooms-box">
                  <span className="alt-box-title">
                    <Sparkles size={14} /> Available Alternative Rooms for {formattedTimeRange}
                  </span>
                  <div className="alt-cards-list">
                    {alternativeRooms.slice(0, 3).map((alt) => (
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
                          onClick={() => onRoomSelect(alt.id)}
                        >
                          Select Room <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isPastTime ? (
            /* ═══════ PAST TIME STATE ═══════ */
            <div className="status-panel status-panel--occupied" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="status-panel-header">
                <AlertTriangle size={24} style={{ color: '#d97706' }} />
                <div>
                  <h3>Time Slot Has Already Passed</h3>
                  <p>
                    The time window <strong>{formattedTimeRange}</strong> on <strong>{selectedDate}</strong> is in the past.
                    Please choose a future start time or select tomorrow.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => {
                    const upcoming = getInitialUpcomingTime();
                    setStartHour(upcoming.hour);
                    setStartMin(upcoming.min);
                    setStartPeriod(upcoming.period);
                  }}
                >
                  <Clock size={14} /> Jump to Next Upcoming Slot
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setQuickDate('tomorrow')}
                >
                  <Calendar size={14} /> Book for Tomorrow
                </button>
              </div>
            </div>
          ) : isOccupied ? (
            /* ═══════ OCCUPIED STATE: SHOW SMART SUGGESTIONS ═══════ */
            <div className="status-panel status-panel--occupied">
              <div className="status-panel-header">
                <AlertTriangle size={24} />
                <div>
                  <h3>
                    {currentRoom?.name || 'Meeting Room'} is Booked for {formattedTimeRange}
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
                    <Clock size={13} /> Next Opening in {currentRoom?.name || 'this room'}
                  </div>
                  <div className="suggestion-time">{nextAvailableSlotText}</div>
                  <p className="suggestion-note">
                    Earliest {durationMinutes}-minute window without changing meeting rooms.
                  </p>
                  {conflictingBooking?.endTime && (
                    <button
                      type="button"
                      className="btn btn--primary btn--full btn--sm"
                      onClick={() => {
                        try {
                          const conflictEnd = new Date(conflictingBooking.endTime);
                          let h = conflictEnd.getHours();
                          const p = h >= 12 ? 'PM' : 'AM';
                          let h12 = h % 12;
                          if (h12 === 0) h12 = 12;
                          setStartHour(String(h12).padStart(2, '0'));
                          setStartMin(String(conflictEnd.getMinutes()).padStart(2, '0'));
                          setStartPeriod(p);
                        } catch (_) {}
                      }}
                    >
                      <CalendarCheck2 size={15} /> Select Next Available Slot
                    </button>
                  )}
                </div>

                {/* Suggestion 2: Alternative rooms open during this slot */}
                <div className="suggestion-card suggestion-card--alt">
                  <div className="suggestion-card__tag suggestion-card__tag--purple">
                    <Sparkles size={13} /> Other Rooms Free at {formattedTimeRange}
                  </div>
                  <div className="alt-cards-list">
                    {alternativeRooms.length > 0 ? (
                      alternativeRooms.slice(0, 3).map((alt) => (
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
                            onClick={() => onRoomSelect(alt.id)}
                          >
                            Switch <ArrowRight size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-alt" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        All physical rooms are currently booked during this specific window.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════ AVAILABLE STATE: DIRECT RESERVATION FORM ═══════ */
            <div className="status-panel status-panel--available">
              <div className="status-panel-header">
                <CheckCircle size={24} />
                <div>
                  <h3>
                    {currentRoom?.name || 'Meeting Room'} is Free during {formattedTimeRange}
                  </h3>
                  <p>
                    Zero conflicting reservations on {currentRoom?.wing || currentRoom?.floor || 'this floor'}. Complete reservation details:
                  </p>
                </div>
              </div>

              <form onSubmit={handleBookSubmit} className="booking-input-row" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label htmlFor="bp-title">
                      <FileText size={13} /> Meeting Title / Purpose *
                    </label>
                    <input
                      id="bp-title"
                      type="text"
                      value={bookingPurpose}
                      onChange={(e) => onBookingPurposeChange(e.target.value)}
                      placeholder="e.g. Sprint Planning, Client Demo, Strategy Review"
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
                      placeholder="e.g. Engineering, Product, Marketing"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                  <div className="input-group">
                    <label htmlFor="bp-attendees">
                      <Users size={13} /> Attendees (Max: {currentRoom?.capacity || 20})
                    </label>
                    <input
                      id="bp-attendees"
                      type="number"
                      min={1}
                      max={currentRoom?.capacity || 20}
                      value={attendeesCount}
                      onChange={(e) => setAttendeesCount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="bp-desc">
                      <FileText size={13} /> Agenda / Meeting Notes (Optional)
                    </label>
                    <input
                      id="bp-desc"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief notes, video call links, or presentation goals"
                    />
                  </div>
                </div>

                <div className="booking-action-bar" style={{ marginTop: '10px' }}>
                  <div className="perks-list">
                    <span>
                      <Check size={14} /> Zero overlap guaranteed
                    </span>
                    <span>
                      <Check size={14} /> Digital door tablet sync
                    </span>
                    <span>
                      <Check size={14} /> {policies.maxSlotHours >= 8 ? 'Full-day booking allowed' : `Max ${policies.maxSlotHours}-hour policy`}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="btn btn--primary btn--lg"
                    disabled={isSubmitting}
                    style={{ minWidth: '240px' }}
                  >
                    <CalendarCheck2 size={18} />
                    {isSubmitting
                      ? 'Saving Reservation...'
                      : editingBooking
                      ? `Update Reservation for ${formattedTimeRange}`
                      : `Confirm Room Booking for ${formattedTimeRange}`}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Room Specifications & Amenities Card */}
        <RoomInfoCard
          currentRoom={currentRoom}
          isMaintenance={isMaintenance}
          isOccupied={isOccupied}
          selectedSlot={formattedTimeRange}
          currentOccupant={currentOccupant}
          nextAvailableSlot={nextAvailableSlotText}
        />
      </div>
    </div>
  );
}
