import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  LogIn,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  Monitor,
  Video,
  Presentation,
  Tablet,
  Check,
  ChevronRight,
  CalendarCheck2,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../api/authApi';
import './HomeHub.css';

// Complete physical room inventory across Building A campus
const CAMPUS_ROOMS = [
  {
    id: 'room-1',
    code: 'RM-401',
    name: 'Boardroom Alpha',
    type: 'Executive Boardroom',
    floor: 'Floor 4',
    floorCategory: 'floor-4',
    wing: 'East Wing • Room 401',
    capacity: 18,
    sizeCategory: 'large',
    hardware: [
      { name: 'Dual 4K Displays', icon: Monitor },
      { name: 'Cisco VC Bar', icon: Video },
      { name: 'Glass Whiteboard', icon: Presentation },
    ],
    status: 'occupied',
    occupiedSlot: '10:00 AM - 11:00 AM',
    occupiedBy: 'Marketing & Growth',
    purpose: 'Q3 Product Campaign Strategy',
    nextAvailableSlot: '11:30 AM - 12:30 PM',
  },
  {
    id: 'room-6',
    code: 'RM-405',
    name: 'Executive Suite B',
    type: 'Meeting Room',
    floor: 'Floor 4',
    floorCategory: 'floor-4',
    wing: 'West Wing • Room 405',
    capacity: 14,
    sizeCategory: 'large',
    hardware: [
      { name: 'Dual 4K Monitors', icon: Monitor },
      { name: 'Jabra Speak 810', icon: Video },
      { name: 'Tempered Glass Board', icon: Presentation },
    ],
    status: 'available',
    occupiedSlot: null,
    occupiedBy: null,
    purpose: null,
    nextAvailableSlot: 'Now (Open until 03:30 PM)',
  },
  {
    id: 'room-3',
    code: 'RM-302',
    name: 'Innovation Lab',
    type: 'Creative Workshop',
    floor: 'Floor 3',
    floorCategory: 'floor-3',
    wing: 'North Wing • Room 302',
    capacity: 12,
    sizeCategory: 'large',
    hardware: [
      { name: '75" Smart TV', icon: Monitor },
      { name: 'Polycom VC Bar', icon: Video },
      { name: 'Digital Whiteboard', icon: Presentation },
    ],
    status: 'available',
    occupiedSlot: null,
    occupiedBy: null,
    purpose: null,
    nextAvailableSlot: 'Now (Open until 11:30 AM)',
  },
  {
    id: 'room-4',
    code: 'RM-308',
    name: 'Design Sprint Studio',
    type: 'Workshop Space',
    floor: 'Floor 3',
    floorCategory: 'floor-3',
    wing: 'South Wing • Room 308',
    capacity: 8,
    sizeCategory: 'medium',
    hardware: [
      { name: '65" 4K Display', icon: Monitor },
      { name: 'Sticky-Note Wall', icon: Presentation },
      { name: 'Mobile Whiteboard', icon: Presentation },
    ],
    status: 'occupied',
    occupiedSlot: '10:00 AM - 11:00 AM',
    occupiedBy: 'Brand Identity Team',
    purpose: 'Visual Design Workshop',
    nextAvailableSlot: '11:30 AM - 12:30 PM',
  },
  {
    id: 'room-2',
    code: 'RM-201',
    name: 'Conference Room 2A',
    type: 'Team Conference Room',
    floor: 'Floor 2',
    floorCategory: 'floor-2',
    wing: 'Central Hub • Room 201',
    capacity: 10,
    sizeCategory: 'medium',
    hardware: [
      { name: 'Full HD Projector', icon: Monitor },
      { name: 'Polycom Conference Mic', icon: Video },
      { name: 'Magnetic Whiteboard', icon: Presentation },
    ],
    status: 'available',
    occupiedSlot: null,
    occupiedBy: null,
    purpose: null,
    nextAvailableSlot: 'Now (Open until 03:30 PM)',
  },
  {
    id: 'room-7',
    code: 'RM-204',
    name: 'Sprint Room 2B',
    type: 'Team Meeting Room',
    floor: 'Floor 2',
    floorCategory: 'floor-2',
    wing: 'West Wing • Room 204',
    capacity: 6,
    sizeCategory: 'medium',
    hardware: [
      { name: '55" Display', icon: Monitor },
      { name: 'Webcam Bar', icon: Video },
      { name: 'Whiteboard', icon: Presentation },
    ],
    status: 'occupied',
    occupiedSlot: '10:00 AM - 11:00 AM',
    occupiedBy: 'Engineering Pod 2',
    purpose: 'Sprint Retrospective',
    nextAvailableSlot: '01:00 PM - 02:00 PM',
  },
  {
    id: 'room-5',
    code: 'POD-102',
    name: 'Focus Pod Gamma',
    type: 'Acoustic Focus Pod',
    floor: 'Floor 1',
    floorCategory: 'floor-1',
    wing: 'Quiet Zone • Pod 102',
    capacity: 4,
    sizeCategory: 'small',
    hardware: [
      { name: '27" Monitor', icon: Monitor },
      { name: 'Logitech Brio Webcam', icon: Video },
      { name: 'Soundproof Glass', icon: Presentation },
    ],
    status: 'occupied',
    occupiedSlot: '10:00 AM - 11:00 AM',
    occupiedBy: 'Finance & Audit',
    purpose: 'Quarterly Audit Call',
    nextAvailableSlot: '11:00 AM - 12:00 PM',
  },
  {
    id: 'room-8',
    code: 'POD-104',
    name: 'Huddle Pod Beta',
    type: 'Acoustic 1-on-1 Pod',
    floor: 'Floor 1',
    floorCategory: 'floor-1',
    wing: 'Quiet Zone • Pod 104',
    capacity: 4,
    sizeCategory: 'small',
    hardware: [
      { name: '27" Monitor', icon: Monitor },
      { name: 'HD Webcam', icon: Video },
      { name: 'Soundproof Glass', icon: Presentation },
    ],
    status: 'available',
    occupiedSlot: null,
    occupiedBy: null,
    purpose: null,
    nextAvailableSlot: 'Now (Vacant all day)',
  },
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Select Office Room & Slot',
    desc: 'Pick your physical room based on floor, seating capacity, and installed AV equipment, then choose your time slot.',
  },
  {
    num: '02',
    title: 'Real-Time Schedule Validation',
    desc: 'The system validates live occupancy across floors with anti-collision checks, guaranteeing zero double-bookings.',
  },
  {
    num: '03',
    title: 'Instant Booking or Smart Re-Routing',
    desc: 'If free, reserve with 1 click. If occupied, our engine immediately suggests the room\'s next open slot or vacant rooms nearby.',
  },
];

