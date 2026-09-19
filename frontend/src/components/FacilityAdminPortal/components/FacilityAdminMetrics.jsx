import React from 'react';
import { DoorOpen, Layers, Building2, Users, CalendarCheck2, CheckCircle2, Wrench } from 'lucide-react';

export default function FacilityAdminMetrics({
  totalRooms = 0,
  availableRooms = 0,
  maintenanceRooms = 0,
  totalFloors = 0,
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
        className={`metric-card ${activeTab === 'rooms' ? 'metric-card--active' : ''}`}
        onClick={() => onSelectMetric && onSelectMetric('rooms')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric && onSelectMetric('rooms');
          }
        }}
      >
        <div className="metric-card__icon metric-card__icon--blue">
          <DoorOpen size={22} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Meeting Spaces</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{totalRooms}</span>
            <span className="metric-card__badge-pill">
              {availableRooms} Available
            </span>
          </div>
          <span className="metric-card__sub">
            <strong>{availablePercentage}%</strong> ready • {maintenanceRooms} maint.
          </span>
        </div>
      </div>

      {/* Metric: Building Floors */}
      <div
        className={`metric-card ${activeTab === 'floors' ? 'metric-card--active' : ''}`}
        onClick={() => onSelectMetric && onSelectMetric('floors')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric && onSelectMetric('floors');
          }
        }}
      >
        <div className="metric-card__icon metric-card__icon--cyan">
          <Layers size={22} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Floors</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{totalFloors}</span>
            <span className="metric-card__badge-pill">Levels</span>
          </div>
          <span className="metric-card__sub">
            Workspace levels
          </span>
        </div>
      </div>

      {/* Metric 2: Departments & Units */}
      <div
        className={`metric-card ${activeTab === 'departments' ? 'metric-card--active' : ''}`}
        onClick={() => onSelectMetric && onSelectMetric('departments')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric && onSelectMetric('departments');
          }
        }}
      >
        <div className="metric-card__icon metric-card__icon--purple">
          <Building2 size={22} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Departments</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{totalDepartments}</span>
            <span className="metric-card__badge-pill metric-card__badge-pill--purple">
              {totalEmployees} Staff
            </span>
          </div>
          <span className="metric-card__sub">
            Functional divisions
          </span>
        </div>
      </div>

      {/* Metric 3: Active Employees */}
      <div
        className={`metric-card ${activeTab === 'employees' ? 'metric-card--active' : ''}`}
        onClick={() => onSelectMetric && onSelectMetric('employees')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric && onSelectMetric('employees');
          }
        }}
      >
        <div className="metric-card__icon metric-card__icon--indigo">
          <Users size={22} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Personnel</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{totalEmployees}</span>
            <span className="metric-card__badge-pill">Active</span>
          </div>
          <span className="metric-card__sub">
            Across {totalDepartments} departments
          </span>
        </div>
      </div>

      {/* Metric 4: Today's Reservations */}
      <div
        className={`metric-card ${activeTab === 'monitor' ? 'metric-card--active' : ''}`}
        onClick={() => onSelectMetric && onSelectMetric('monitor')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric && onSelectMetric('monitor');
          }
        }}
      >
        <div className="metric-card__icon metric-card__icon--emerald">
          <CalendarCheck2 size={22} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Reservations</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{todayBookings}</span>
            <span className="metric-card__badge-pill">Today</span>
          </div>
          <span className="metric-card__sub">
            Active bookings today
          </span>
        </div>
      </div>
    </div>
  );
}
