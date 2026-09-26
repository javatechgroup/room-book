import React, { useState } from 'react';
import {
  Users,
  Building,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  FileText,
  Clock,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './RoleMatrix.css';

export default function RoleMatrix() {
  const [activeRole, setActiveRole] = useState('employee');
  const { openLogin, openConnect } = useAuth();

  return (
    <section className="role-matrix" id="role-portals">
      <div className="container">
        {/* Section Header */}
        <div className="role-matrix__header">
          <span className="section-tag section-tag--primary">
            <Users size={14} /> Multi-Role Architecture
          </span>
          <h2 className="role-matrix__title">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="role-matrix__subtitle">
            Whether booking a fast 30-minute team sync, monitoring campus floor utilization,
            or governing multi-tenant enterprise access — MeetSpace provides dedicated portals for every role.
          </p>
        </div>

        {/* Role Tabs Switcher */}
        <div className="role-matrix__tabs">
          <button
            type="button"
            className={`role-tab-btn ${activeRole === 'employee' ? 'role-tab-btn--active' : ''}`}
            onClick={() => setActiveRole('employee')}
          >
            <Users size={18} />
            <div className="role-tab-btn__text">
              <strong>Employee Portal</strong>
              <span>Fast Bookings & Suggestions</span>
            </div>
          </button>

          <button
            type="button"
            className={`role-tab-btn ${activeRole === 'facility' ? 'role-tab-btn--active' : ''}`}
            onClick={() => setActiveRole('facility')}
          >
            <Building size={18} />
            <div className="role-tab-btn__text">
              <strong>Facility Admin Portal</strong>
              <span>Floors, Rooms & Occupancy</span>
            </div>
          </button>

          <button
            type="button"
            className={`role-tab-btn ${activeRole === 'superadmin' ? 'role-tab-btn--active' : ''}`}
            onClick={() => setActiveRole('superadmin')}
          >
            <ShieldCheck size={18} />
            <div className="role-tab-btn__text">
              <strong>Super Admin Portal</strong>
              <span>Tenants, Security & Audits</span>
            </div>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="role-matrix__content">
          {/* Role 1: Employee */}
          {activeRole === 'employee' && (
            <div className="role-panel animate-fadeIn">
              <div className="role-panel__details">
                <div className="role-badge role-badge--blue">Staff & Meeting Hosts</div>
                <h3>Effortless 10-Second Reservations</h3>
                <p>
                  Built for zero-friction scheduling. Check real-time room availability across all campus floors,
                  reserve instantly with your corporate login, and invite colleagues seamlessly.
                </p>

                <div className="role-feature-list">
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Real-time Slot Finder:</strong> Search by floor, capacity, and amenities.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Smart Conflict Routing:</strong> Auto-suggests the room's next opening or parallel free rooms.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Colleague Invites:</strong> Select team members from your company directory.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Self-Service Management:</strong> Easily reschedule or release slots to free rooms.</span>
                  </div>
                </div>

                <div className="role-panel__cta">
                  <button type="button" className="btn btn--primary" onClick={openLogin}>
                    Sign In as Employee <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="role-panel__preview">
                <div className="preview-card">
                  <div className="preview-card__header">
                    <span className="window-dots"><span /><span /><span /></span>
                    <span className="preview-card__title">Workplace Portal • Slot Finder</span>
                  </div>
                  <div className="preview-card__body">
                    <div className="preview-room-item">
                      <div className="preview-room-title">
                        <strong>Focus Pod 201</strong>
                        <span className="preview-tag preview-tag--green">Available</span>
                      </div>
                      <span className="preview-meta">Floor 2 • 4 Seats • 4K Screen, Whiteboard</span>
                      <div className="preview-slot-row">
                        <span className="slot-chip slot-chip--active">10:00 AM – 11:00 AM</span>
                        <span className="slot-chip">11:00 AM – 12:00 PM</span>
                        <span className="slot-chip slot-chip--booked">12:00 PM – 1:00 PM</span>
                      </div>
                    </div>

                    <div className="preview-room-item">
                      <div className="preview-room-title">
                        <strong>Boardroom 401</strong>
                        <span className="preview-tag preview-tag--amber">Occupied</span>
                      </div>
                      <span className="preview-meta">Floor 4 • 16 Seats • Video Conference</span>
                      <div className="preview-smart-note">
                        <Sparkles size={13} /> Next open slot: <strong>1:30 PM Today</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role 2: Facility Admin */}
          {activeRole === 'facility' && (
            <div className="role-panel animate-fadeIn">
              <div className="role-panel__details">
                <div className="role-badge role-badge--amber">Office & Facility Managers</div>
                <h3>Complete Physical Floor & Room Control</h3>
                <p>
                  Empowers facility administrators to organize floor wings, manage room maintenance states,
                  monitor real-time company occupancy timelines, and configure booking policy rules.
                </p>

                <div className="role-feature-list">
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Live Occupancy Timeline:</strong> Visual timeline of all company rooms across any date.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Floor & Room Configuration:</strong> Configure wings, seat capacities, and hardware amenities.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>One-Click Maintenance Mode:</strong> Instantly take rooms offline for cleaning or repairs.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Custom Booking Policies:</strong> Set company advance windows, max durations, and cutoff rules.</span>
                  </div>
                </div>

                <div className="role-panel__cta">
                  <button type="button" className="btn btn--primary" onClick={openLogin}>
                    Sign In as Facility Admin <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="role-panel__preview">
                <div className="preview-card">
                  <div className="preview-card__header">
                    <span className="window-dots"><span /><span /><span /></span>
                    <span className="preview-card__title">Facility Admin • Live Occupancy Heatmap</span>
                  </div>
                  <div className="preview-card__body">
                    <div className="preview-timeline-row">
                      <div className="preview-timeline-label">
                        <strong>Floor 1</strong>
                        <span>3 Rooms</span>
                      </div>
                      <div className="preview-timeline-bar">
                        <span className="time-block time-block--busy" style={{ width: '40%' }}>Occupied (68%)</span>
                        <span className="time-block time-block--free" style={{ width: '60%' }}>Free</span>
                      </div>
                    </div>

                    <div className="preview-timeline-row">
                      <div className="preview-timeline-label">
                        <strong>Floor 2</strong>
                        <span>4 Rooms</span>
                      </div>
                      <div className="preview-timeline-bar">
                        <span className="time-block time-block--busy" style={{ width: '55%' }}>Occupied (55%)</span>
                        <span className="time-block time-block--free" style={{ width: '45%' }}>Free</span>
                      </div>
                    </div>

                    <div className="preview-timeline-row">
                      <div className="preview-timeline-label">
                        <strong>Floor 3</strong>
                        <span>Maintenance</span>
                      </div>
                      <div className="preview-timeline-bar">
                        <span className="time-block time-block--maint" style={{ width: '100%' }}>Maintenance Lock Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role 3: Super Admin */}
          {activeRole === 'superadmin' && (
            <div className="role-panel animate-fadeIn">
              <div className="role-panel__details">
                <div className="role-badge role-badge--purple">Platform IT & Multi-Tenant Operations</div>
                <h3>Enterprise Multi-Tenant Security & Auditing</h3>
                <p>
                  Global platform administration supporting multi-tenant isolation, company provisioning,
                  strict role-based security, and complete auditable activity trails.
                </p>

                <div className="role-feature-list">
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Tenant Lifecycle Management:</strong> Provision, activate, and manage company tenants.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Enterprise Audit Logs:</strong> Full actor, entity, timestamp, and context tracking for all changes.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>Stateless Token Security:</strong> Spring Security 6 + JJWT stateless authentication.</span>
                  </div>
                  <div className="role-feature-item">
                    <CheckCircle2 size={16} />
                    <span><strong>High-Throughput Concurrency:</strong> Java 21 Virtual Threads (Loom) for enterprise scaling.</span>
                  </div>
                </div>

                <div className="role-panel__cta">
                  <button type="button" className="btn btn--outline" onClick={openConnect}>
                    Request Enterprise Setup <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="role-panel__preview">
                <div className="preview-card">
                  <div className="preview-card__header">
                    <span className="window-dots"><span /><span /><span /></span>
                    <span className="preview-card__title">Super Admin • Audit Log Stream</span>
                  </div>
                  <div className="preview-card__body">
                    <div className="preview-audit-item">
                      <div className="audit-dot audit-dot--green" />
                      <div>
                        <strong>POLICY_UPDATE</strong>
                        <span>Company #1: maxAdvanceDays updated to 30d</span>
                        <div className="audit-time">Just now • admin@system.com</div>
                      </div>
                    </div>

                    <div className="preview-audit-item">
                      <div className="audit-dot audit-dot--blue" />
                      <div>
                        <strong>ROOM_MAINTENANCE_TOGGLE</strong>
                        <span>Focus Pod 301 set to ACTIVE</span>
                        <div className="audit-time">12 mins ago • facility@company.com</div>
                      </div>
                    </div>

                    <div className="preview-audit-item">
                      <div className="audit-dot audit-dot--purple" />
                      <div>
                        <strong>TENANT_PROVISIONED</strong>
                        <span>Acme Corp tenant initialized</span>
                        <div className="audit-time">1 hour ago • superadmin@system.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
