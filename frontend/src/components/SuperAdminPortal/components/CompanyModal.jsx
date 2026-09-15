import React from 'react';
import { Building2 } from 'lucide-react';

export default function CompanyModal({
  isOpen,
  editingCompany,
  form,
  onChange,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal__header">
          <div className="sa-modal__title-group">
            <Building2 size={20} className="modal-title-icon" />
            <h3>{editingCompany ? 'Edit Tenant Company' : 'Register New Tenant Company'}</h3>
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
          <div className="sa-form-grid">
            <div className="sa-form-group">
              <label htmlFor="sa-comp-name">Company Name *</label>
              <input
                id="sa-comp-name"
                type="text"
                placeholder="e.g. Initech Global"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="sa-form-group">
              <label htmlFor="sa-comp-code">Company Code (Unique) *</label>
              <input
                id="sa-comp-code"
                type="text"
                placeholder="e.g. INITECH"
                maxLength={10}
                value={form.companyCode}
                onChange={(e) =>
                  onChange({ ...form, companyCode: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
          </div>

          <div className="sa-form-grid">
            <div className="sa-form-group">
              <label htmlFor="sa-comp-contact">Contact Email *</label>
              <input
                id="sa-comp-contact"
                type="email"
                placeholder="e.g. admin@initech.io"
                value={form.contactInformation}
                onChange={(e) =>
                  onChange({ ...form, contactInformation: e.target.value })
                }
                required
              />
            </div>

            <div className="sa-form-group">
              <label htmlFor="sa-comp-phone">Direct Phone</label>
              <input
                id="sa-comp-phone"
                type="text"
                placeholder="e.g. +1 (800) 555-0100"
                value={form.phone}
                onChange={(e) => onChange({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="sa-form-group">
            <label htmlFor="sa-comp-addr">Registered Campus Address</label>
            <textarea
              id="sa-comp-addr"
              rows={2}
              placeholder="e.g. 4120 Freemont Blvd, Building B, Austin, TX"
              value={form.address}
              onChange={(e) => onChange({ ...form, address: e.target.value })}
            />
          </div>

          <div className="sa-form-group">
            <label htmlFor="sa-comp-status">Initial Status</label>
            <select
              id="sa-comp-status"
              value={form.status}
              onChange={(e) => onChange({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE (Authorized for physical room scheduling)</option>
              <option value="INACTIVE">INACTIVE (Temporarily suspended)</option>
            </select>
          </div>

          <div className="sa-modal__footer">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm">
              {editingCompany ? 'Save Changes' : 'Register Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
