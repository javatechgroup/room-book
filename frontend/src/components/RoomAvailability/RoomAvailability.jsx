import React, { useState } from 'react';
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
  BookmarkCheck,
  XCircle,
  Settings,
  Tablet,
  Wrench,
  Shield,
  FileText,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './RoomAvailability.css';

const INITIAL_ROOMS = [
  {
    id: 'room-1',
    name: 'Boardroom Alpha',
    code: 'RM-401',
    building: 'Building A',
    floor: 'Floor 4',
    wing: 'East Wing • Room 401',
    capacity: 18,
    type: 'Executive Boardroom',
    amenities: ['Dual 4K Displays', 'Cisco VC Bar', 'Glass Whiteboard', 'Conference Mic'],
    occupiedSlots: ['10:00 AM - 11:00 AM', '02:00 PM - 03:00 PM'],
    occupiedDetails: {
      '10:00 AM - 11:00 AM': { team: 'Marketing & Growth', purpose: 'Q3 Product Campaign Strategy' },
      '02:00 PM - 03:00 PM': { team: 'Executive Board', purpose: 'Quarterly Financial Review' },
    },
    nextAvailableSlot: '11:30 AM - 12:30 PM',
    isUnderMaintenance: false,
  },
  {
    id: 'room-2',
    name: 'Conference Room 2A',
    code: 'RM-201',
    building: 'Building A',
    floor: 'Floor 2',
    wing: 'Central Hub • Room 201',
    capacity: 10,
    type: 'Team Conference Room',
    amenities: ['Full HD Projector', 'Polycom Mic', 'Magnetic Whiteboard'],
    occupiedSlots: ['09:00 AM - 10:00 AM', '03:30 PM - 04:30 PM'],
    occupiedDetails: {
      '09:00 AM - 10:00 AM': { team: 'DevOps & SRE', purpose: 'Weekly Incident Retrospective' },
      '03:30 PM - 04:30 PM': { team: 'People Ops', purpose: 'Department All-Hands Sync' },
    },
    nextAvailableSlot: '10:00 AM - 11:00 AM',
    isUnderMaintenance: false,
  },
  {
    id: 'room-3',
    name: 'Innovation Lab',
    code: 'RM-302',
    building: 'Building A',
    floor: 'Floor 3',
    wing: 'North Wing • Room 302',
    capacity: 12,
    type: 'Creative Meeting Room',
    amenities: ['75" Smart TV', 'Digital Whiteboard', 'Polycom VC Bar', 'Wi-Fi 6 AP'],
    occupiedSlots: ['11:30 AM - 12:30 PM', '02:00 PM - 03:00 PM'],
    occupiedDetails: {
      '11:30 AM - 12:30 PM': { team: 'UX Research', purpose: 'Customer Journey Mapping' },
      '02:00 PM - 03:00 PM': { team: 'Mobile App Team', purpose: 'Sprint 24 Planning' },
    },
    nextAvailableSlot: '01:00 PM - 02:00 PM',
    isUnderMaintenance: false,
  },
  {
    id: 'room-4',
    name: 'Design Sprint Studio',
    code: 'RM-308',
    building: 'Building A',
    floor: 'Floor 3',
    wing: 'South Wing • Room 308',
    capacity: 8,
    type: 'Workshop Space',
    amenities: ['65" 4K Display', 'Sticky-Note Wall', 'Mobile Whiteboards'],
    occupiedSlots: ['10:00 AM - 11:00 AM'],
    occupiedDetails: {
      '10:00 AM - 11:00 AM': { team: 'Brand Identity Team', purpose: 'Visual Design Workshop' },
    },
    nextAvailableSlot: '11:30 AM - 12:30 PM',
    isUnderMaintenance: false,
  },
  {
    id: 'room-5',
    name: 'Focus Pod Gamma',
    code: 'POD-102',
    building: 'Building A',
    floor: 'Floor 1',
    wing: 'Quiet Zone • Pod 102',
    capacity: 4,
    type: 'Huddle & 1-on-1 Pod',
    amenities: ['27" Monitor', 'Logitech Brio Webcam', 'Acoustic Soundproofing'],
    occupiedSlots: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM'],
    occupiedDetails: {
      '09:00 AM - 10:00 AM': { team: 'Finance', purpose: 'Audit Review Call' },
      '10:00 AM - 11:00 AM': { team: 'Security', purpose: 'Compliance Check-in' },
    },
    nextAvailableSlot: '11:00 AM - 12:00 PM',
    isUnderMaintenance: false,
  },
  {
    id: 'room-6',
    name: 'Executive Suite B',
    code: 'RM-405',
    building: 'Building A',
    floor: 'Floor 4',
    wing: 'West Wing • Room 405',
    capacity: 14,
    type: 'Meeting Room',
    amenities: ['Dual 4K Monitors', 'Jabra Speak 810', 'Tempered Glass Board'],
    occupiedSlots: ['03:30 PM - 04:30 PM'],
    occupiedDetails: {
      '03:30 PM - 04:30 PM': { team: 'Legal Counsel', purpose: 'Contract Review' },
    },
    nextAvailableSlot: '04:30 PM - 05:30 PM',
    isUnderMaintenance: false,
  },
];

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:30 AM - 12:30 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM',
  '05:00 PM - 06:00 PM',
];

