/**
 * Formats YYYY-MM-DD to Month DD, YYYY (e.g. July 12, 2026)
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatHumanDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC' // Prevent timezone shift since dateStr has no time
  });
};

/**
 * Formats HH:MM to 12-hour AM/PM format (e.g. 2:00 PM)
 * @param {string} timeStr 
 * @returns {string}
 */
export const formatHumanTime = (timeStr) => {
  if (!timeStr) return '-';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  
  if (isNaN(hours)) return timeStr;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutesStr.padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Calculates human readable end time (default 2 hours)
 * @param {string} startTimeStr 
 * @returns {string}
 */
export const getHumanEndTime = (startTimeStr) => {
  if (!startTimeStr) return '';
  const [hoursStr, minutesStr] = startTimeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const endHours = (hours + 2) % 24;
  
  return formatHumanTime(`${endHours}:${minutesStr}`);
};
