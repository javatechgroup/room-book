import React from 'react';
import { DoorOpen, Building2, Users, CalendarCheck2, CheckCircle2, Wrench } from 'lucide-react';

export default function FacilityAdminMetrics({
  totalRooms = 0,
  availableRooms = 0,
  maintenanceRooms = 0,
  totalDepartments = 0,
  totalEmployees = 0,
  todayBookings = 0,
  activeTab = 'rooms',
  onSelectMetric,
}) {
  const availablePercentage =
    totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0;

  return (
    <div className="superadmin-metrics-grid facility-admin-metrics-grid">
      {/* Metric 1: Physical Meeting Rooms */}
      <div
        className="metric-card"
        onClick={() => onSelectMetric && onSelectMetric('rooms')}
        style={{ cursor: 'pointer' }}
      >
        <div className="metric-card__icon metric-card__icon--blue">
          <DoorOpen size={26} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Office Meeting Spaces</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{totalRooms}</span>
            <span className="metric-card__badge-pill">
              {availableRooms} Available
            </span>
          </div>
          <span className="metric-card__sub">
            <strong>{availablePercentage}%</strong> ready • {maintenanceRooms} in maintenance
          </span>
        </div>
      </div>

      {/* Metric 2: Departments & Units */}
      <div
        className="metric-card"
        onClick={() => onSelectMetric && onSelectMetric('departments')}
        style={{ cursor: 'pointer' }}
      >
        <div className="metric-card__icon metric-card__icon--purple">
          <Building2 size={26} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Company Departments</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{totalDepartments}</span>
            <span className="metric-card__badge-pill metric-card__badge-pill--purple">
              {totalEmployees} Staff
            </span>
          </div>
          <span className="metric-card__sub">
            Functional divisions across all floors
          </span>
        </div>
      </div>

      {/* Metric 3: Active Employees */}
      <div
        className="metric-card"
        onClick={() => onSelectMetric && onSelectMetric('employees')}
        style={{ cursor: 'pointer' }}
      >
        <div className="metric-card__icon metric-card__icon--indigo">
          <Users size={26} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Registered Personnel</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{totalEmployees}</span>
            <span className="metric-card__badge-pill">Active Staff</span>
          </div>
          <span className="metric-card__sub">
            Onboarded across <strong>{totalDepartments}</strong> departments
          </span>
        </div>
      </div>

      {/* Metric 4: Today's Reservations */}
      <div
        className="metric-card"
        onClick={() => onSelectMetric && onSelectMetric('monitor')}
        style={{ cursor: 'pointer' }}
      >
        <div className="metric-card__icon metric-card__icon--emerald">
          <CalendarCheck2 size={26} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Today's Room Bookings</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{todayBookings}</span>
            <span className="metric-card__badge-pill">Scheduled</span>
          </div>
          <span className="metric-card__sub">
            Active reservations scheduled today
          </span>
        </div>
      </div>
    </div>
  );
}
