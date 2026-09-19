import React from 'react';
import {
  X,
  Layers,
  DoorOpen,
  Building2,
  CheckCircle2,
  XCircle,
  Edit2,
  Hash,
  Clock,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

export default function FloorInspectorDrawer({
  floor,
  onClose,
  onEdit,
  onToggleStatus,
}) {
  if (!floor) return null;

  const isActive = floor.status === 'ACTIVE';

  return (
    <div className="inspector-drawer-overlay" onClick={onClose}>
      <div className="inspector-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-drawer__header">
          <div className="inspector-drawer__badge">
            <Layers size={16} />
            <span>Floor Specifications</span>
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
            <div className="inspector-hero__avatar inspector-hero__avatar--floor">
              <Layers size={22} />
            </div>
            <div className="inspector-hero__info">
              <h2>{floor.name}</h2>
              <span className="inspector-hero__code">
                {floor.floorNumber !== null && floor.floorNumber !== undefined
                  ? `Level #${floor.floorNumber}`
                  : 'Standard Level'}
                {floor.companyName ? ` • ${floor.companyName}` : ''}
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
              {isActive ? 'Active Floor' : 'Inactive Floor'}
            </span>
            <span className="capacity-badge">
              <DoorOpen size={14} /> {floor.roomCount || 0} {floor.roomCount === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>

          <div className="inspector-quick-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                if (onClose) onClose();
                if (onEdit) onEdit(floor);
              }}
            >
              <Edit2 size={14} /> Edit Floor
            </button>
            <button
              type="button"
              className={`btn btn--sm ${isActive ? 'btn--danger' : 'btn--success'}`}
              onClick={() => onToggleStatus && onToggleStatus(floor)}
            >
              {isActive ? (
                <>
                  <XCircle size={14} /> Deactivate Floor
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Activate Floor
                </>
              )}
            </button>
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">Floor Details</h4>
            <div className="inspector-meta-list">
              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Hash size={14} /> Floor Level
                </span>
                <span className="meta-value">
                  {floor.floorNumber !== null && floor.floorNumber !== undefined
                    ? `Level #${floor.floorNumber}`
                    : 'N/A'}
                </span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <DoorOpen size={14} /> Assigned Rooms
                </span>
                <span className="meta-value">
                  {floor.roomCount || 0} {floor.roomCount === 1 ? 'Room' : 'Rooms'}
                </span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Building2 size={14} /> Facility Scope
                </span>
                <span className="meta-value">{floor.companyName || 'Main Facility'}</span>
              </div>

              <div className="inspector-meta-item">
                <span className="meta-label">
                  <Clock size={14} /> Registered Date
                </span>
                <span className="meta-value">{formatDate(floor.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="inspector-section">
            <h4 className="inspector-section__title">Floor Description</h4>
            <p className="inspector-desc-box">
              {floor.description || 'Primary operational workspace and conference room level.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
