import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import './SearchInput.css';

/**
 * Universal SearchInput Component
 *
 * Provides:
 * - 300ms responsive debouncing
 * - Built-in clear (✕) button
 * - Visual `/` keycap badge when empty
 * - Automatic Escape key handler (blurs and/or clears)
 * - Accessible keyboard shortcuts integration
 *
 * @param {string} value - Controlled value from parent
 * @param {function} onChange - Callback invoked with debounced value: (query: string) => void
 * @param {string} [placeholder='Search...'] - Input placeholder text
 * @param {number} [debounceMs=300] - Debounce delay in milliseconds
 * @param {boolean} [showKbdBadge=true] - Whether to show the `/` shortcut keycap badge when empty
 * @param {boolean} [clearOnEscape=false] - Whether ESC also clears the text in addition to blurring
 * @param {string} [className=''] - Additional custom CSS classes
 * @param {boolean} [autoFocus=false] - Whether to autofocus on mount
 * @param {string} [ariaLabel='Search'] - Accessible aria label
 */
export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  showKbdBadge = true,
  clearOnEscape = false,
  className = '',
  autoFocus = false,
  ariaLabel = 'Search',
}) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef(null);
  const isFirstMount = useRef(true);

  // Sync internal state when parent resets value externally (e.g. 1-click filter reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced notification to parent
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (localValue === value) return;

    const timer = setTimeout(() => {
      if (onChange) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (clearOnEscape && localValue) {
        handleClear();
      }
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`superadmin-search-box search-input-wrapper ${className}`}>
      <Search size={16} className="search-box-icon" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="superadmin-search-input search-input__field"
        aria-label={ariaLabel}
        autoFocus={autoFocus}
      />
      {localValue ? (
        <button
          type="button"
          className="search-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search"
        >
          &times;
        </button>
      ) : showKbdBadge ? (
        <kbd className="search-kbd-hint" title="Press / to focus search">
          /
        </kbd>
      ) : null}
    </div>
  );
}
