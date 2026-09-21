import React from 'react';
import { Users } from 'lucide-react';
import Select from '../../common/Select/Select';

export default function AdminModal({
  isOpen,
  editingAdmin,
  form,
  onChange,
  onClose,
  onSave,
  companies = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal__header">
          <div className="sa-modal__title-group">
            <Users size={20} className="modal-title-icon" />
            <h3>{editingAdmin ? 'Edit Facility Administrator' : 'Create Facility Administrator'}</h3>
          </div>
          <button
            type="button"
            className="sa-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSave} className="sa-modal__form">
          <div className="sa-form-group">
            <label htmlFor="sa-adm-name">Administrator Full Name *</label>
            <input
              id="sa-adm-name"
              type="text"
              placeholder="e.g. Bill Lumbergh"
              value={form.fullName}
              onChange={(e) => onChange({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className="sa-form-group">
            <label htmlFor="sa-adm-email">Corporate Email Address *</label>
            <input
              id="sa-adm-email"
              type="email"
              placeholder="e.g. blumbergh@initech.io"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              required
            />
          </div>

          {!editingAdmin && (
            <div className="sa-form-group">
              <label htmlFor="sa-adm-pwd">Initial Password *</label>
              <input
                id="sa-adm-pwd"
                type="password"
                placeholder="e.g. password123"
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                required
              />
              <span className="sa-form-hint">
                Hashed with BCrypt upon storage. Can be updated after initial login.
              </span>
            </div>
          )}

          <Select
            id="sa-adm-comp"
            label="Assign to Tenant Company *"
            value={form.companyId}
            onChange={(val) => onChange({ ...form, companyId: val })}
            placeholder={null}
            options={companies.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.companyCode})`,
            }))}
            required
            className="sa-form-group"
          />

          <Select
            id="sa-adm-status"
            label="Account Status"
            value={form.status}
            onChange={(val) => onChange({ ...form, status: val })}
            placeholder={null}
            options={[
              { value: 'ACTIVE', label: 'ACTIVE (Authorized to manage company spaces)' },
              { value: 'INACTIVE', label: 'INACTIVE (Login suspended)' },
            ]}
            className="sa-form-group"
          />

          <div className="sa-modal__footer">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm">
              {editingAdmin ? 'Save Changes' : 'Create Administrator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
