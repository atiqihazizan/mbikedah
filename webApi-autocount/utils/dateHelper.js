/**
 * Validate a date string in YYYY-MM-DD format.
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Parse a YYYY-MM-DD string into a JavaScript Date at midnight UTC.
 * @param {string} dateStr
 * @returns {Date}
 */
export function parseDate(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/**
 * Return today's date as YYYY-MM-DD string.
 * @returns {string}
 */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Return first day of current month as YYYY-MM-DD string.
 * @returns {string}
 */
export function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Format a JavaScript Date to YYYY-MM-DD string.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
