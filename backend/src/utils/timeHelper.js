/**
 * Helper to add hours to a HH:MM time string
 * @param {string} timeStr - Time in HH:MM format
 * @param {number} hoursToAdd - Hours to add (e.g. 2)
 * @returns {string} - Resulting time in HH:MM format
 */
const addHoursToTime = (timeStr, hoursToAdd) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let newHours = hours + hoursToAdd;
  
  // Format with leading zeros
  const formattedHours = String(newHours % 24).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}`;
};

module.exports = {
  addHoursToTime,
};
