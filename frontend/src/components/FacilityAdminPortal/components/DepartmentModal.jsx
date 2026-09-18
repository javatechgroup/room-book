import React from 'react';
import { X, Building2, CheckCircle2, XCircle } from 'lucide-react';

export default function DepartmentModal({
  isOpen,
  onClose,
  editingDepartment,
  form,
  onChange,
  onSubmit,
  error = '',
}) {
  if (!isOpen) return null;

  const isEdit = Boolean(editingDepartment);

  return (
    <div className="superadmin-modal-overlay" onClick={onClose}>
      <div className="superadmin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="superadmin-modal-header">
          <div className="superadmin-modal-header__icon">
            <Building2 size={20} />
          </div>
          <div className="superadmin-modal-header__text">
            <h3>{isEdit ? 'Update Department' : 'Create New Department'}</h3>
            <p>{isEdit ? `Edit details for ${editingDepartment.name}` : 'Add a functional department unit to your organization'}</p>
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
            <label htmlFor="dept-name">Department Name *</label>
            <div className="input-wrap">
              <Building2 size={16} className="input-icon" />
              <input
                id="dept-name"
                type="text"
                placeholder="e.g., Engineering, Marketing, Product Design"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label>Department Status</label>
            <div className="status-radio-group">
              <label className={`status-radio-card ${form.status === 'ACTIVE' ? 'status-radio-card--active-green' : ''}`}>
                <input
                  type="radio"
                  name="dept-status"
                  value="ACTIVE"
                  checked={form.status === 'ACTIVE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <CheckCircle2 size={16} />
                <div>
                  <strong>Active</strong>
                  <span>Employees can be assigned</span>
                </div>
              </label>

              <label className={`status-radio-card ${form.status === 'INACTIVE' ? 'status-radio-card--active-amber' : ''}`}>
                <input
                  type="radio"
                  name="dept-status"
                  value="INACTIVE"
                  checked={form.status === 'INACTIVE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <XCircle size={16} />
                <div>
                  <strong>Inactive</strong>
                  <span>Suspended department</span>
                </div>
              </label>
            </div>
          </div>

          <div className="superadmin-modal-actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isEdit ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
