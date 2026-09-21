import React, { useId, useMemo } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import './Select.css';

/**
 * Universal Select / Dropdown Component
 *
 * Provides:
 * - Native <select> under the hood (100% accessible, mobile wheel picker & form validation support)
 * - Flexible option normalization:
 *     - Array of strings: ['Engineering', 'Marketing']
 *     - Array of objects: [{ label: 'HR', value: 'hr' }], [{ name: 'HR', id: 1 }], etc.
 * - Leading icon support (e.g. <Tag size={13} />, <Building2 size={13} />)
 * - Custom animated chevron arrow (removes native OS select arrow)
 * - Consistent light & dark mode corporate design tokens
 * - Built-in label, required indicator, error state, and helper text
 *
 * @param {string|number} value - Controlled value from parent
 * @param {function} onChange - Callback invoked with: (value: string, event: React.ChangeEvent) => void
 * @param {Array} options - Array of string values or { label, value } / { name, id } objects
 * @param {string} [placeholder] - Default unselected placeholder text (renders disabled empty option)
 * @param {string|React.ReactNode} [label] - Optional field label
 * @param {React.ReactNode} [icon] - Optional leading icon displayed inside the select input
 * @param {boolean} [required=false] - Whether field is required
 * @param {boolean} [disabled=false] - Whether dropdown is disabled
 * @param {string} [error] - Error message to display below dropdown
 * @param {string} [helperText] - Subtle explanatory text below dropdown
 * @param {'sm'|'md'|'lg'} [size='md'] - Visual size variant
 * @param {string} [className=''] - Class name for the outer wrapper container
 * @param {string} [selectClassName=''] - Class name applied directly to the <select> element
 * @param {string} [id] - Input element id (auto-generated if omitted)
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = '-- Select --',
  label,
  icon,
  required = false,
  disabled = false,
  error,
  helperText,
  size = 'md',
  className = '',
  selectClassName = '',
  wrapperStyle,
  id,
  name,
  autoFocus = false,
  children,
  ...restProps
}) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;

  // Normalize options into consistent [{ key, label, value }] format
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options
      .map((opt, index) => {
        if (opt === null || opt === undefined) return null;
        if (typeof opt === 'string' || typeof opt === 'number') {
          return {
            key: `opt-${index}-${opt}`,
            label: String(opt),
            value: String(opt),
          };
        }
        if (typeof opt === 'object') {
          const val = opt.value ?? opt.id ?? opt.name ?? opt.code ?? '';
          const lbl = opt.label ?? opt.name ?? opt.title ?? String(val);
          const key = opt.key ?? opt.id ?? `opt-${index}-${val}`;
          return {
            key: String(key),
            label: String(lbl),
            value: String(val),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [options]);

  const handleChange = (e) => {
    if (onChange) {
      // Allows callers to do either: onChange={val => ...} or onChange={(val, e) => ...}
      onChange(e.target.value, e);
    }
  };

  const isValueSelected = value !== undefined && value !== null && value !== '';

  return (
    <div
      className={`common-select-group ${size !== 'md' ? `common-select-group--${size}` : ''} ${
        error ? 'common-select-group--error' : ''
      } ${disabled ? 'common-select-group--disabled' : ''} ${className}`.trim()}
      style={wrapperStyle}
    >
      {label && (
        <label htmlFor={selectId} className="common-select__label">
          {icon && <span className="common-select__label-icon">{icon}</span>}
          <span>{label}</span>
          {required && <span className="common-select__required-mark">*</span>}
        </label>
      )}

      <div className="common-select__control-wrap">
        {/* Optional leading inside-input icon when no label icon is shown */}
        {!label && icon && <span className="common-select__lead-icon">{icon}</span>}

        <select
          id={selectId}
          name={name}
          value={value ?? ''}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`common-select__field ${!label && icon ? 'common-select__field--has-lead' : ''} ${
            !isValueSelected ? 'common-select__field--placeholder' : ''
          } ${selectClassName}`.trim()}
          {...restProps}
        >
          {children ? (
            children
          ) : (
            <>
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {normalizedOptions.map((opt) => (
                <option key={opt.key} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </>
          )}
        </select>

        {/* Custom Chevron Arrow */}
        <span className="common-select__chevron" aria-hidden="true">
          <ChevronDown size={size === 'sm' ? 13 : size === 'lg' ? 16 : 14} />
        </span>
      </div>

      {error ? (
        <p className="common-select__error-msg">
          <AlertCircle size={12} />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="common-select__helper-msg">{helperText}</p>
      ) : null}
    </div>
  );
}
