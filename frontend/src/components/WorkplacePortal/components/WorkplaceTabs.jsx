import React, { useRef, useEffect } from 'react';
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
  const tabsRef = useRef(null);

  useEffect(() => {
    if (tabsRef.current) {
      const activeBtn = tabsRef.current.querySelector('.nav-tab--active');
      if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTab]);

  return (
    <div className="portal-top-bar">
      <div className="portal-title-block">
        <span className="section-tag">Workplace Portal</span>
        <h2 className="portal-main-heading">Physical Room & Slot Manager</h2>
      </div>

      {/* Tab Navigation */}
      <nav className="portal-nav-tabs" ref={tabsRef} aria-label="Portal Navigation">
        <button
          type="button"
          className={`nav-tab ${activeTab === 'slot-finder' ? 'nav-tab--active' : ''}`}
          onClick={() => onTabChange('slot-finder')}
        >
          <CalendarCheck2 size={16} />
          <span>Book a Slot</span>
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === 'directory' ? 'nav-tab--active' : ''}`}
          onClick={() => onTabChange('directory')}
        >
          <Layers size={16} />
          <span>Campus Directory</span>
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === 'my-bookings' ? 'nav-tab--active' : ''}`}
          onClick={() => onTabChange('my-bookings')}
        >
          <BookmarkCheck size={16} />
          <span>My Scheduled Slots</span>
          {bookingsCount > 0 && <span className="tab-count-badge">{bookingsCount}</span>}
        </button>

        {isAdmin && (
          <button
            type="button"
            className={`nav-tab nav-tab--admin ${activeTab === 'admin-console' ? 'nav-tab--active' : ''}`}
            onClick={() => onTabChange('admin-console')}
          >
            <Settings size={16} />
            <span>Facility Admin</span>
          </button>
        )}

        <button
          type="button"
          className={`nav-tab ${activeTab === 'helpdesk' ? 'nav-tab--active' : ''}`}
          onClick={() => onTabChange('helpdesk')}
        >
          <HelpCircle size={16} />
          <span>Facility Helpdesk</span>
        </button>
      </nav>
    </div>
  );
}
