import React from 'react';
import {
  Mail,
  Building2,
  Clock,
  Shield,
  ArrowRight,
  AlertCircle,
  Edit2,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

export default function AdminInspectorDrawer({
  admin,
  companies = [],
  onClose,
  onEdit,
  onToggleStatus,
  onViewCompany,
}) {
  if (!admin) return null;

  const assignedCompany = companies.find(
    (c) => c.id === admin.companyId || c.name === admin.companyName
  );

  return (
    <div className="sa-drawer-backdrop" onClick={onClose}>
      <div className="sa-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header with Integrated Status */}
        <div className="sa-drawer__header">
          <div className="sa-drawer__title-group">
            <span className="code-pill">User #{admin.id}</span>
            <h2>{admin.fullName}</h2>
            <span
              className={`status-pill ${
                admin.status === 'ACTIVE'
                  ? 'status-pill--active'
                  : 'status-pill--inactive'
              }`}
            >
              {admin.status}
            </span>
          </div>
          <button
            type="button"
            className="sa-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
            title="Close (Esc)"
          >
            &times;
          </button>
        </div>

        <div className="sa-drawer__body">
          {/* Quick Summary Metric Strip */}
          <div className="drawer-stats-grid">
            <div className="drawer-stat-card">
              <span className="drawer-stat-label">Assigned Tenant</span>
              <span className="drawer-stat-value">
                {assignedCompany?.companyCode || 'N/A'}
              </span>
            </div>
            <div className="drawer-stat-card">
              <span className="drawer-stat-label">Role Scope</span>
              <span className="drawer-stat-value" style={{ fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
                COMPANY_ADMIN
              </span>
            </div>
            <div className="drawer-stat-card">
              <span className="drawer-stat-label">Last Active</span>
              <span className="drawer-stat-value" style={{ fontSize: '0.88rem' }}>
                {admin.lastLogin || 'Recent'}
              </span>
            </div>
          </div>

          {/* Administrator Profile (Compact 2-Column Grid) */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Administrator Profile</h4>
            <div className="drawer-info-grid">
              <div className="drawer-info-item">
                <span className="drawer-info-label">Corporate Email</span>
                <span className="drawer-info-val">
                  <Mail size={13} />
                  <a href={`mailto:${admin.email}`} title={admin.email}>
                    {admin.email}
                  </a>
                </span>
              </div>
              <div className="drawer-info-item">
                <span className="drawer-info-label">Account ID</span>
                <span className="drawer-info-val">
                  <Shield size={13} />
                  <span>User #{admin.id}</span>
                </span>
              </div>
              <div className="drawer-info-item">
                <span className="drawer-info-label">Registered Date</span>
                <span className="drawer-info-val">
                  <Calendar size={13} />
                  <span>{admin.createdAt ? formatDate(admin.createdAt) : 'Recently'}</span>
                </span>
              </div>
              <div className="drawer-info-item">
                <span className="drawer-info-label">Account Status</span>
                <span className="drawer-info-val">
                  <Clock size={13} />
                  <span>{admin.status === 'ACTIVE' ? 'Active Access' : 'Suspended'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Tenant Organization */}
          <div className="drawer-section">
            <div className="drawer-section-header">
              <h4 className="drawer-section-title">Assigned Tenant Scope</h4>
              {onViewCompany && assignedCompany && (
                <button
                  type="button"
                  className="drawer-link-btn"
                  onClick={() => onViewCompany(assignedCompany.id)}
                >
                  View Company <ArrowRight size={13} />
                </button>
              )}
            </div>

            {assignedCompany ? (
              <div
                className="drawer-admin-card"
                style={{ cursor: onViewCompany ? 'pointer' : 'default' }}
                onClick={() => onViewCompany && onViewCompany(assignedCompany.id)}
              >
                <div className="admin-avatar" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' }}>
                  <Building2 size={16} />
                </div>
                <div className="drawer-admin-details">
                  <span className="drawer-admin-name">{assignedCompany.name}</span>
                  <span className="drawer-admin-email">{assignedCompany.contactInformation || assignedCompany.companyCode}</span>
                </div>
                <span className="code-pill">{assignedCompany.companyCode}</span>
              </div>
            ) : (
              <div className="drawer-empty-notice">
                <AlertCircle size={15} />
                <span>{admin.companyName || 'No tenant organization attached.'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="sa-drawer__footer">
          {onEdit && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onEdit(admin)}
            >
              <Edit2 size={14} />
              <span>Edit Admin</span>
            </button>
          )}
          {onToggleStatus && (
            <button
              type="button"
              className={`btn btn--sm ${
                admin.status === 'ACTIVE' ? 'btn--deactivate' : 'btn--primary'
              }`}
              onClick={() => onToggleStatus(admin.id)}
            >
              {admin.status === 'ACTIVE' ? (
                <>
                  <XCircle size={14} />
                  <span>Suspend Admin</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Activate Admin</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

