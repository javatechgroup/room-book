import React, { useRef, useEffect } from 'react';
import { DoorOpen, Layers, Building2, Users, CalendarPlus, CalendarCheck2, Activity, BookOpen } from 'lucide-react';

export default function FacilityAdminTabs({
  activeTab = 'rooms',
  onTabChange,
  roomsCount = 0,
  floorsCount = 0,
  departmentsCount = 0,
  employeesCount = 0,
  bookingsCount = 0,
  myBookingsCount = 0,
}) {
  const tabsContainerRef = useRef(null);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeBtn = tabsContainerRef.current.querySelector('.superadmin-tab--active');
      if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTab]);

  return (
    <div className="superadmin-tabs-bar" ref={tabsContainerRef}>
      <div className="superadmin-tabs">
        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'rooms' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('rooms')}
          title="Room Management"
        >
          <DoorOpen size={15} />
          <span>Rooms</span>
          <span className="tab-count-badge">{roomsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'floors' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('floors')}
          title="Building Floors"
        >
          <Layers size={15} />
          <span>Floors</span>
          <span className="tab-count-badge">{floorsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'departments' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('departments')}
          title="Departments"
        >
          <Building2 size={15} />
          <span>Departments</span>
          <span className="tab-count-badge">{departmentsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'employees' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('employees')}
          title="Employees"
        >
          <Users size={15} />
          <span>Employees</span>
          <span className="tab-count-badge">{employeesCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'book-room' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('book-room')}
          title="Book a Room"
        >
          <CalendarPlus size={15} />
          <span>Book Room</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'my-bookings' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('my-bookings')}
          title="My Bookings"
        >
          <CalendarCheck2 size={15} />
          <span>My Bookings</span>
          <span className="tab-count-badge">{myBookingsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'monitor' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('monitor')}
          title="Live Room Monitor"
        >
          <Activity size={15} />
          <span>Live Monitor</span>
          <span className="tab-count-badge">{bookingsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'directory' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('directory')}
          title="Company Directory"
        >
          <BookOpen size={15} />
          <span>Directory</span>
        </button>
      </div>
    </div>
  );
}
