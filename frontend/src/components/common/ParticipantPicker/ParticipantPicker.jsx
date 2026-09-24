import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Users, X, AlertTriangle, UserCheck, Check, Mail, Loader2 } from 'lucide-react';
import { facilityApi } from '../../../api/facilityApi';
import './ParticipantPicker.css';

/**
 * Google Calendar-style participant picker with company employee suggestions,
 * external organization warning, chip-based tags, and add/remove capabilities.
 * Supports both preloaded employee lists and debounced server-side paginated search.
 */
export default function ParticipantPicker({
  participants = [],
  onChange,
  companyEmployees = [],
  currentUser = null,
  maxCapacity = null,
}) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [remoteEmployees, setRemoteEmployees] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const cleanQuery = inputValue.trim().toLowerCase();

  // Debounced server-side database search for enterprise scalability
  useEffect(() => {
    if (!cleanQuery) {
      setRemoteEmployees([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await facilityApi.searchEmployees(cleanQuery, {
          companyId: currentUser?.companyId,
          limit: 15,
        });
        if (res && res.success && Array.isArray(res.data)) {
          setRemoteEmployees(res.data);
        } else {
          setRemoteEmployees([]);
        }
      } catch (err) {
        console.warn('Debounced employee search failed:', err);
        setRemoteEmployees([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [cleanQuery, currentUser?.companyId]);

  // Compute initials for avatar badge
  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const currentEmailsSet = useMemo(() => {
    return new Set(participants.map((p) => p.email?.toLowerCase().trim()).filter(Boolean));
  }, [participants]);

  // Basic email pattern check
  const isLikelyEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanQuery);
  }, [cleanQuery]);

  // Filter and merge internal company employees (local cache + remote database results)
  const suggestions = useMemo(() => {
    if (!cleanQuery) return [];

    const combinedMap = new Map();

    const addCandidate = (emp) => {
      if (!emp || !emp.email) return;
      const empEmail = emp.email.toLowerCase().trim();

      // Don't show current logged in booker
      if (currentUser?.email && empEmail === currentUser.email.toLowerCase().trim()) {
        return;
      }
      // Don't show already added participants
      if (currentEmailsSet.has(empEmail)) {
        return;
      }
      if (!combinedMap.has(empEmail)) {
        combinedMap.set(empEmail, emp);
      }
    };

    // Instant local matches from preloaded list (if present)
    if (Array.isArray(companyEmployees)) {
      companyEmployees.forEach((emp) => {
        if (!emp || !emp.email) return;
        const empEmail = emp.email.toLowerCase().trim();
        const empName = (emp.fullName || '').toLowerCase().trim();
        if (empEmail.includes(cleanQuery) || empName.includes(cleanQuery)) {
          addCandidate(emp);
        }
      });
    }

    // Remote database search results (indexed, paginated)
    if (Array.isArray(remoteEmployees)) {
      remoteEmployees.forEach((emp) => {
        addCandidate(emp);
      });
    }

    return Array.from(combinedMap.values());
  }, [companyEmployees, remoteEmployees, cleanQuery, currentEmailsSet, currentUser]);

  // Is typed email outside of company?
  const isExternalMatch = useMemo(() => {
    if (!cleanQuery || !cleanQuery.includes('@')) return false;

    // Check if the typed string matches any known company employee
    const existsInSuggestions = suggestions.some(
      (emp) => emp?.email && emp.email.toLowerCase().trim() === cleanQuery
    );
    const existsInLocal = companyEmployees.some(
      (emp) => emp?.email && emp.email.toLowerCase().trim() === cleanQuery
    );

    const alreadyAdded = currentEmailsSet.has(cleanQuery);
    return !existsInSuggestions && !existsInLocal && !alreadyAdded && cleanQuery.includes('.');
  }, [cleanQuery, suggestions, companyEmployees, currentEmailsSet]);

  // Add an internal employee
  const handleSelectEmployee = (emp) => {
    if (!emp || !emp.email) return;
    const newParticipant = {
      userId: emp.id,
      email: emp.email.trim().toLowerCase(),
      name: emp.fullName || emp.email,
      isExternal: false,
    };
    onChange([...participants, newParticipant]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Add an external email
  const handleAddExternal = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    // Check if by any chance it matches an employee in suggestions or local list
    const matched = suggestions.find(
      (emp) => emp?.email && emp.email.toLowerCase().trim() === cleanEmail
    ) || companyEmployees.find(
      (emp) => emp?.email && emp.email.toLowerCase().trim() === cleanEmail
    );

    const newParticipant = {
      userId: matched ? matched.id : null,
      email: cleanEmail,
      name: matched ? (matched.fullName || matched.email) : cleanEmail,
      isExternal: !matched,
    };

    onChange([...participants, newParticipant]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Remove participant
  const handleRemove = (emailToRemove) => {
    const updated = participants.filter(
      (p) => p.email?.toLowerCase().trim() !== emailToRemove.toLowerCase().trim()
    );
    onChange(updated);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + (isExternalMatch ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (isOpen && totalItems > 0) {
        if (highlightedIndex < suggestions.length) {
          handleSelectEmployee(suggestions[highlightedIndex]);
        } else if (isExternalMatch) {
          handleAddExternal(cleanQuery);
        }
      } else if (isLikelyEmail && !currentEmailsSet.has(cleanQuery)) {
        handleAddExternal(cleanQuery);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && participants.length > 0) {
      // Remove last chip on backspace if input is empty
      const last = participants[participants.length - 1];
      if (last?.email) handleRemove(last.email);
    }
  };

  const externalCount = participants.filter((p) => p.isExternal).length;
  const internalCount = participants.length - externalCount;

  return (
    <div className="participant-picker" ref={containerRef}>
      <div className="participant-picker__header">
        <label className="participant-picker__label" htmlFor="participant-input">
          <Users size={14} style={{ color: 'var(--primary-600, #2563eb)' }} />
          <span>Participants ({participants.length})</span>
          {maxCapacity && (
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              (Max Room Capacity: {maxCapacity})
            </span>
          )}
        </label>
        {participants.length > 0 && (
          <span className="participant-picker__count-badge">
            {internalCount} Internal{externalCount > 0 ? `, ${externalCount} External` : ''}
          </span>
        )}
      </div>

      {/* Input Field with Icons */}
      <div className="participant-picker__input-wrap">
        <span className="participant-picker__lead-icon">
          <Mail size={15} />
        </span>
        <input
          id="participant-input"
          ref={inputRef}
          type="text"
          className="participant-picker__input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (cleanQuery) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Add participants (type name or email, press Enter)..."
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            className="participant-picker__clear-btn"
            onClick={() => {
              setInputValue('');
              setIsOpen(false);
            }}
            title="Clear"
          >
            <X size={14} />
          </button>
        )}

        {/* Autocomplete Dropdown */}
        {isOpen && cleanQuery && (
          <ul className="participant-picker__dropdown" role="listbox">
            {suggestions.length > 0 && (
              <li className="participant-picker__dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Company Employees</span>
                {isSearching && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
              </li>
            )}
            {suggestions.map((emp, idx) => {
              const isSelected = idx === highlightedIndex;
              return (
                <li
                  key={emp.id || emp.email}
                  className={`participant-picker__item ${isSelected ? 'participant-picker__item--active' : ''}`}
                  onClick={() => handleSelectEmployee(emp)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="participant-picker__item-left">
                    <div className="participant-avatar">
                      {getInitials(emp.fullName, emp.email)}
                    </div>
                    <div className="participant-picker__item-info">
                      <span className="participant-picker__item-name">{emp.fullName}</span>
                      <span className="participant-picker__item-email">{emp.email}</span>
                    </div>
                  </div>
                  {emp.departmentName && (
                    <span className="participant-picker__item-dept">{emp.departmentName}</span>
                  )}
                </li>
              );
            })}

            {/* External Suggestion / Warning */}
            {isExternalMatch && (
              <li
                className={`participant-picker__item participant-picker__item--external ${
                  highlightedIndex === suggestions.length ? 'participant-picker__item--active' : ''
                }`}
                onClick={() => handleAddExternal(cleanQuery)}
                role="option"
                aria-selected={highlightedIndex === suggestions.length}
              >
                <div className="participant-picker__item-left">
                  <div className="participant-avatar participant-avatar--external">
                    <AlertTriangle size={15} />
                  </div>
                  <div className="participant-picker__item-info">
                    <span className="participant-picker__item-name">Add "{cleanQuery}"</span>
                    <span className="participant-picker__item-email">Outside of company directory</span>
                  </div>
                </div>
                <span className="participant-picker__external-warning-tag">
                  <AlertTriangle size={11} /> Outside Company
                </span>
              </li>
            )}

            {suggestions.length === 0 && !isExternalMatch && (
              <li className="participant-picker__item" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {isSearching ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    Searching directory...
                  </span>
                ) : (
                  'No matching employee found. Type full email to invite external participant.'
                )}
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Participant Chips List */}
      {participants.length > 0 && (
        <div className="participant-picker__chips">
          {participants.map((p) => {
            const emailKey = p.email || p.id;
            const isExt = Boolean(p.isExternal);
            return (
              <span
                key={emailKey}
                className={`participant-chip ${isExt ? 'participant-chip--external' : ''}`}
                title={isExt ? `${p.email} (External guest — outside of company)` : `${p.name} <${p.email}>`}
              >
                <span className={`participant-chip__avatar ${isExt ? 'participant-chip__avatar--external' : ''}`}>
                  {isExt ? '!' : getInitials(p.name, p.email)}
                </span>
                <span className="participant-chip__text">{p.name || p.email}</span>

                {isExt ? (
                  <span className="participant-chip__badge participant-chip__badge--external">
                    <AlertTriangle size={10} /> External
                  </span>
                ) : (
                  <span className="participant-chip__badge">Company</span>
                )}

                <button
                  type="button"
                  className="participant-chip__remove"
                  onClick={() => handleRemove(p.email)}
                  title={`Remove ${p.name || p.email}`}
                  aria-label={`Remove ${p.name || p.email}`}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Warning Notice if External Participants Exist */}
      {externalCount > 0 && (
        <div className="participant-picker__notice">
          <AlertTriangle size={16} />
          <div>
            <strong>Outside Organization Notice:</strong> You have added {externalCount} external participant{externalCount > 1 ? 's' : ''} ({participants.filter(p => p.isExternal).map(p => p.email).join(', ')}). They will receive an external meeting invitation email.
          </div>
        </div>
      )}
    </div>
  );
}
