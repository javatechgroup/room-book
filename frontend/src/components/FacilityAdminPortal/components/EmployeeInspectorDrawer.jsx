import React from 'react';
import {
  X,
  User,
  Mail,
  Building2,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  CalendarCheck2,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

export default function EmployeeInspectorDrawer({
  employee,
  onClose,
  onEdit,
  onToggleStatus,
}) {
  if (!employee) return null;

  const isActive = employee.status === 'ACTIVE';

  return (
    <div className="inspector-drawer-overlay" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-drawer__header">
          <div className="inspector-drawer__badge">
            <User size={16} />
            <span>Staff Profile</span>
          </div>
          <button type="button" className="inspector-drawer__close" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="inspector-drawer__body">
          <div className="inspector-hero">
            <div className="inspector-hero__avatar inspector-hero__avatar--user">
              <User size={30} />
            </div>
            <div className="inspector-hero__info">
              <h2>{employee.fullName}</h2>
              <span className="inspector-hero__code">{employee.email}</span>
            </div>
          </div>

          <div className="inspector-status-badge-row">
            <span className={`status-badge ${isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
              <span className="status-badge__dot" />
              {isActive ? 'Active Staff' : 'Suspended'}
            </span>
            <span className="capacity-badge">
              <Shield size={14} /> {employee.role === 'COMPANY_ADMIN' ? 'Facility Admin' : 'Employee'}
            </span>
          </div>

          <div className="inspector-quick-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                if (onClose) onClose();
                if (onEdit) onEdit(employee);
              }}
            >
              <Edit2 size={14} /> Edit Profile
            </button>
            <button
              type="button"
              className={`btn btn--sm ${isActive ? 'btn--danger' : 'btn--success'}`}
              onClick={() => onToggleStatus(employee.id)}
            >
              {isActive ? (
                <>
                  <XCircle size={14} /> Suspend Account
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Activate Account
                </>
              )}
            </button>
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">Employment Details</h4>
            <div className="inspector-meta-list">
              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Building2 size={14} /> Department
                </span>
                <span className="meta-value">{employee.departmentName || 'General Staff'}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Mail size={14} /> Email
                </span>
                <span className="meta-value">{employee.email}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Shield size={14} /> Access Role
                </span>
                <span className="meta-value">{employee.role}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Clock size={14} /> Onboarded Date
                </span>
                <span className="meta-value">{formatDate(employee.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