const FLOORS = ['All Floors', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];

function RoomAvailability() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedRoomId, setSelectedRoomId] = useState('room-1');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 11:00 AM');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingPurpose, setBookingPurpose] = useState('Team Sprint Sync');
  const [department, setDepartment] = useState('Engineering');

  // Policy Settings (Admin-managed)
  const [policies, setPolicies] = useState({
    maxSlotHours: 2,
    advanceBookingDays: 14,
    enforceReleaseNotice: true,
  });

  const [activeTab, setActiveTab] = useState('finder'); // 'finder' | 'my-bookings' | 'admin-console'
  const [myBookings, setMyBookings] = useState([
    {
      id: 'b-init-1',
      roomName: 'Boardroom Alpha',
      roomId: 'room-1',
      floor: 'Floor 4 • East Wing',
      date: new Date().toISOString().split('T')[0],
      slot: '02:00 PM - 03:00 PM',
      purpose: 'Executive Board Review',
      department: 'Executive Team',
    },
  ]);
  const [toastMessage, setToastMessage] = useState(null);

  // Filtered room list by floor
  const filteredRooms = rooms.filter(
    (r) => selectedFloor === 'All Floors' || r.floor === selectedFloor
  );

  // Current active room
  const currentRoom =
    rooms.find((r) => r.id === selectedRoomId) || filteredRooms[0] || rooms[0];

  // Check if room is occupied or in maintenance
  const isMaintenance = currentRoom.isUnderMaintenance;
  const isOccupied = !isMaintenance && currentRoom.occupiedSlots.includes(selectedSlot);
  const currentOccupant = currentRoom.occupiedDetails?.[selectedSlot];

  // Alternative rooms available during this exact slot
  const alternativeRooms = rooms.filter(
    (r) =>
      r.id !== currentRoom.id &&
      !r.isUnderMaintenance &&
      !r.occupiedSlots.includes(selectedSlot)
  );

  const handleBookRoom = (roomId, roomName, slotTime, floorName) => {
    const newBooking = {
      id: 'b-' + Date.now(),
      roomName,
      roomId,
      floor: floorName || currentRoom.wing,
      date: selectedDate,
      slot: slotTime,
      purpose: bookingPurpose || 'Internal Meeting',
      department: department || 'General Team',
    };

    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupiedSlots: [...r.occupiedSlots, slotTime],
            occupiedDetails: {
              ...r.occupiedDetails,
              [slotTime]: {
                team: department,
                purpose: bookingPurpose,
              },
            },
          };
        }
        return r;
      })
    );

    setMyBookings((prev) => [newBooking, ...prev]);

    setToastMessage({
      type: 'success',
      title: 'Slot Successfully Booked!',
      body: `${roomName} reserved for ${slotTime} on ${selectedDate} (${newBooking.purpose}). Physical door tablet updated.`,
    });

    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleCancelBooking = (booking) => {
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.id === booking.roomId) {
          const updatedDetails = { ...r.occupiedDetails };
          delete updatedDetails[booking.slot];
          return {
            ...r,
            occupiedSlots: r.occupiedSlots.filter((s) => s !== booking.slot),
            occupiedDetails: updatedDetails,
          };
        }
        return r;
      })
    );

    setMyBookings((prev) => prev.filter((b) => b.id !== booking.id));

    setToastMessage({
      type: 'info',
      title: 'Slot Released',
      body: `Reservation for ${booking.roomName} (${booking.slot}) has been cancelled and is now vacant for colleagues.`,
    });

    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleMaintenance = (roomId) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const nextVal = !r.isUnderMaintenance;
          setToastMessage({
            type: nextVal ? 'warning' : 'info',
            title: nextVal ? 'Room Set to Maintenance' : 'Room Maintenance Cleared',
            body: `${r.name} is now ${nextVal ? 'temporarily blocked for maintenance' : 'available for booking'}.`,
          });
          setTimeout(() => setToastMessage(null), 4000);
          return { ...r, isUnderMaintenance: nextVal };
        }
        return r;
      })
    );
  };

  return (
    <section className="room-availability" id="availability">
      <div className="container">
        {/* Portal Top Header & Tab Controls */}
        <div className="portal-header">
          <div>
            <span className="section-tag">Workplace Booking Console</span>
            <h2 className="section-title">Physical Meeting Room & Slot Manager</h2>
            <p className="section-subtitle">
              Schedule physical rooms across Building A floors. If booked, view the earliest next opening or switch to a comparable vacant room.
            </p>
          </div>

          <div className="portal-tab-bar">
            <button
              type="button"
              className={`portal-tab ${activeTab === 'finder' ? 'portal-tab--active' : ''}`}
              onClick={() => setActiveTab('finder')}
            >
              <CalendarCheck2 size={16} />
              <span>Slot Availability</span>
            </button>
            <button
              type="button"
              className={`portal-tab ${activeTab === 'my-bookings' ? 'portal-tab--active' : ''}`}
              onClick={() => setActiveTab('my-bookings')}
            >
              <BookmarkCheck size={16} />
              <span>My Scheduled Slots ({myBookings.length})</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className={`portal-tab ${activeTab === 'admin-console' ? 'portal-tab--active' : ''}`}
                onClick={() => setActiveTab('admin-console')}
              >
                <Settings size={16} />
                <span>Facility Admin Console</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast Alerts */}
        {toastMessage && (
          <div className={`booking-success-toast booking-success-toast--${toastMessage.type}`}>
            <div className="booking-success-toast__icon">
              <CheckCircle size={24} />
            </div>
            <div className="booking-success-toast__text">
              <h4>{toastMessage.title}</h4>
              <p>{toastMessage.body}</p>
            </div>
            <button
              type="button"
              className="booking-success-toast__close"
              onClick={() => setToastMessage(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* TAB 1: FACILITY ADMIN CONSOLE */}
        {activeTab === 'admin-console' && isAdmin && (
          <div className="admin-console-card">
            <div className="admin-console-header">
              <div>
                <h3>Facility Management & Booking Policies</h3>
                <p>Manage physical room availability, maintenance blocks, and duration rules for Building A.</p>
              </div>
              <span className="admin-badge">
                <Shield size={14} /> Facility Admin Role
              </span>
            </div>

            {/* Policy Controls */}
            <div className="admin-policies-row">
              <div className="policy-box">
                <label>
                  <Clock size={15} /> Maximum Consecutive Slot Duration
                </label>
                <select
                  value={policies.maxSlotHours}
                  onChange={(e) =>
                    setPolicies({ ...policies, maxSlotHours: Number(e.target.value) })
                  }
                >
                  <option value={1}>1 Hour Maximum</option>
                  <option value={2}>2 Hours Maximum (Company Standard)</option>
                  <option value={3}>3 Hours Maximum</option>
                  <option value={4}>4 Hours Maximum (Boardrooms only)</option>
                </select>
                <span className="policy-desc">Enforced on all employee reservations across office floors.</span>
              </div>

              <div className="policy-box">
                <label>
                  <Calendar size={15} /> Advance Reservation Window
                </label>
                <select
                  value={policies.advanceBookingDays}
                  onChange={(e) =>
                    setPolicies({ ...policies, advanceBookingDays: Number(e.target.value) })
                  }
                >
                  <option value={7}>Up to 7 Days Ahead</option>
                  <option value={14}>Up to 14 Days Ahead (Default)</option>
                  <option value={30}>Up to 30 Days Ahead</option>
                </select>
                <span className="policy-desc">Limits how far in advance physical slots can be scheduled.</span>
              </div>
            </div>

            {/* Room Maintenance Matrix */}
            <div className="admin-rooms-table-wrapper">
              <h4 className="table-title">Physical Room Inventory & Maintenance Status</h4>
              <table className="admin-rooms-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Code & Location</th>
                    <th>Capacity</th>
                    <th>Hardware & Facilities</th>
                    <th>Maintenance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((rm) => (
                    <tr key={rm.id}>
                      <td>
                        <strong>{rm.name}</strong>
                        <div className="text-sub">{rm.type}</div>
                      </td>
                      <td>
                        <span className="code-tag">{rm.code}</span>
                        <div className="text-sub">{rm.wing}</div>
                      </td>
                      <td>{rm.capacity} Seats</td>
                      <td>
                        <span className="text-sub">{rm.amenities.slice(0, 2).join(' • ')}</span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            rm.isUnderMaintenance ? 'status-pill--danger' : 'status-pill--success'
                          }`}
                        >
                          {rm.isUnderMaintenance ? 'Maintenance Block' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn--sm ${
                            rm.isUnderMaintenance ? 'btn--outline' : 'btn--warning'
                          }`}
                          onClick={() => handleToggleMaintenance(rm.id)}
                        >
                          <Wrench size={13} />
                          {rm.isUnderMaintenance ? 'Clear Block' : 'Block for Maintenance'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MY SCHEDULED SLOTS */}
        {activeTab === 'my-bookings' && (
          <div className="my-bookings-card">
            <div className="my-bookings-header">
              <div>
                <h3>My Scheduled Room Reservations</h3>
                <p className="section-subtitle">
                  Review your active slots. If meetings finish earlier than scheduled, release the slot for other colleagues.
                </p>
              </div>
              <span className="booking-count-tag">{myBookings.length} Active Slots</span>
            </div>

            {myBookings.length === 0 ? (
              <div className="no-bookings-empty">
                <Calendar size={40} />
                <p>You have no active physical room reservations scheduled.</p>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => setActiveTab('finder')}
                >
                  Book a Room Slot
                </button>
              </div>
            ) : (
              <div className="my-bookings-list">
                {myBookings.map((b) => (
                  <div className="my-booking-item" key={b.id}>
                    <div className="my-booking-item__main">
                      <div className="my-booking-title-row">
                        <h4>{b.roomName}</h4>
                        <span className="purpose-tag">{b.purpose}</span>
                      </div>
                      <div className="my-booking-item__meta">
                        <span>
                          <MapPin size={13} /> {b.floor}
                        </span>
                        <span>
                          <Calendar size={13} /> {b.date}
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
                      className="btn btn--sm btn--cancel-booking"
                      onClick={() => handleCancelBooking(b)}
                    >
                      <XCircle size={14} /> Release Slot Early
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SLOT AVAILABILITY FINDER */}
        {activeTab === 'finder' && (
          <div className="availability-card">
            {/* Controls Bar */}
            <div className="availability-controls">
              {/* Floor Filter */}
              <div className="control-group">
                <label htmlFor="floor-filter">
                  <Building size={15} /> Office Floor
                </label>
                <select
                  id="floor-filter"
                  value={selectedFloor}
                  onChange={(e) => {
                    setSelectedFloor(e.target.value);
                    const firstInFloor = rooms.find(
                      (r) => e.target.value === 'All Floors' || r.floor === e.target.value
                    );
                    if (firstInFloor) setSelectedRoomId(firstInFloor.id);
                  }}
                >
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Physical Meeting Room */}
              <div className="control-group">
                <label htmlFor="room-select">
                  <MapPin size={15} /> Physical Room
                </label>
                <select
                  id="room-select"
                  value={currentRoom.id}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code} • {r.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Date */}
              <div className="control-group">
                <label htmlFor="date-select">
                  <Calendar size={15} /> Date
                </label>
                <input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Time Slot */}
              <div className="control-group">
                <label htmlFor="slot-select">
                  <Clock size={15} /> Desired Slot
                </label>
                <select
                  id="slot-select"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Location & Hardware Strip */}
            <div className="room-meta-strip">
              <div className="room-meta-item">
                <span className="room-code-badge">{currentRoom.code}</span>
                <strong>{currentRoom.name}</strong>
                <span className="room-type-tag">{currentRoom.type}</span>
              </div>
              <div className="room-meta-item">
                <MapPin size={14} /> {currentRoom.building} • {currentRoom.wing}
              </div>
              <div className="room-meta-item">
                <Users size={14} /> Capacity: {currentRoom.capacity} People
              </div>
              <div className="room-meta-item room-amenities">
                <Monitor size={14} /> {currentRoom.amenities.join(' • ')}
              </div>
            </div>

            {/* Two-Column Grid: Slot Status / Smart Suggestions + Physical Door Tablet Preview */}
            <div className="portal-main-grid">
              {/* Left Column: Availability Status & Smart Suggestion Engine */}
              <div className="availability-result">
                {isMaintenance ? (
                  /* MAINTENANCE STATE */
                  <div className="result-card result-card--occupied">
                    <div className="result-header result-header--occupied">
                      <div className="result-header__badge">
                        <Wrench size={16} />
                        <span>Room Under Maintenance</span>
                      </div>
                      <h3 className="result-header__title">
                        {currentRoom.name} is Temporarily Blocked
                      </h3>
                      <p className="result-header__desc">
                        Workplace facilities is currently servicing equipment in this room. Please select an alternative room.
                      </p>
                    </div>

                    {alternativeRooms.length > 0 && (
                      <div className="suggestion-box suggestion-box--alternative-rooms">
                        <div className="suggestion-box__tag suggestion-box__tag--alt">
                          <Sparkles size={14} />
                          <span>Recommended Alternative Rooms Available</span>
                        </div>
                        <div className="alternative-rooms-list">
                          {alternativeRooms.slice(0, 2).map((altRoom) => (
                            <div className="alt-room-card" key={altRoom.id}>
                              <div className="alt-room-card__info">
                                <h4 className="alt-room-card__name">{altRoom.name}</h4>
                                <div className="alt-room-card__meta">
                                  <span>
                                    <MapPin size={12} /> {altRoom.wing}
                                  </span>
                                  <span>
                                    <Users size={12} /> {altRoom.capacity} seats
                                  </span>
                                </div>
                                <span className="alt-room-card__equipment">
                                  {altRoom.amenities.slice(0, 2).join(', ')}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() =>
                                  handleBookRoom(
                                    altRoom.id,
                                    altRoom.name,
                                    selectedSlot,
                                    altRoom.wing
                                  )
                                }
                              >
                                Book Room <ArrowRight size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : isOccupied ? (
                  /* OCCUPIED STATE: SHOW SMART SUGGESTIONS */
                  <div className="result-card result-card--occupied">
                    <div className="result-header result-header--occupied">
                      <div className="result-header__badge">
                        <AlertTriangle size={16} />
                        <span>Slot Occupied</span>
                      </div>
                      <h3 className="result-header__title">
                        {currentRoom.name} is Booked for {selectedSlot}
                      </h3>
                      <p className="result-header__desc">
                        Reserved by <strong>{currentOccupant?.team || 'Another Team'}</strong> for "
                        <em>{currentOccupant?.purpose || 'Scheduled Meeting'}</em>". Choose a recommended option below:
                      </p>
                    </div>

                    <div className="suggestions-grid">
                      {/* Suggestion 1: Next open slot in this room */}
                      <div className="suggestion-box suggestion-box--next-slot">
                        <div className="suggestion-box__tag">
                          <Clock size={14} />
                          <span>Next Opening for {currentRoom.name}</span>
                        </div>
                        <div className="suggestion-box__content">
                          <div className="suggestion-time">
                            <span className="time-highlight">{currentRoom.nextAvailableSlot}</span>
                            <span className="date-sub">Same Room • Confirmed Vacant</span>
                          </div>
                          <p className="suggestion-box__note">
                            Earliest available slot today in {currentRoom.name} without moving floors.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn--primary btn--full"
                          onClick={() =>
                            handleBookRoom(
                              currentRoom.id,
                              currentRoom.name,
                              currentRoom.nextAvailableSlot,
                              currentRoom.wing
                            )
                          }
                        >
                          <CalendarCheck2 size={16} /> Book Next Available Slot
                        </button>
                      </div>

                      {/* Suggestion 2: Other rooms available during this exact slot */}
                      <div className="suggestion-box suggestion-box--alternative-rooms">
                        <div className="suggestion-box__tag suggestion-box__tag--alt">
                          <Sparkles size={14} />
                          <span>Other Rooms Free at {selectedSlot}</span>
                        </div>
                        <div className="alternative-rooms-list">
                          {alternativeRooms.length > 0 ? (
                            alternativeRooms.slice(0, 2).map((altRoom) => (
                              <div className="alt-room-card" key={altRoom.id}>
                                <div className="alt-room-card__info">
                                  <h4 className="alt-room-card__name">{altRoom.name}</h4>
                                  <div className="alt-room-card__meta">
                                    <span>
                                      <MapPin size={12} /> {altRoom.wing}
                                    </span>
                                    <span>
                                      <Users size={12} /> {altRoom.capacity} seats
                                    </span>
                                  </div>
                                  <span className="alt-room-card__equipment">
                                    {altRoom.amenities.slice(0, 2).join(', ')}
                                  </span>
                                </div>
                                <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() =>
                                  handleBookRoom(
                                    altRoom.id,
                                    altRoom.name,
                                    selectedSlot,
                                    altRoom.wing
                                  )
                                }
                              >
                                Book Room <ArrowRight size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="no-alt-text">No other rooms available at this specific time slot.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* VACANT: DIRECT RESERVATION FORM */
                <div className="result-card result-card--available">
                  <div className="result-header result-header--available">
                    <div className="result-header__badge">
                      <CheckCircle size={16} />
                      <span>Slot Available</span>
                    </div>
                    <h3 className="result-header__title">
                      {currentRoom.name} is Free during {selectedSlot}
                    </h3>
                    <p className="result-header__desc">
                      Zero conflicting reservations on {currentRoom.wing} for this slot. Enter booking details to lock it in.
                    </p>
                  </div>

                  {/* Booking Details Input */}
                  <div className="booking-form-inline">
                    <div className="form-group">
                      <label htmlFor="booking-purpose">
                        <FileText size={14} /> Meeting Title / Purpose *
                      </label>
                      <input
                        id="booking-purpose"
                        type="text"
                        placeholder="e.g. Sprint Planning, Client Sync, Design Review"
                        value={bookingPurpose}
                        onChange={(e) => setBookingPurpose(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="booking-dept">
                        <Tag size={14} /> Department / Team *
                      </label>
                      <input
                        id="booking-dept"
                        type="text"
                        placeholder="e.g. Engineering, Marketing, Finance"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="available-booking-action">
                    <div className="available-perks">
                      <div className="perk">
                        <Check size={15} /> Anti-overlap guaranteed
                      </div>
                      <div className="perk">
                        <Check size={15} /> Physical door tablet updated
                      </div>
                      <div className="perk">
                        <Check size={15} /> Max {policies.maxSlotHours}-hour duration limit
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn--primary btn--lg"
                      onClick={() =>
                        handleBookRoom(
                          currentRoom.id,
                          currentRoom.name,
                          selectedSlot,
                          currentRoom.wing
                        )
                      }
                    >
                      <CalendarCheck2 size={18} /> Confirm Room Booking for {selectedSlot}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Physical Door Tablet Display Preview */}
            <div className="door-tablet-container">
              <div className="door-tablet-header">
                <Tablet size={16} />
                <span>Physical Room Door Display Preview</span>
              </div>
              <div
                className={`door-tablet ${
                  isMaintenance
                    ? 'door-tablet--maintenance'
                    : isOccupied
                    ? 'door-tablet--occupied'
                    : 'door-tablet--available'
                }`}
              >
                <div className="door-tablet__top">
                  <span className="door-tablet__code">{currentRoom.code}</span>
                  <span className="door-tablet__room-name">{currentRoom.name}</span>
                  <span className="door-tablet__wing">{currentRoom.wing}</span>
                </div>

                <div className="door-tablet__status">
                  <span className="door-tablet__status-pill">
                    {isMaintenance ? 'MAINTENANCE' : isOccupied ? 'OCCUPIED' : 'VACANT'}
                  </span>
                  <div className="door-tablet__time-window">
                    {isMaintenance
                      ? 'Room Offline'
                      : isOccupied
                      ? selectedSlot
                      : 'Ready for Booking'}
                  </div>
                </div>

                <div className="door-tablet__details">
                  {isMaintenance ? (
                    <p className="door-tablet__team">Facilities maintenance in progress.</p>
                  ) : isOccupied ? (
                    <>
                      <p className="door-tablet__team">
                        <strong>Team:</strong> {currentOccupant?.team || department}
                      </p>
                      <p className="door-tablet__purpose">
                        <strong>Purpose:</strong> "{currentOccupant?.purpose || bookingPurpose}"
                      </p>
                    </>
                  ) : (
                    <p className="door-tablet__ready">Tap or use web portal to reserve slot.</p>
                  )}
                </div>

                <div className="door-tablet__footer">
                  <span>Next Free Slot:</span>
                  <strong>{currentRoom.nextAvailableSlot}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </section>
  );
}

export default RoomAvailability;
