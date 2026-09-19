import React, { useRef, useEffect } from 'react';
import { Building2, Users, FileText, Plus } from 'lucide-react';

export default function SuperAdminTabs({
  activeTab = 'companies',
  onTabChange,
  companiesCount = 0,
  adminsCount = 0,
  auditLogsCount = 0,
  onOpenCreateCompany,
  onOpenCreateAdmin,
}) {
  const tabsRef = useRef(null);

  useEffect(() => {
    if (tabsRef.current) {
      const activeBtn = tabsRef.current.querySelector('.superadmin-tab--active');
      if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTab]);

  return (
    <div className="superadmin-tabs-bar" ref={tabsRef}>
      <div className="superadmin-tabs">
        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'companies' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('companies')}
        >
          <Building2 size={16} />
          <span>Tenant Companies</span>
          <span className="tab-count-badge">{companiesCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'admins' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('admins')}
        >
          <Users size={16} />
          <span>Facility Administrators</span>
          <span className="tab-count-badge">{adminsCount}</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab ${activeTab === 'audit' ? 'superadmin-tab--active' : ''}`}
          onClick={() => onTabChange && onTabChange('audit')}
        >
          <FileText size={16} />
          <span>System Audit Logs</span>
          <span className="tab-count-badge">{auditLogsCount}</span>
        </button>
      </div>

      <div className="superadmin-quick-actions">
        {activeTab === 'companies' && onOpenCreateCompany && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenCreateCompany}
          >
            <Plus size={15} />
            <span>Register Company</span>
          </button>
        )}
        {activeTab === 'admins' && onOpenCreateAdmin && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenCreateAdmin}
          >
            <Plus size={15} />
            <span>Create Facility Admin</span>
          </button>
        )}
      </div>
    </div>
  );
}
