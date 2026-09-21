import React, { useState } from 'react';
import { X, User, Mail, Lock, Building2, Shield, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import Select from '../../common/Select/Select';

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
          <div>
            <h3>{isEdit ? 'Edit Employee Profile' : 'Register New Employee'}</h3>
            <p>{isEdit ? 'Modify corporate profile, department, or administrative access level' : 'Create workplace account and grant room reservation credentials'}</p>
          </div>
          <button type="button" className="superadmin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="superadmin-alert superadmin-alert--error" style={{ margin: '1rem 1.5rem 0' }}>
            <XCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="superadmin-modal-form">
          <div className="form-row form-row--2col">
            <div className="form-group">
              <label htmlFor="emp-name">Full Name *</label>
              <div className="input-wrap">
                <User size={16} className="input-icon" />
                <input
                  id="emp-name"
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={form.fullName}
                  onChange={(e) => onChange({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="emp-email">Corporate Email *</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  id="emp-email"
                  type="email"
                  placeholder="e.g. sarah.c@cyberdyne.com"
                  value={form.email}
                  onChange={(e) => onChange({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row form-row--2col">
            <Select
              id="emp-dept"
              label="Department *"
              icon={<Building2 size={16} />}
              value={form.departmentId}
              onChange={(val) => onChange({ ...form, departmentId: Number(val) })}
              options={departments.map((dept) => ({ value: dept.id, label: dept.name }))}
              placeholder="Select Department"
              required
            />

            <Select
              id="emp-role"
              label="Access Role"
              icon={<Shield size={16} />}
              value={form.role}
              onChange={(val) => onChange({ ...form, role: val })}
              placeholder={null}
              options={[
                { value: 'EMPLOYEE', label: 'Employee (Meeting Booker)' },
                { value: 'COMPANY_ADMIN', label: 'Facility Admin (Co-Admin)' },
              ]}
            />
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
