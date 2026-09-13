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
  Layers,
  ChevronRight,
  HelpCircle,
  Send,
  Video,
  Presentation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './WorkplacePortal.css';

const INITIAL_ROOMS = [
  {
    id: 'room-1',
    code: 'RM-401',
    name: 'Boardroom Alpha',
    building: 'Building A',
    floor: 'Floor 4',
    floorCategory: 'floor-4',
    wing: 'East Wing • Room 401',
    capacity: 18,
    sizeCategory: 'large',
    type: 'Executive Boardroom',
    hardware: [
      { name: 'Dual 4K Displays', icon: Monitor },
      { name: 'Cisco VC Bar', icon: Video },
      { name: 'Glass Whiteboard', icon: Presentation },
    ],
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
    code: 'RM-201',
    name: 'Conference Room 2A',
    building: 'Building A',
    floor: 'Floor 2',
    floorCategory: 'floor-2',
    wing: 'Central Hub • Room 201',
    capacity: 10,
    sizeCategory: 'medium',
    type: 'Team Conference Room',
    hardware: [
      { name: 'Full HD Projector', icon: Monitor },
      { name: 'Polycom Conference Mic', icon: Video },
      { name: 'Magnetic Whiteboard', icon: Presentation },
    ],
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
    code: 'RM-302',
    name: 'Innovation Lab',
    building: 'Building A',
    floor: 'Floor 3',
    floorCategory: 'floor-3',
    wing: 'North Wing • Room 302',
    capacity: 12,
    sizeCategory: 'large',
    type: 'Creative Workshop Room',
    hardware: [
      { name: '75" Smart TV', icon: Monitor },
      { name: 'Polycom VC Bar', icon: Video },
      { name: 'Digital Whiteboard', icon: Presentation },
    ],
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
    code: 'RM-308',
    name: 'Design Sprint Studio',
    building: 'Building A',
    floor: 'Floor 3',
    floorCategory: 'floor-3',
    wing: 'South Wing • Room 308',
    capacity: 8,
    sizeCategory: 'medium',
    type: 'Workshop Space',
    hardware: [
      { name: '65" 4K Display', icon: Monitor },
      { name: 'Sticky-Note Wall', icon: Presentation },
      { name: 'Mobile Whiteboard', icon: Presentation },
    ],
    occupiedSlots: ['10:00 AM - 11:00 AM'],
    occupiedDetails: {
      '10:00 AM - 11:00 AM': { team: 'Brand Identity Team', purpose: 'Visual Design Workshop' },
    },
    nextAvailableSlot: '11:30 AM - 12:30 PM',
    isUnderMaintenance: false,
  },
  {
    id: 'room-5',
    code: 'POD-102',
    name: 'Focus Pod Gamma',
    building: 'Building A',
    floor: 'Floor 1',
    floorCategory: 'floor-1',
    wing: 'Quiet Zone • Pod 102',
    capacity: 4,
    sizeCategory: 'small',
    type: 'Acoustic Focus Pod',
    hardware: [
      { name: '27" Monitor', icon: Monitor },
      { name: 'Logitech Brio Webcam', icon: Video },
      { name: 'Acoustic Soundproofing', icon: Presentation },
    ],
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
    code: 'RM-405',
    name: 'Executive Suite B',
    building: 'Building A',
    floor: 'Floor 4',
    floorCategory: 'floor-4',
    wing: 'West Wing • Room 405',
    capacity: 14,
    sizeCategory: 'large',
    type: 'Meeting Room',
    hardware: [
      { name: 'Dual 4K Monitors', icon: Monitor },
      { name: 'Jabra Speak 810', icon: Video },
      { name: 'Tempered Glass Board', icon: Presentation },
    ],
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

function WorkplacePortal() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('slot-finder'); // 'slot-finder' | 'directory' | 'my-bookings' | 'admin-console' | 'helpdesk'
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedRoomId, setSelectedRoomId] = useState('room-1');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 11:00 AM');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingPurpose, setBookingPurpose] = useState('Sprint Planning');
  const [department, setDepartment] = useState('Engineering');

  // Directory filter state
  const [dirFloorFilter, setDirFloorFilter] = useState('all');
  const [dirSizeFilter, setDirSizeFilter] = useState('all');

  // Policies (Admin-managed)
  const [policies, setPolicies] = useState({
    maxSlotHours: 2,
    advanceBookingDays: 14,
  });

  // Helpdesk form state
  const [helpdeskForm, setHelpdeskForm] = useState({
    roomName: 'Boardroom Alpha',
    category: 'Hardware Issue',
    message: '',
  });
  const [helpdeskSubmitted, setHelpdeskSubmitted] = useState(false);

  // Active reservations
  const [myBookings, setMyBookings] = useState([
    {
      id: 'b-init-1',
      roomName: 'Boardroom Alpha',
      roomId: 'room-1',
      floor: 'Floor 4 • East Wing',
      date: new Date().toISOString().split('T')[0],
      slot: '02:00 PM - 03:00 PM',
      purpose: 'Quarterly Financial Review',
      department: 'Executive Team',
    },
  ]);
  const [toastMessage, setToastMessage] = useState(null);

  // Current active room for slot finder
  const filteredRooms = rooms.filter(
    (r) => selectedFloor === 'All Floors' || r.floor === selectedFloor
  );
  const currentRoom =
    rooms.find((r) => r.id === selectedRoomId) || filteredRooms[0] || rooms[0];

  const isMaintenance = currentRoom.isUnderMaintenance;
  const isOccupied = !isMaintenance && currentRoom.occupiedSlots.includes(selectedSlot);
  const currentOccupant = currentRoom.occupiedDetails?.[selectedSlot];

  // Alternative rooms free during this slot
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

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupiedSlots: [...r.occupiedSlots, slotTime],
            occupiedDetails: {
              ...r.occupiedDetails,
              [slotTime]: { team: department, purpose: bookingPurpose },
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
      body: `${roomName} reserved for ${slotTime} on ${selectedDate} ("${newBooking.purpose}"). Door tablet updated.`,
    });

    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleCancelBooking = (booking) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === booking.roomId) {
          const updated = { ...r.occupiedDetails };
          delete updated[booking.slot];
          return {
            ...r,
            occupiedSlots: r.occupiedSlots.filter((s) => s !== booking.slot),
            occupiedDetails: updated,
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
            body: `${r.name} is now ${nextVal ? 'temporarily offline for maintenance' : 'available for booking'}.`,
          });
          setTimeout(() => setToastMessage(null), 4000);
          return { ...r, isUnderMaintenance: nextVal };
        }
        return r;
      })
    );
  };

  const handleHelpdeskSubmit = (e) => {
    e.preventDefault();
    setHelpdeskSubmitted(true);
    setTimeout(() => {
      setHelpdeskSubmitted(false);
      setHelpdeskForm({ roomName: 'Boardroom Alpha', category: 'Hardware Issue', message: '' });
    }, 4000);
  };

  const filteredDirectoryRooms = rooms.filter((room) => {
    const matchesFloor = dirFloorFilter === 'all' || room.floorCategory === dirFloorFilter;
    const matchesSize = dirSizeFilter === 'all' || room.sizeCategory === dirSizeFilter;
    return matchesFloor && matchesSize;
  });

  return (
    <div className="workplace-portal">
      <div className="container">
        {/* Navigation Tabs Header */}
        <div className="portal-top-bar">
          <div className="portal-title-block">
            <span className="section-tag">Workplace Portal</span>
            <h2 className="portal-main-heading">Physical Room & Slot Manager</h2>
          </div>

          {/* Tab Navigation */}
          <nav className="portal-nav-tabs" aria-label="Portal Navigation">
            <button
              type="button"
              className={`nav-tab ${activeTab === 'slot-finder' ? 'nav-tab--active' : ''}`}
              onClick={() => setActiveTab('slot-finder')}
            >
              <CalendarCheck2 size={16} />
              <span>Book a Slot</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'directory' ? 'nav-tab--active' : ''}`}
              onClick={() => setActiveTab('directory')}
            >
              <Layers size={16} />
              <span>Campus Directory</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'my-bookings' ? 'nav-tab--active' : ''}`}
              onClick={() => setActiveTab('my-bookings')}
            >
              <BookmarkCheck size={16} />
              <span>My Scheduled Slots ({myBookings.length})</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className={`nav-tab nav-tab--admin ${activeTab === 'admin-console' ? 'nav-tab--active' : ''}`}
                onClick={() => setActiveTab('admin-console')}
              >
                <Settings size={16} />
                <span>Facility Admin</span>
              </button>
            )}

            <button
              type="button"
              className={`nav-tab ${activeTab === 'helpdesk' ? 'nav-tab--active' : ''}`}
              onClick={() => setActiveTab('helpdesk')}
            >
              <HelpCircle size={16} />
              <span>Facility Helpdesk</span>
            </button>
          </nav>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className={`portal-toast portal-toast--${toastMessage.type}`}>
            <div className="portal-toast__icon">
              <CheckCircle size={22} />
            </div>
            <div className="portal-toast__text">
              <h4>{toastMessage.title}</h4>
              <p>{toastMessage.body}</p>
            </div>
            <button
              type="button"
              className="portal-toast__close"
              onClick={() => setToastMessage(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* ════════════════════ TAB 1: BOOK A SLOT ════════════════════ */}
        {activeTab === 'slot-finder' && (
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

              <div className="control-box">
                <label htmlFor="slot-room">
                  <MapPin size={14} /> Physical Room
                </label>
                <select
                  id="slot-room"
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

              <div className="control-box">
                <label htmlFor="slot-date">
                  <Calendar size={14} /> Date
                </label>
                <input
                  id="slot-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="control-box">
                <label htmlFor="slot-time">
                  <Clock size={14} /> Desired Slot
                </label>
                <select
                  id="slot-time"
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
                                <span className="alt-sub">{alt.wing} • {alt.capacity} seats</span>
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
                        <h3>{currentRoom.name} is Booked for {selectedSlot}</h3>
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
                            handleBookRoom(
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
                                  <span className="alt-sub">{alt.wing} • {alt.capacity} seats</span>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn--outline btn--sm"
                                  onClick={() => handleBookRoom(alt.id, alt.name, selectedSlot, alt.wing)}
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
                        <h3>{currentRoom.name} is Free during {selectedSlot}</h3>
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
                          onChange={(e) => setBookingPurpose(e.target.value)}
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
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Engineering, Product, Finance"
                          required
                        />
                      </div>
                    </div>

                    <div className="booking-action-bar">
                      <div className="perks-list">
                        <span><Check size={14} /> Zero overlap guaranteed</span>
                        <span><Check size={14} /> Door tablet sync</span>
                        <span><Check size={14} /> Max {policies.maxSlotHours}-hour duration rule</span>
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
                        <CalendarCheck2 size={17} /> Confirm Room Booking for {selectedSlot}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Digital Door Tablet Display Preview */}
              <div className="door-tablet-wrapper">
                <span className="door-tablet-tag">
                  <Tablet size={14} /> Physical Room Door Display
                </span>
                <div
                  className={`door-tablet ${
                    isMaintenance
                      ? 'door-tablet--maintenance'
                      : isOccupied
                      ? 'door-tablet--occupied'
                      : 'door-tablet--available'
                  }`}
                >
                  <div className="tablet-header">
                    <span className="tablet-code">{currentRoom.code}</span>
                    <h4 className="tablet-room">{currentRoom.name}</h4>
                    <span className="tablet-loc">{currentRoom.wing}</span>
                  </div>

                  <div className="tablet-status-strip">
                    <span className="tablet-badge">
                      {isMaintenance ? 'MAINTENANCE' : isOccupied ? 'OCCUPIED' : 'VACANT'}
                    </span>
                    <div className="tablet-slot">
                      {isMaintenance ? 'Room Offline' : isOccupied ? selectedSlot : 'Ready for Booking'}
                    </div>
                  </div>

                  <div className="tablet-info">
                    {isMaintenance ? (
                      <p>Facilities equipment maintenance in progress.</p>
                    ) : isOccupied ? (
                      <>
                        <p><strong>Team:</strong> {currentOccupant?.team || department}</p>
                        <p><strong>Purpose:</strong> "{currentOccupant?.purpose || bookingPurpose}"</p>
                      </>
                    ) : (
                      <p className="tablet-free-msg">Tap door screen or web console to reserve.</p>
                    )}
                  </div>

                  <div className="tablet-footer">
                    <span>Next Open Window:</span>
                    <strong>{currentRoom.nextAvailableSlot}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 2: CAMPUS ROOM DIRECTORY ════════════════════ */}
        {activeTab === 'directory' && (
          <div className="portal-card directory-panel">
            <div className="directory-toolbar">
              <div className="dir-pills">
                <button
                  type="button"
                  className={`dir-pill ${dirFloorFilter === 'all' ? 'dir-pill--active' : ''}`}
                  onClick={() => setDirFloorFilter('all')}
                >
                  All Floors ({rooms.length})
                </button>
                <button
                  type="button"
                  className={`dir-pill ${dirFloorFilter === 'floor-4' ? 'dir-pill--active' : ''}`}
                  onClick={() => setDirFloorFilter('floor-4')}
                >
                  Floor 4 — Executive
                </button>
                <button
                  type="button"
                  className={`dir-pill ${dirFloorFilter === 'floor-3' ? 'dir-pill--active' : ''}`}
                  onClick={() => setDirFloorFilter('floor-3')}
                >
                  Floor 3 — Collaborative Labs
                </button>
                <button
                  type="button"
                  className={`dir-pill ${dirFloorFilter === 'floor-2' ? 'dir-pill--active' : ''}`}
                  onClick={() => setDirFloorFilter('floor-2')}
                >
                  Floor 2 — Team Hub
                </button>
                <button
                  type="button"
                  className={`dir-pill ${dirFloorFilter === 'floor-1' ? 'dir-pill--active' : ''}`}
                  onClick={() => setDirFloorFilter('floor-1')}
                >
                  Floor 1 — Focus Pods
                </button>
              </div>

              <div className="dir-size-select">
                <label htmlFor="dir-size">Capacity:</label>
                <select
                  id="dir-size"
                  value={dirSizeFilter}
                  onChange={(e) => setDirSizeFilter(e.target.value)}
                >
                  <option value="all">All Sizes</option>
                  <option value="small">Focus Pods (2 - 4 seats)</option>
                  <option value="medium">Team Rooms (6 - 10 seats)</option>
                  <option value="large">Boardrooms (12+ seats)</option>
                </select>
              </div>
            </div>

            <div className="directory-grid">
              {filteredDirectoryRooms.map((r) => {
                const isAvail = !r.isUnderMaintenance && !r.occupiedSlots.includes(selectedSlot);
                return (
                  <div className="dir-room-card" key={r.id}>
                    <div className="dir-room-card__header">
                      <div>
                        <span className="room-code-tag">{r.code}</span>
                        <h4>{r.name}</h4>
                        <span className="dir-type">{r.type}</span>
                      </div>
                      <span
                        className={`status-indicator ${
                          r.isUnderMaintenance
                            ? 'status-indicator--maint'
                            : isAvail
                            ? 'status-indicator--free'
                            : 'status-indicator--busy'
                        }`}
                      >
                        {r.isUnderMaintenance ? 'Maintenance' : isAvail ? 'Vacant' : 'In Session'}
                      </span>
                    </div>

                    <div className="dir-loc">
                      <MapPin size={13} /> {r.building} • {r.wing}
                    </div>

                    <div className="dir-specs">
                      <span className="spec-item"><Users size={13} /> {r.capacity} Seats</span>
                      <div className="dir-hw-chips">
                        {r.hardware.map((hw) => (
                          <span className="hw-tag" key={hw.name}>{hw.name}</span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn--outline btn--sm btn--full"
                      onClick={() => {
                        setSelectedRoomId(r.id);
                        setActiveTab('slot-finder');
                      }}
                    >
                      Check Slots for this Room <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 3: MY SCHEDULED SLOTS ════════════════════ */}
        {activeTab === 'my-bookings' && (
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
                  onClick={() => setActiveTab('slot-finder')}
                >
                  Book a Room Slot
                </button>
              </div>
            ) : (
              <div className="bookings-list">
                {myBookings.map((b) => (
                  <div className="booking-card-row" key={b.id}>
                    <div className="booking-card-row__left">
                      <div className="title-row">
                        <h4>{b.roomName}</h4>
                        <span className="purpose-pill">{b.purpose}</span>
                      </div>
                      <div className="meta-row">
                        <span><MapPin size={13} /> {b.floor}</span>
                        <span><Calendar size={13} /> {b.date}</span>
                        <span><Clock size={13} /> {b.slot}</span>
                        <span><Tag size={13} /> {b.department}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn--sm btn--release"
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

        {/* ════════════════════ TAB 4: FACILITY ADMIN CONSOLE ════════════════════ */}
        {activeTab === 'admin-console' && isAdmin && (
          <div className="portal-card admin-panel">
            <div className="panel-header">
              <div>
                <h3>Facility Management & Booking Policies</h3>
                <p>Manage physical room availability, maintenance status, and reservation limits for Building A.</p>
              </div>
              <span className="admin-role-badge">
                <Shield size={14} /> Facility Admin
              </span>
            </div>

            {/* Policy Settings */}
            <div className="policies-grid">
              <div className="policy-card">
                <label htmlFor="max-slot">
                  <Clock size={15} /> Maximum Consecutive Slot Duration
                </label>
                <select
                  id="max-slot"
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
                <span className="policy-help">Enforced on all employee reservations across office floors.</span>
              </div>

              <div className="policy-card">
                <label htmlFor="adv-days">
                  <Calendar size={15} /> Advance Reservation Window
                </label>
                <select
                  id="adv-days"
                  value={policies.advanceBookingDays}
                  onChange={(e) =>
                    setPolicies({ ...policies, advanceBookingDays: Number(e.target.value) })
                  }
                >
                  <option value={7}>Up to 7 Days Ahead</option>
                  <option value={14}>Up to 14 Days Ahead (Standard)</option>
                  <option value={30}>Up to 30 Days Ahead</option>
                </select>
                <span className="policy-help">Limits how far in advance employees can book rooms.</span>
              </div>
            </div>

            {/* Room Maintenance Inventory Table */}
            <div className="admin-table-block">
              <h4>Physical Room Maintenance Status</h4>
              <div className="table-responsive">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Location</th>
                      <th>Capacity</th>
                      <th>Equipment</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((rm) => (
                      <tr key={rm.id}>
                        <td>
                          <strong>{rm.name}</strong>
                          <div className="sub-txt">{rm.type}</div>
                        </td>
                        <td>
                          <span className="code-pill">{rm.code}</span>
                          <div className="sub-txt">{rm.wing}</div>
                        </td>
                        <td>{rm.capacity} Seats</td>
                        <td>
                          <span className="sub-txt">{rm.hardware.map((h) => h.name).join(', ')}</span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              rm.isUnderMaintenance ? 'status-pill--maint' : 'status-pill--ok'
                            }`}
                          >
                            {rm.isUnderMaintenance ? 'Maintenance Block' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn--sm ${
                              rm.isUnderMaintenance ? 'btn--outline' : 'btn--warn'
                            }`}
                            onClick={() => handleToggleMaintenance(rm.id)}
                          >
                            <Wrench size={13} />
                            {rm.isUnderMaintenance ? 'Clear Block' : 'Block Maintenance'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 5: FACILITY HELPDESK ════════════════════ */}
        {activeTab === 'helpdesk' && (
          <div className="portal-card helpdesk-panel">
            <div className="panel-header">
              <div>
                <h3>Facility Operations & Hardware Helpdesk</h3>
                <p>Report faulty displays, video conference issues, or request special room configurations.</p>
              </div>
              <span className="counter-pill">Internal Ops Desk • Ext. 4004</span>
            </div>

            {helpdeskSubmitted ? (
              <div className="helpdesk-success">
                <CheckCircle size={44} />
                <h4>Ticket Submitted to Workplace Operations</h4>
                <p>A facilities technician has been dispatched to check the physical room hardware.</p>
              </div>
            ) : (
              <form className="helpdesk-form" onSubmit={handleHelpdeskSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="hd-room">Target Physical Room *</label>
                    <select
                      id="hd-room"
                      value={helpdeskForm.roomName}
                      onChange={(e) => setHelpdeskForm({ ...helpdeskForm, roomName: e.target.value })}
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.code} • {r.wing})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="hd-cat">Issue Category *</label>
                    <select
                      id="hd-cat"
                      value={helpdeskForm.category}
                      onChange={(e) => setHelpdeskForm({ ...helpdeskForm, category: e.target.value })}
                    >
                      <option value="Hardware Issue">Faulty Display / VC Camera</option>
                      <option value="Cables Missing">HDMI / USB-C Cables Missing</option>
                      <option value="Booking Collision">Physical Room Collision</option>
                      <option value="Room Temperature">HVAC / Temperature Issue</option>
                      <option value="Supplies">Markers / Cleaning Needed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="hd-msg">Issue Description & Details *</label>
                  <textarea
                    id="hd-msg"
                    rows="4"
                    placeholder="Describe the issue with the physical room or equipment..."
                    value={helpdeskForm.message}
                    onChange={(e) => setHelpdeskForm({ ...helpdeskForm, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn--primary btn--lg">
                  <Send size={16} /> Submit Facility Ticket
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkplacePortal;
