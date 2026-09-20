import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
  id = 'slot-date',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current selected date
  const selectedDateObj = React.useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  // Calendar view navigation (Year & Month)
  const [viewYear, setViewYear] = useState(() => selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDateObj.getMonth());

  // Keep view synchronized when value changes externally (e.g. Quick buttons)
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

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
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

  const handleSelectToday = () => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const isoStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    onChange(isoStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Format display string e.g. "Sep 20, 2026"
  const formattedDisplay = React.useMemo(() => {
    return selectedDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDateObj]);

  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

  return (
    <div className="custom-datepicker-container" ref={containerRef}>
      <button
        type="button"
        id={id}
        className={`custom-datepicker-trigger ${isOpen ? 'custom-datepicker-trigger--open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="custom-datepicker-trigger__left">
          <CalendarIcon size={16} className="custom-datepicker-icon" />
          <span className="custom-datepicker-value">{formattedDisplay}</span>
        </div>
        <span className="custom-datepicker-day-name">
          {selectedDateObj.toLocaleDateString('en-US', { weekday: 'short' })}
        </span>
      </button>

      {isOpen && (
        <div className="custom-datepicker-dropdown" role="dialog" aria-modal="false">
          {/* Header with Month/Year & Navigation */}
          <div className="custom-datepicker-header">
            <span className="custom-datepicker-title">
              {MONTH_NAMES[viewMonth]} <strong style={{ color: 'var(--text-heading)' }}>{viewYear}</strong>
            </span>
            <div className="custom-datepicker-nav">
              <button
                type="button"
                className="custom-datepicker-nav-btn"
                onClick={prevMonth}
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="custom-datepicker-nav-btn"
                onClick={nextMonth}
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
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
                  className={`custom-datepicker-day ${
                    isSelected ? 'custom-datepicker-day--selected' : ''
                  } ${isToday && !isSelected ? 'custom-datepicker-day--today' : ''} ${
                    isPast ? 'custom-datepicker-day--disabled' : ''
                  }`}
                >
                  {day}
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

          {/* Footer Shortcuts */}
          <div className="custom-datepicker-footer">
            <button
              type="button"
              className="custom-datepicker-today-btn"
              onClick={handleSelectToday}
            >
              Jump to Today
            </button>
            <button
              type="button"
              className="custom-datepicker-close-btn"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