const HARDWARE_STANDARDS = [
  {
    icon: Video,
    title: 'Enterprise Video Conferencing',
    desc: 'Cisco Webex and Polycom video bars pre-configured for one-touch hybrid meetings across all team rooms.',
  },
  {
    icon: Monitor,
    title: 'Dual Ultra HD Displays',
    desc: 'Wireless screen mirroring and HDMI passthrough for high-resolution presentations and multi-screen reviews.',
  },
  {
    icon: Tablet,
    title: 'Digital Door Touchscreens',
    desc: 'Tablets outside every room show current session details, meeting owner, and the next available booking slot.',
  },
  {
    icon: ShieldCheck,
    title: 'Acoustic Privacy & Boards',
    desc: 'Sound-dampening acoustic glass walls, conference speakerphones, and magnetic whiteboards in every room.',
  },
];

function HomeHub() {
  const { openLogin, login } = useAuth();
  const [floorFilter, setFloorFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [heroConflictSimulation, setHeroConflictSimulation] = useState(true);

  const handleQuickLogin = (account) => {
    login(account.email, account.password);
  };

  const filteredRooms = CAMPUS_ROOMS.filter((room) => {
    const matchesFloor = floorFilter === 'all' || room.floorCategory === floorFilter;
    const matchesSize = sizeFilter === 'all' || room.sizeCategory === sizeFilter;
    return matchesFloor && matchesSize;
  });

  return (
    <div className="home-hub">
      {/* ───────────────── 1. HERO SECTION: 2-COLUMN COMMAND CENTER ───────────────── */}
      <section className="hub-hero">
        <div className="container hub-hero__container">
          {/* Left Column: Headline & Action */}
          <div className="hub-hero__left">
            <div className="hub-hero__status-badge">
              <span className="live-pulse" />
              <Building2 size={14} />
              <span>Campus Facility Portal • Building A Headquarters</span>
            </div>

            <h1 className="hub-hero__title">
              Physical Room Booking & <br />
              <span className="hub-hero__title--gradient">Intelligent Slot Routing</span>
            </h1>

            <p className="hub-hero__desc">
              Manage and reserve physical meeting spaces across all 4 office floors.
              Enjoy guaranteed zero double-bookings, or let our smart recommendation engine
              suggest the room's next opening and matching alternative rooms when slots are occupied.
            </p>

            <div className="hub-hero__actions">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={openLogin}
              >
                <LogIn size={18} /> Sign In to Book Rooms
              </button>
              <a href="#floor-directory" className="btn btn--outline btn--lg">
                Explore Floor Directory
              </a>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="hub-quick-access">
              <span className="hub-quick-access__label">One-Click Demo:</span>
              <button
                type="button"
                className="quick-chip"
                onClick={() => handleQuickLogin(DEMO_ACCOUNTS[2])}
                title="Sign in as John Doe (Employee)"
              >
                👤 Employee Access
              </button>
              <button
                type="button"
                className="quick-chip quick-chip--admin"
                onClick={() => handleQuickLogin(DEMO_ACCOUNTS[1])}
                title="Sign in as Acme Administrator (Facility Admin)"
              >
                🏢 Facility Admin
              </button>
            </div>

            {/* Campus Metrics Strip */}
            <div className="hub-hero__metrics">
              <div className="hub-metric">
                <span className="hub-metric__value">12</span>
                <span className="hub-metric__label">Physical Spaces</span>
              </div>
              <div className="hub-metric-divider" />
              <div className="hub-metric">
                <span className="hub-metric__value">4</span>
                <span className="hub-metric__label">Office Floors</span>
              </div>
              <div className="hub-metric-divider" />
              <div className="hub-metric">
                <span className="hub-metric__value">100%</span>
                <span className="hub-metric__label">Conflict-Free Slots</span>
              </div>
              <div className="hub-metric-divider" />
              <div className="hub-metric">
                <span className="hub-metric__value">Instant</span>
                <span className="hub-metric__label">Smart Re-Routing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Conflict Resolution Preview */}
          <div className="hub-hero__right">
            <div className="simulation-showcase">
              <div className="simulation-showcase__header">
                <div>
                  <div className="room-code-tag">RM-401 • Floor 4 East Wing</div>
                  <h3 className="room-name-heading">Boardroom Alpha</h3>
                </div>
                <div className="simulation-toggle-group">
                  <button
                    type="button"
                    className={`sim-btn ${heroConflictSimulation ? 'sim-btn--active' : ''}`}
                    onClick={() => setHeroConflictSimulation(true)}
                  >
                    Occupied Slot
                  </button>
                  <button
                    type="button"
                    className={`sim-btn ${!heroConflictSimulation ? 'sim-btn--active' : ''}`}
                    onClick={() => setHeroConflictSimulation(false)}
                  >
                    Vacant Slot
                  </button>
                </div>
              </div>

              {heroConflictSimulation ? (
                /* SCENARIO: SLOT OCCUPIED -> SHOW SMART SUGGESTIONS */
                <div className="sim-body sim-body--conflict">
                  <div className="sim-status-banner sim-status-banner--occupied">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Slot Occupied: 10:00 AM – 11:00 AM</strong>
                      <p>In use by Marketing Team for "Q3 Product Campaign Strategy"</p>
                    </div>
                  </div>

                  <div className="sim-suggestions-title">
                    <Sparkles size={15} />
                    <span>Intelligent Recommendation Engine</span>
                  </div>

                  <div className="sim-suggestion-card">
                    <div className="sim-suggestion-tag">
                      <Clock size={13} />
                      <span>Next Open Slot (Same Room)</span>
                    </div>
                    <div className="sim-suggestion-time">11:30 AM – 12:30 PM Today</div>
                    <p className="sim-suggestion-sub">
                      Earliest open 1-hour window in Boardroom Alpha without moving floors.
                    </p>
                    <button type="button" className="btn btn--primary btn--sm btn--full" onClick={openLogin}>
                      <CalendarCheck2 size={15} /> Sign In to Book Next Slot
                    </button>
                  </div>

                  <div className="sim-suggestion-card sim-suggestion-card--alt">
                    <div className="sim-suggestion-tag sim-suggestion-tag--purple">
                      <Building2 size={13} />
                      <span>Alternative Vacant Room at 10:00 AM</span>
                    </div>
                    <div className="sim-alt-room-row">
                      <div>
                        <strong>Conference Room 2A</strong>
                        <span className="alt-meta">Floor 2 • 10 Seats • Projector & VC</span>
                      </div>
                      <button type="button" className="btn btn--outline btn--sm" onClick={openLogin}>
                        Book Room <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* SCENARIO: SLOT VACANT -> 1-CLICK RESERVATION */
                <div className="sim-body sim-body--free">
                  <div className="sim-status-banner sim-status-banner--free">
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>Slot Available: 09:00 AM – 10:00 AM</strong>
                      <p>Zero overlapping reservations on Floor 4. Ready for booking.</p>
                    </div>
                  </div>

                  <div className="sim-free-features">
                    <div className="free-perk">
                      <Check size={16} /> 18-Person Executive Seating
                    </div>
                    <div className="free-perk">
                      <Check size={16} /> Dual 4K Displays & Cisco VC Bar Ready
                    </div>
                    <div className="free-perk">
                      <Check size={16} /> Syncs directly to outside door tablet
                    </div>
                  </div>

                  <div className="sim-free-action">
                    <button type="button" className="btn btn--primary btn--lg btn--full" onClick={openLogin}>
                      <CalendarCheck2 size={18} /> Sign In to Reserve This Slot
                    </button>
                    <span className="sim-policy-note">Follows company 2-hour consecutive duration policy</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── 2. INTERACTIVE CAMPUS ROOM DIRECTORY ───────────────── */}
      <section className="hub-directory" id="floor-directory">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Campus Directory</span>
            <h2 className="section-title">Physical Rooms by Floor & Capacity</h2>
            <p className="section-subtitle">
              Browse physical rooms in Building A. Inspect live vacancy status and equipment before signing in to reserve.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="directory-filters">
            {/* Floor Category Tabs */}
            <div className="filter-pill-group">
              <span className="filter-group-label">
                <Layers size={14} /> Floor:
              </span>
              <button
                type="button"
                className={`filter-pill ${floorFilter === 'all' ? 'filter-pill--active' : ''}`}
                onClick={() => setFloorFilter('all')}
              >
                All Floors ({CAMPUS_ROOMS.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${floorFilter === 'floor-4' ? 'filter-pill--active' : ''}`}
                onClick={() => setFloorFilter('floor-4')}
              >
                Floor 4 — Executive
              </button>
              <button
                type="button"
                className={`filter-pill ${floorFilter === 'floor-3' ? 'filter-pill--active' : ''}`}
                onClick={() => setFloorFilter('floor-3')}
              >
                Floor 3 — Creative Labs
              </button>
              <button
                type="button"
                className={`filter-pill ${floorFilter === 'floor-2' ? 'filter-pill--active' : ''}`}
                onClick={() => setFloorFilter('floor-2')}
              >
                Floor 2 — Team Hub
              </button>
              <button
                type="button"
                className={`filter-pill ${floorFilter === 'floor-1' ? 'filter-pill--active' : ''}`}
                onClick={() => setFloorFilter('floor-1')}
              >
                Floor 1 — Focus Pods
              </button>
            </div>

            {/* Capacity Dropdown */}
            <div className="capacity-filter">
              <span className="filter-group-label">
                <Users size={14} /> Size:
              </span>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                aria-label="Filter rooms by capacity"
              >
                <option value="all">All Capacities</option>
                <option value="small">Focus Pods (2 - 4 seats)</option>
                <option value="medium">Team Rooms (6 - 10 seats)</option>
                <option value="large">Boardrooms (12+ seats)</option>
              </select>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="directory-grid">
            {filteredRooms.map((room) => {
              const isAvailable = room.status === 'available';
              return (
                <div className="room-card" key={room.id}>
                  <div className="room-card__top">
                    <div>
                      <span className="room-card__code">{room.code}</span>
                      <h3 className="room-card__name">{room.name}</h3>
                      <span className="room-card__type">{room.type}</span>
                    </div>
                    <span
                      className={`room-card__status-dot ${
                        isAvailable ? 'room-card__status-dot--green' : 'room-card__status-dot--amber'
                      }`}
                      title={isAvailable ? 'Vacant Now' : 'Currently in session'}
                    >
                      {isAvailable ? 'Vacant' : 'In Session'}
                    </span>
                  </div>

                  <div className="room-card__location">
                    <MapPin size={13} />
                    <span>Building A • {room.wing}</span>
                  </div>

                  <div className="room-card__specs">
                    <div className="spec-badge">
                      <Users size={13} /> {room.capacity} People
                    </div>
                    <div className="hardware-chips">
                      {room.hardware.map((hw) => {
                        const Icon = hw.icon;
                        return (
                          <span className="hw-chip" key={hw.name} title={hw.name}>
                            <Icon size={12} /> {hw.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="room-card__status-box">
                    {isAvailable ? (
                      <div className="status-avail-text">
                        <CheckCircle2 size={14} />
                        <span>{room.nextAvailableSlot}</span>
                      </div>
                    ) : (
                      <div className="status-occ-text">
                        <div className="occ-title">
                          <AlertTriangle size={14} /> In use by {room.occupiedBy}
                        </div>
                        <div className="occ-next">Next Open: <strong>{room.nextAvailableSlot}</strong></div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`btn btn--full ${isAvailable ? 'btn--primary' : 'btn--outline'} btn--sm`}
                    onClick={openLogin}
                  >
                    Sign In to Reserve <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── 3. THE 3-STEP WORKFLOW ───────────────── */}
      <section className="hub-workflow">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Booking Flow</span>
            <h2 className="section-title">How Physical Room Scheduling Works</h2>
            <p className="section-subtitle">
              Engineered to eliminate hallway confusion, stop double-bookings, and instantly re-route when rooms are busy.
            </p>
          </div>

          <div className="workflow-grid">
            {WORKFLOW_STEPS.map((step) => (
              <div className="workflow-card" key={step.num}>
                <div className="workflow-card__number">{step.num}</div>
                <h3 className="workflow-card__title">{step.title}</h3>
                <p className="workflow-card__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── 4. PHYSICAL HARDWARE STANDARDS ───────────────── */}
      <section className="hub-hardware">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Room Amenities</span>
            <h2 className="section-title">Campus Physical Facilities Standards</h2>
            <p className="section-subtitle">
              Every room across Building A is equipped with enterprise collaboration infrastructure.
            </p>
          </div>

          <div className="hardware-grid">
            {HARDWARE_STANDARDS.map((h) => {
              const IconComponent = h.icon;
              return (
                <div className="hardware-card" key={h.title}>
                  <div className="hardware-card__icon">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="hardware-card__title">{h.title}</h3>
                  <p className="hardware-card__desc">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── 5. CORPORATE SSO / CALLOUT BANNER ───────────────── */}
      <section className="hub-cta">
        <div className="container">
          <div className="cta-box">
            <div className="cta-box__content">
              <h2>Ready to Reserve a Physical Room in Building A?</h2>
              <p>
                Sign in with your corporate credentials to check slot availability, lock in reservations, or release slots early.
              </p>
            </div>
            <div className="cta-box__actions">
              <button type="button" className="btn btn--primary btn--lg" onClick={openLogin}>
                <LogIn size={18} /> Sign In to Workplace Portal
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeHub;
