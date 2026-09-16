/**
 * Centralized Date & Time Formatting Utilities
 * Standardizes human-readable date and time presentation across the application.
 */

/**
 * Safely parses any date input (ISO string with milliseconds/microseconds, YYYY-MM-DD,
 * space-separated timestamp, timestamp number, or Date instance) into a valid Date object.
 *
 * @param {string|number|Date} dateValue
 * @returns {Date|null}
 */
export const parseSafeDate = (dateValue) => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? null : dateValue;

  if (typeof dateValue === 'number') {
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof dateValue === 'string') {
    const raw = dateValue.trim();
    if (!raw) return null;

    // Date-only format: "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    // Space-separated datetime: "YYYY-MM-DD HH:mm:ss" -> convert to ISO string
    let normalized = raw;
    if (raw.includes(' ') && !raw.includes('T')) {
      normalized = raw.replace(' ', 'T');
    }

    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
};

/**
 * Formats a date into a clean, localized format.
 * Example: '2026-09-16T11:26:42.434209' -> 'Sep 16, 2026'
 * Example: '2026-09-16' -> 'Sep 16, 2026'
 *
 * @param {string|number|Date} dateValue
 * @param {string} [fallback='—']
 * @returns {string}
 */
export const formatDate = (dateValue, fallback = '—') => {
  const d = parseSafeDate(dateValue);
  if (!d) return fallback;

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats an established date specifically for company badges and headers.
 * Example: '2026-09-16T11:26:42.434209' -> 'Est. Sep 16, 2026'
 *
 * @param {string|number|Date} dateValue
 * @param {string} [fallback='Est. N/A']
 * @returns {string}
 */
export const formatEstDate = (dateValue, fallback = 'Est. N/A') => {
  if (!dateValue) return fallback;
  const formatted = formatDate(dateValue, '');
  return formatted ? `Est. ${formatted}` : fallback;
};

/**
 * Formats a full date and time string in a uniform, highly readable enterprise format.
 * Example: '2026-09-16T11:26:42.434209' -> 'Sep 16, 2026, 11:26 AM'
 * With seconds: 'Sep 16, 2026, 11:26:42 AM'
 *
 * @param {string|number|Date} dateValue
 * @param {object} [options]
 * @param {boolean} [options.showSeconds=false]
 * @param {string} [options.fallback='—']
 * @returns {string}
 */
export const formatDateTime = (dateValue, { showSeconds = false, fallback = '—' } = {}) => {
  const d = parseSafeDate(dateValue);
  if (!d) return fallback;

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    hour12: true,
  });
};

/**
 * Formats audit trail timestamps for data tables, mobile cards, and inspectors.
 * Example: '2026-09-16T11:26:42.434209' -> 'Sep 16, 2026, 11:26 AM'
 *
 * @param {string|number|Date} dateValue
 * @param {string} [fallback='—']
 * @returns {string}
 */
export const formatAuditTimestamp = (dateValue, fallback = '—') => {
  return formatDateTime(dateValue, { showSeconds: false, fallback });
};
