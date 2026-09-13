import React from 'react';
import {
  Building2,
  MapPin,
  Users,
  LogIn,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../api/authApi';
import './HomeHub.css';

// Live snapshot of company rooms across office floors
const FLOOR_OVERVIEW = [
  {
    floor: 'Floor 4 — Executive Level',
    wing: 'East & West Wings',
    rooms: [
      { name: 'Boardroom Alpha', code: 'RM-401', capacity: 18, status: 'occupied', nextFree: '11:30 AM' },
      { name: 'Executive Suite B', code: 'RM-405', capacity: 14, status: 'available', nextFree: 'Now' },
    ],
  },
  {
    floor: 'Floor 3 — Collaborative Lab',
    wing: 'North Wing',
    rooms: [
      { name: 'Innovation Lab', code: 'RM-302', capacity: 12, status: 'available', nextFree: 'Now' },
      { name: 'Design Sprint Studio', code: 'RM-308', capacity: 8, status: 'occupied', nextFree: '11:30 AM' },
    ],
  },
  {
    floor: 'Floor 2 — General Team Spaces',
    wing: 'Central Hub',
    rooms: [
      { name: 'Conference Room 2A', code: 'RM-201', capacity: 10, status: 'available', nextFree: 'Now' },
      { name: 'Project Room 2B', code: 'RM-204', capacity: 6, status: 'occupied', nextFree: '01:00 PM' },
    ],
  },
  {
    floor: 'Floor 1 — Focus & Huddle Pods',
    wing: 'Quiet Zone',
    rooms: [
      { name: 'Focus Pod Gamma', code: 'POD-102', capacity: 4, status: 'occupied', nextFree: '11:00 AM' },
      { name: 'Huddle Pod Beta', code: 'POD-104', capacity: 4, status: 'available', nextFree: 'Now' },
    ],
  },
];

const GUIDELINES = [
  {
    icon: Clock,
    title: '2-Hour Slot Maximum',
    desc: 'Company policy limits single reservations to 2 consecutive hours to maintain fair access across all departments.',
  },
  {
    icon: Sparkles,
    title: 'Smart Conflict Re-Routing',
    desc: 'If your preferred room is booked, the portal automatically offers the room\'s next opening or equivalent rooms nearby.',
  },
  {
    icon: CheckCircle2,
    title: 'Early Slot Release',
    desc: 'Finished your meeting early? Release the slot from your active reservations so colleagues can use the physical space.',
  },
  {
    icon: ShieldCheck,
    title: 'Hardware & Facilities Care',
    desc: 'Ensure Cisco VC bars, displays, and whiteboard markers remain in their designated physical rooms after your session.',
  },
];

function HomeHub() {
  const { openLogin, login } = useAuth();

  const handleQuickLogin = (account) => {
    login(account.email, account.password);
  };

  return (
    <div className="home-hub">
      {/* Top Banner */}
      <section className="hub-hero">
        <div className="container">
          <div className="hub-hero__badge">
            <Building2 size={15} />
            <span>Corporate Facilities Operations • Building A Headquarters</span>
          </div>
          <h1 className="hub-hero__title">
            Company Meeting Room <br />
            <span className="hub-hero__title--accent">Management & Slot Portal</span>
          </h1>
          <p className="hub-hero__subtitle">
            Internal scheduling system for company physical meeting rooms. Check live floor availability,
            reserve slots conflict-free, or get smart suggestions for next openings and alternative rooms.
          </p>

          {/* Quick Access Card */}
          <div className="hub-access-card">
            <div className="hub-access-card__info">
              <h3>Employee & Facility Sign In</h3>
              <p>Sign in with your corporate credentials to book rooms and manage your scheduled slots.</p>
            </div>
            <div className="hub-access-card__actions">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={openLogin}
              >
                <LogIn size={18} /> Sign In to Book Rooms
              </button>
              <div className="hub-quick-chips">
                <span className="hub-quick-chips__label">Quick Access:</span>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickLogin(DEMO_ACCOUNTS[2])}
                  title="Sign in as John Doe (Employee)"
                >
                  👤 Employee
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
            </div>
          </div>
        </div>
      </section>

      {/* Live Physical Room Snapshot */}
      <section className="hub-snapshot" id="floor-overview">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Campus Status</span>
            <h2 className="section-title">Physical Rooms Snapshot</h2>
            <p className="section-subtitle">
              Live status across Building A office floors. Sign in to reserve any available slot.
            </p>
          </div>

          <div className="floors-grid">
            {FLOOR_OVERVIEW.map((floor) => (
              <div className="floor-card" key={floor.floor}>
                <div className="floor-card__header">
                  <div>
                    <h3 className="floor-card__name">{floor.floor}</h3>
                    <span className="floor-card__wing">{floor.wing}</span>
                  </div>
                  <Layers size={18} className="floor-card__icon" />
                </div>

                <div className="floor-card__rooms">
                  {floor.rooms.map((room) => {
                    const isAvail = room.status === 'available';
                    return (
                      <div className="room-pill" key={room.name}>
                        <div className="room-pill__left">
                          <span className="room-pill__code">{room.code}</span>
                          <span className="room-pill__name">{room.name}</span>
                          <span className="room-pill__cap">
                            <Users size={12} /> {room.capacity}
                          </span>
                        </div>
                        <div className="room-pill__right">
                          <span
                            className={`room-status-badge ${
                              isAvail ? 'room-status-badge--avail' : 'room-status-badge--occ'
                            }`}
                          >
                            {isAvail ? 'Vacant' : 'In Session'}
                          </span>
                          <span className="room-next-time">
                            {isAvail ? 'Bookable' : `Next: ${room.nextFree}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Rules & Etiquette */}
      <section className="hub-guidelines">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Workplace Etiquette</span>
            <h2 className="section-title">Physical Room Booking Guidelines</h2>
            <p className="section-subtitle">
              Standards maintained by workplace facilities to ensure smooth collaboration across all teams.
            </p>
          </div>

          <div className="guidelines-grid">
            {GUIDELINES.map((g) => (
              <div className="guideline-card" key={g.title}>
                <div className="guideline-card__icon">
                  <g.icon size={22} />
                </div>
                <h3 className="guideline-card__title">{g.title}</h3>
                <p className="guideline-card__desc">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeHub;
