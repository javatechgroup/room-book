import React from 'react';
import { Mail, Phone, MapPin, ArrowRight, AlertCircle, Edit2 } from 'lucide-react';

export default function CompanyInspectorDrawer({
  company,
  admins = [],
  onClose,
  onEdit,
  onToggleStatus,
  onViewAdmins,
}) {
  if (!company) return null;

  const assignedAdmins = admins.filter((a) => a.companyId === company.id);

  return (
    <div className="sa-drawer-backdrop" onClick={onClose}>
      <div className="sa-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="sa-drawer__header">
          <div className="sa-drawer__title-group">
            <span className="code-pill">{company.companyCode}</span>
            <h2>{company.name}</h2>
          </div>
          <button
            type="button"
            className="sa-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>

        <div className="sa-drawer__body">
          {/* Status Banner */}
          <div className="drawer-status-banner">
            <span
              className={`status-pill ${
                company.status === 'ACTIVE'
                  ? 'status-pill--active'
                  : 'status-pill--inactive'
              }`}
            >
              {company.status}
            </span>
            <span className="drawer-date">Registered on {company.createdAt}</span>
          </div>

          {/* Quick Summary Cards */}
          <div className="drawer-stats-grid">
            <div className="drawer-stat-card">
              <span className="drawer-stat-label">Facility Admins</span>
              <span className="drawer-stat-value">{assignedAdmins.length}</span>
            </div>
            <div className="drawer-stat-card">
              <span className="drawer-stat-label">Departments</span>
              <span className="drawer-stat-value">{company.departmentsCount || 1}</span>
            </div>
            <div className="drawer-stat-card">
              <span className="drawer-stat-label">Rooms Monitored</span>
              <span className="drawer-stat-value">{company.roomsCount || 2}</span>
            </div>
          </div>

          {/* Company Metadata */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Tenant Metadata</h4>
            <div className="drawer-info-list">
              <div className="drawer-info-item">
                <span className="drawer-info-label">Corporate Email</span>
                <span className="drawer-info-val">
                  <Mail size={13} />
                  <a href={`mailto:${company.contactInformation}`}>
                    {company.contactInformation || 'Not configured'}
                  </a>
                </span>
              </div>
              {company.phone && (
                <div className="drawer-info-item">
                  <span className="drawer-info-label">Direct Phone</span>
                  <span className="drawer-info-val">
                    <Phone size={13} />
                    <a href={`tel:${company.phone}`}>{company.phone}</a>
                  </span>
                </div>
              )}
              <div className="drawer-info-item">
                <span className="drawer-info-label">Campus Address</span>
                <span className="drawer-info-val">
                  <MapPin size={13} />
                  <span>{company.address || 'Address not registered'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Facility Admins List */}
          <div className="drawer-section">
            <div className="drawer-section-header">
              <h4 className="drawer-section-title">Assigned Facility Administrators</h4>
              {onViewAdmins && (
                <button
                  type="button"
                  className="drawer-link-btn"
                  onClick={() => onViewAdmins(company.id)}
                >
                  Manage Admins <ArrowRight size={13} />
                </button>
              )}
            </div>

            <div className="drawer-admin-list">
              {assignedAdmins.length === 0 ? (
                <div className="drawer-empty-notice">
                  <AlertCircle size={15} />
                  <span>No administrator assigned to this tenant yet.</span>
                </div>
              ) : (
                assignedAdmins.map((adm) => (
                  <div key={adm.id} className="drawer-admin-card">
                    <div className="admin-avatar">
                      {adm.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="drawer-admin-details">
                      <span className="drawer-admin-name">{adm.fullName}</span>
                      <span className="drawer-admin-email">{adm.email}</span>
                    </div>
                    <span
                      className={`status-pill ${
                        adm.status === 'ACTIVE'
                          ? 'status-pill--active'
                          : 'status-pill--inactive'
                      }`}
                    >
                      {adm.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="sa-drawer__footer">
          {onEdit && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onEdit(company)}
            >
              <Edit2 size={14} />
              <span>Edit Company</span>
            </button>
          )}
          {onToggleStatus && (
            <button
              type="button"
              className={`btn btn--sm ${
                company.status === 'ACTIVE' ? 'btn--deactivate' : 'btn--primary'
              }`}
              onClick={() => onToggleStatus(company.id)}
            >
              {company.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
