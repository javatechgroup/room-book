import React from 'react';
import { X, Layers, Hash, AlignLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function FloorModal({
  isOpen,
  onClose,
  editingFloor,
  form,
  onChange,
  onSubmit,
  error = '',
}) {
  if (!isOpen) return null;

  const isEdit = Boolean(editingFloor);

  return (
    <div className="superadmin-modal-overlay" onClick={onClose}>
      <div className="superadmin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="superadmin-modal-header">
          <div className="superadmin-modal-header__icon">
            <Layers size={20} />
          </div>
          <div className="superadmin-modal-header__text">
            <h3>{isEdit ? 'Update Floor' : 'Create New Floor'}</h3>
            <p>{isEdit ? `Edit details for ${editingFloor.name}` : 'Configure an office floor or building level for your workplace'}</p>
          </div>
          <button type="button" className="superadmin-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="superadmin-modal-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="superadmin-modal-form">
          <div className="form-group">
            <label htmlFor="floor-name">Floor Name *</label>
            <div className="input-wrap">
              <Layers size={16} className="input-icon" />
              <input
                id="floor-name"
                type="text"
                placeholder="e.g., Ground Floor, Floor 1, Executive Suite L3"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="floor-number">Floor Number / Level</label>
            <div className="input-wrap">
              <Hash size={16} className="input-icon" />
              <input
                id="floor-number"
                type="number"
                placeholder="e.g., 0 for Ground, 1 for 1st, -1 for Basement"
                value={form.floorNumber !== undefined && form.floorNumber !== null ? form.floorNumber : ''}
                onChange={(e) =>
                  onChange({
                    ...form,
                    floorNumber: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="floor-desc">Description / Wing Details</label>
            <div className="input-wrap">
              <AlignLeft size={16} className="input-icon" />
              <input
                id="floor-desc"
                type="text"
                placeholder="e.g., Cafeteria & Client Reception, Engineering Pods"
                value={form.description || ''}
                onChange={(e) => onChange({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Floor Status</label>
            <div className="status-radio-group">
              <label className={`status-radio-card ${form.status === 'ACTIVE' ? 'status-radio-card--active-green' : ''}`}>
                <input
                  type="radio"
                  name="floor-status"
                  value="ACTIVE"
                  checked={form.status === 'ACTIVE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <CheckCircle2 size={16} />
                <div>
                  <strong>Active</strong>
                  <span>Rooms can be assigned & booked</span>
                </div>
              </label>

              <label className={`status-radio-card ${form.status === 'INACTIVE' ? 'status-radio-card--active-amber' : ''}`}>
                <input
                  type="radio"
                  name="floor-status"
                  value="INACTIVE"
                  checked={form.status === 'INACTIVE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <XCircle size={16} />
                <div>
                  <strong>Inactive</strong>
                  <span>Floor under renovation or closed</span>
                </div>
              </label>
            </div>
          </div>

          <div className="superadmin-modal-actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isEdit ? 'Save Changes' : 'Create Floor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}