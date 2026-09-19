import React from 'react';
import {
  X,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Edit2,
  Clock,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

export default function DepartmentInspectorDrawer({
  department,
  onClose,
  onEdit,
  onToggleStatus,
  onViewEmployees,
}) {
  if (!department) return null;

  const isActive = department.status === 'ACTIVE';

  return (
    <div className="inspector-drawer-overlay" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-drawer__header">
          <div className="inspector-drawer__badge">
            <Building2 size={16} />
            <span>Department Unit</span>
          </div>
          <button
            type="button"
            className="inspector-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="inspector-drawer__body">
          <div className="inspector-hero">
            <div className="inspector-hero__avatar inspector-hero__avatar--department">
              <Building2 size={22} />
            </div>
            <div className="inspector-hero__info">
              <h2>{department.name}</h2>
              <span className="inspector-hero__code">
                Dept ID: #{department.id}
                {department.companyName ? ` • ${department.companyName}` : ''}
              </span>
            </div>
          </div>

          <div className="inspector-status-badge-row">
            <span
              className={`status-badge ${
                isActive ? 'status-badge--active' : 'status-badge--inactive'
              }`}
            >
              <span className="status-badge__dot" />
              {isActive ? 'Active Department' : 'Inactive Department'}
            </span>
            <span className="capacity-badge">
              <Users size={14} /> {department.employeeCount || 0} Staff
            </span>
          </div>

          <div className="inspector-quick-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                if (onClose) onClose();
                if (onEdit) onEdit(department);
              }}
            >
              <Edit2 size={14} /> Edit Dept
            </button>
            <button
              type="button"
              className={`btn btn--sm ${isActive ? 'btn--danger' : 'btn--success'}`}
              onClick={() => onToggleStatus && onToggleStatus(department.id)}
            >
              {isActive ? (
                <>
                  <XCircle size={14} /> Deactivate
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Activate
                </>
              )}
            </button>
            {onViewEmployees && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  if (onClose) onClose();
                  onViewEmployees(department.id);
                }}
              >
                <Users size={14} /> View Staff
              </button>
            )}
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">Department Details</h4>
            <div className="inspector-meta-list">
              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Hash size={14} /> Department Code
                </span>
                <span className="meta-value">DEPT-{department.id}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Users size={14} /> Assigned Personnel
                </span>
                <span className="meta-value">
                  {department.employeeCount || 0} Staff Members
                </span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Building2 size={14} /> Parent Facility
                </span>
                <span className="meta-value">{department.companyName || 'Corporate Scope'}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Clock size={14} /> Created Date
                </span>
                <span className="meta-value">{formatDate(department.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
