import React, { useState } from 'react';
import { X, User, Mail, Lock, Building2, Shield, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

export default function EmployeeModal({
  isOpen,
  onClose,
  editingEmployee,
  form,
  onChange,
  onSubmit,
  departments = [],
  error = '',
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const isEdit = Boolean(editingEmployee);

  return (
    <div className="superadmin-modal-overlay" onClick={onClose}>
      <div className="superadmin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="superadmin-modal-header">
          <div className="superadmin-modal-header__icon">
            <User size={20} />
          </div>
          <div className="superadmin-modal-header__text">
            <h3>{isEdit ? 'Update Employee Profile' : 'Onboard New Employee'}</h3>
            <p>{isEdit ? `Edit details for ${editingEmployee.fullName}` : 'Assign an employee to a company department'}</p>
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
            <label htmlFor="emp-fullname">Full Name *</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="emp-fullname"
                type="text"
                placeholder="e.g., Jane Smith"
                value={form.fullName}
                onChange={(e) => onChange({ ...form, fullName: e.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emp-email">Corporate Email Address *</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="emp-email"
                type="email"
                placeholder="jane.smith@acme.com"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row form-row--2col">
            <div className="form-group">
              <label htmlFor="emp-dept">Department *</label>
              <div className="input-wrap">
                <Building2 size={16} className="input-icon" />
                <select
                  id="emp-dept"
                  value={form.departmentId}
                  onChange={(e) => onChange({ ...form, departmentId: Number(e.target.value) })}
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="emp-role">Access Role</label>
              <div className="input-wrap">
                <Shield size={16} className="input-icon" />
                <select
                  id="emp-role"
                  value={form.role}
                  onChange={(e) => onChange({ ...form, role: e.target.value })}
                >
                  <option value="EMPLOYEE">Employee (Meeting Booker)</option>
                  <option value="COMPANY_ADMIN">Facility Admin (Co-Admin)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emp-password">
              {isEdit ? 'New Password (Leave blank to keep current)' : 'Initial Password *'}
            </label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="emp-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                required={!isEdit}
                minLength={isEdit && !form.password ? undefined : 6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <div className="status-radio-group">
              <label className={`status-radio-card ${form.status === 'ACTIVE' ? 'status-radio-card--active-green' : ''}`}>
                <input
                  type="radio"
                  name="emp-status"
                  value="ACTIVE"
                  checked={form.status === 'ACTIVE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <CheckCircle2 size={16} />
                <div>
                  <strong>Active</strong>
                  <span>Full booking access</span>
                </div>
              </label>

              <label className={`status-radio-card ${form.status === 'INACTIVE' ? 'status-radio-card--active-amber' : ''}`}>
                <input
                  type="radio"
                  name="emp-status"
                  value="INACTIVE"
                  checked={form.status === 'INACTIVE'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                />
                <XCircle size={16} />
                <div>
                  <strong>Suspended</strong>
                  <span>Login disabled</span>
                </div>
              </label>
            </div>
          </div>

          <div className="superadmin-modal-actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isEdit ? 'Save Changes' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
