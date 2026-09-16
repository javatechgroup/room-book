import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, Check, AlertCircle } from 'lucide-react';
import companyApi from '../../../api/companyApi';

export default function CompanyModal({
  isOpen,
  editingCompany,
  form,
  onChange,
  onClose,
  onSave,
  externalSuggestions = [],
  errorMessage = '',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [namePrompt, setNamePrompt] = useState('');

  useEffect(() => {
    if (externalSuggestions && externalSuggestions.length > 0) {
      setSuggestions(externalSuggestions);
    }
  }, [externalSuggestions]);

  // Reset suggestions when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setNamePrompt('');
    }
  }, [isOpen]);

  const generateLocalSuggestions = (name, code) => {
    const raw = (code || name || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const base = raw.slice(0, 6);
    if (!base) return [];
    return [`${base}-HQ`, `${base}-CORP`, `${base}2`, `${base}-01`];
  };

  const handleFetchSuggestions = async () => {
    const trimmedName = form.name ? form.name.trim() : '';
    if (!trimmedName) {
      setNamePrompt('Please enter company name first');
      return;
    }
    setNamePrompt('');
    setIsGenerating(true);
    try {
      if (companyApi && typeof companyApi.suggestCompanyCodes === 'function') {
        const res = await companyApi.suggestCompanyCodes(trimmedName, form.companyCode);
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setSuggestions(res.data);
          setIsGenerating(false);
          return;
        }
      }
      // Fallback local suggestions derived from actual company name
      setSuggestions(generateLocalSuggestions(trimmedName, form.companyCode));
    } catch (err) {
      setSuggestions(generateLocalSuggestions(trimmedName, form.companyCode));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestion = (code) => {
    onChange({ ...form, companyCode: code });
    setSuggestions((prev) => prev.filter((c) => c !== code));
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    onChange({ ...form, name: newName });
    if (namePrompt && newName.trim()) {
      setNamePrompt('');
    }
  };

  if (!isOpen) return null;

  const hasName = Boolean(form.name && form.name.trim());

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
          {errorMessage && (
            <div className="sa-form-alert sa-form-alert--error">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="sa-form-grid">
            <div className="sa-form-group">
              <label htmlFor="sa-comp-name">Company Name *</label>
              <input
                id="sa-comp-name"
                type="text"
                placeholder="e.g. Initech Global"
                value={form.name}
                onChange={handleNameChange}
                required
              />
              {namePrompt && (
                <span className="sa-form-hint sa-form-hint--warning">
                  {namePrompt}
                </span>
              )}
            </div>

            <div className="sa-form-group">
              <div className="sa-form-label-row">
                <label htmlFor="sa-comp-code">Company Code (Unique) *</label>
                {!editingCompany && (
                  <button
                    type="button"
                    className={`sa-suggest-btn ${!hasName ? 'sa-suggest-btn--disabled' : ''}`}
                    onClick={handleFetchSuggestions}
                    disabled={isGenerating || !hasName}
                    title={hasName ? 'Generate available unique code suggestions' : 'Enter company name first'}
                  >
                    <Sparkles size={12} />
                    <span>{isGenerating ? 'Checking...' : 'Suggest Code'}</span>
                  </button>
                )}
              </div>
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

          {/* Full-width clean suggestion bar */}
          {suggestions.length > 0 && (
            <div className="sa-code-chips-bar">
              <div className="sa-code-chips-bar__header">
                <span className="sa-code-chips-bar__label">
                  <Sparkles size={12} className="sa-sparkle-icon" />
                  Available Code Suggestions (Click to use):
                </span>
                <button
                  type="button"
                  className="sa-chips-dismiss"
                  onClick={() => setSuggestions([])}
                  title="Dismiss suggestions"
                >
                  &times;
                </button>
              </div>
              <div className="sa-code-chips-bar__list">
                {suggestions.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className="sa-code-chip"
                    onClick={() => handleApplySuggestion(code)}
                    title={`Click to set code to ${code}`}
                  >
                    <Check size={11} className="chip-check-icon" />
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}

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
