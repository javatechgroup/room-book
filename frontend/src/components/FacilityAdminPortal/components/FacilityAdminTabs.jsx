import React from 'react';
import { DoorOpen, Building2, Users, CalendarPlus, CalendarCheck2, Activity, BookOpen, Plus } from 'lucide-react';

export default function FacilityAdminTabs({
  activeTab = 'rooms',
  onTabChange,
  roomsCount = 0,
  departmentsCount = 0,
  employeesCount = 0,
  bookingsCount = 0,
  myBookingsCount = 0,
  onOpenCreateRoom,
  onOpenCreateDepartment,
  onOpenCreateEmployee,
  onOpenBookRoom,
}) {
  return (
    <div className="superadmin-tabs-bar">
      <div className="superadmin-tabs">
        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'rooms' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('rooms')}
        >
          <DoorOpen size={16} />
          <span>Room Management</span>
          <span className="tab-count-badge">{roomsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'departments' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('departments')}
        >
          <Building2 size={16} />
          <span>Departments</span>
          <span className="tab-count-badge">{departmentsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'employees' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('employees')}
        >
          <Users size={16} />
          <span>Employees</span>
          <span className="tab-count-badge">{employeesCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'book-room' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('book-room')}
        >
          <CalendarPlus size={16} />
          <span>Book a Room</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'my-bookings' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('my-bookings')}
        >
          <CalendarCheck2 size={16} />
          <span>My Bookings</span>
          <span className="tab-count-badge">{myBookingsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'monitor' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('monitor')}
        >
          <Activity size={16} />
          <span>Live Room Monitor</span>
          <span className="tab-count-badge">{bookingsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'directory' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('directory')}
        >
          <BookOpen size={16} />
          <span>Company Directory</span>
        </button>
      </div>

      <div className="superadmin-quick-actions">
        {activeTab === 'rooms' && onOpenCreateRoom && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenCreateRoom}
          >
            <Plus size={15} />
            <span>Create Room</span>
          </button>
        )}
        {activeTab === 'departments' && onOpenCreateDepartment && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenCreateDepartment}
          >
            <Plus size={15} />
            <span>Add Department</span>
          </button>
        )}
        {activeTab === 'employees' && onOpenCreateEmployee && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenCreateEmployee}
          >
            <Plus size={15} />
            <span>Add Employee</span>
          </button>
        )}
        {activeTab === 'book-room' && onOpenBookRoom && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenBookRoom}
          >
            <CalendarPlus size={15} />
            <span>Reserve Slot</span>
          </button>
        )}
      </div>
    </div>
  );
}
