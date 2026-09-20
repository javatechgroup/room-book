import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import './DatePicker.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  id = 'slot-date',
  placeholder = 'Select reservation date',
  allowClear = false,
  compact = false,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current selected date
  const selectedDateObj = useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  // Calendar view navigation (Year & Month)
  const [viewYear, setViewYear] = useState(() => selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDateObj.getMonth());

  // Keep view synchronized when value changes externally
  useEffect(() => {
    setViewYear(selectedDateObj.getFullYear());
    setViewMonth(selectedDateObj.getMonth());
  }, [selectedDateObj]);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Minimum date parsing (defaults to today)
  const minDateStr = minDate || new Date().toISOString().split('T')[0];
  const [minY, minM, minD] = minDateStr.split('-').map(Number);
  const minDateMidnight = new Date(minY, minM - 1, minD);

  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar grid days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day) => {
    const pad = (n) => String(n).padStart(2, '0');
    const isoStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    onChange(isoStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    if (e) e.stopPropagation();
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const isoStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    onChange(isoStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleSelectTomorrow = (e) => {
    if (e) e.stopPropagation();
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    const isoStr = `${tmrw.getFullYear()}-${pad(tmrw.getMonth() + 1)}-${pad(tmrw.getDate())}`;
    onChange(isoStr);
    setViewYear(tmrw.getFullYear());
    setViewMonth(tmrw.getMonth());
    setIsOpen(false);
  };

  const pad = (n) => String(n).padStart(2, '0');
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${pad(todayDate.getMonth() + 1)}-${pad(todayDate.getDate())}`;
  const tmrwDate = new Date();
  tmrwDate.setDate(tmrwDate.getDate() + 1);
  const tmrwStr = `${tmrwDate.getFullYear()}-${pad(tmrwDate.getMonth() + 1)}-${pad(tmrwDate.getDate())}`;

  const isTodaySelected = value === todayStr;
  const isTomorrowSelected = value === tmrwStr;

  // Format display string e.g. "Sun, Sep 20, 2026"
  const formattedDisplay = useMemo(() => {
    if (!value) return null;
    const weekday = selectedDateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDayYear = selectedDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${weekday}, ${monthDayYear}`;
  }, [value, selectedDateObj]);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className={`custom-datepicker-container ${className}`} ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        className={`custom-datepicker-trigger ${isOpen ? 'custom-datepicker-trigger--open' : ''} ${
          compact ? 'custom-datepicker-trigger--compact' : ''
        } ${disabled ? 'custom-datepicker-trigger--disabled' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="custom-datepicker-trigger__left">
          <div className="custom-datepicker-icon-box">
            <CalendarIcon size={compact ? 13 : 15} />
          </div>
          <span className={`custom-datepicker-value ${!formattedDisplay ? 'custom-datepicker-value--placeholder' : ''}`}>
            {formattedDisplay || placeholder}
          </span>
        </div>
        <div className="custom-datepicker-trigger__right">
          {allowClear && value && (
            <span
              role="button"
              tabIndex={0}
              className="custom-datepicker-clear-btn"
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              title="Clear date"
            >
              ×
            </span>
          )}
          <ChevronDown
            size={15}
            className={`custom-datepicker-chevron ${isOpen ? 'custom-datepicker-chevron--open' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="custom-datepicker-dropdown" role="dialog" aria-modal="false">
          {/* Quick Preset Chips */}
          <div className="custom-datepicker-quick-bar">
            <button
              type="button"
              className={`quick-pill ${isTodaySelected ? 'quick-pill--active' : ''}`}
              onClick={handleSelectToday}
            >
              Today
            </button>
            <button
              type="button"
              className={`quick-pill ${isTomorrowSelected ? 'quick-pill--active' : ''}`}
              onClick={handleSelectTomorrow}
            >
              Tomorrow
            </button>
          </div>

          {/* Header with Month/Year & Navigation */}
          <div className="custom-datepicker-header">
            <button
              type="button"
              className="custom-datepicker-nav-btn"
              onClick={prevMonth}
              aria-label="Previous Month"
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="custom-datepicker-title">
              {MONTH_NAMES[viewMonth]} <strong>{viewYear}</strong>
            </span>

            <button
              type="button"
              className="custom-datepicker-nav-btn"
              onClick={nextMonth}
              aria-label="Next Month"
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="custom-datepicker-weekdays">
            {DAY_NAMES.map((d) => (
              <span key={d} className="custom-datepicker-weekday">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="custom-datepicker-days">
            {/* Trailing days from previous month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const prevDay = prevMonthDays - firstDayIndex + i + 1;
              return (
                <span key={`prev-${i}`} className="custom-datepicker-day custom-datepicker-day--muted">
                  {prevDay}
                </span>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const thisDate = new Date(viewYear, viewMonth, day);
              const isPast = thisDate < minDateMidnight;
              const dateIso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
              const isSelected = dateIso === value;
              const isToday = dateIso === todayStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && handleSelectDay(day)}
                  className={`custom-datepicker-day ${
                    isSelected ? 'custom-datepicker-day--selected' : ''
                  } ${isToday && !isSelected ? 'custom-datepicker-day--today' : ''} ${
                    isPast ? 'custom-datepicker-day--disabled' : ''
                  }`}
                  title={isPast ? 'Past date cannot be reserved' : undefined}
                >
                  <span>{day}</span>
                  {isToday && !isSelected && <span className="today-dot" />}
                </button>
              );
            })}

            {/* Trailing days of next month to complete the grid */}
            {Array.from({
              length: (7 - ((firstDayIndex + daysInMonth) % 7)) % 7,
            }).map((_, i) => (
              <span key={`next-${i}`} className="custom-datepicker-day custom-datepicker-day--muted">
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
