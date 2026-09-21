import React from 'react';
import {
  CalendarCheck2,
  BookmarkCheck,
  Settings,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function WorkplaceTabs({
  activeTab,
  onTabChange,
  bookingsCount = 0,
  isAdmin = false,
}) {

  return (
    <div className="workplace-top-section">
      <div className="portal-title-block">
        <h2 className="portal-main-heading">Physical Room & Slot Manager</h2>
      </div>

      <div className="superadmin-tabs-bar">
        <nav className="superadmin-tabs" aria-label="Workplace Navigation">
          <button
            type="button"
            className={`superadmin-tab ${activeTab === 'slot-finder' ? 'superadmin-tab--active' : ''}`}
            onClick={() => onTabChange('slot-finder')}
          >
            <CalendarCheck2 size={16} />
            <span>Book a Slot</span>
          </button>

          <button
            type="button"
            className={`superadmin-tab ${activeTab === 'directory' ? 'superadmin-tab--active' : ''}`}
            onClick={() => onTabChange('directory')}
          >
            <Layers size={16} />
            <span>Campus Directory</span>
          </button>

          <button
            type="button"
            className={`superadmin-tab ${activeTab === 'my-bookings' ? 'superadmin-tab--active' : ''}`}
            onClick={() => onTabChange('my-bookings')}
          >
            <BookmarkCheck size={16} />
            <span>My Scheduled Slots</span>
            {bookingsCount > 0 && <span className="tab-count-badge">{bookingsCount}</span>}
          </button>

          {isAdmin && (
            <button
              type="button"
              className={`superadmin-tab nav-tab--admin ${activeTab === 'admin-console' ? 'superadmin-tab--active' : ''}`}
              onClick={() => onTabChange('admin-console')}
            >
              <Settings size={16} />
              <span>Facility Admin</span>
            </button>
          )}

          <button
            type="button"
            className={`superadmin-tab ${activeTab === 'helpdesk' ? 'superadmin-tab--active' : ''}`}
            onClick={() => onTabChange('helpdesk')}
          >
            <HelpCircle size={16} />
            <span>Facility Helpdesk</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
