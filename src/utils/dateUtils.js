/**
 * Format a date object or string into a readable format
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return "TBA";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options
  };
  
  return dateObj.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Format a time string into a readable format
 * @param {string} timeString - Time string in format HH:MM
 * @returns {string} Formatted time string
 */
export function formatTime(timeString) {
  if (!timeString) return "";
  
  const [hours, minutes] = timeString.split(":").map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return timeString;
  
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  
  return `${displayHours}:${paddedMinutes} ${period}`;
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string} date - The date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? "Tomorrow" : `In ${diffDay} days`;
  } else if (diffDay < 0) {
    return diffDay === -1 ? "Yesterday" : `${Math.abs(diffDay)} days ago`;
  } else if (diffHour > 0) {
    return `In ${diffHour} ${diffHour === 1 ? "hour" : "hours"}`;
  } else if (diffHour < 0) {
    return `${Math.abs(diffHour)} ${Math.abs(diffHour) === 1 ? "hour" : "hours"} ago`;
  } else if (diffMin > 0) {
    return `In ${diffMin} ${diffMin === 1 ? "minute" : "minutes"}`;
  } else if (diffMin < 0) {
    return `${Math.abs(diffMin)} ${Math.abs(diffMin) === 1 ? "minute" : "minutes"} ago`;
  } else {
    return "Just now";
  }
}

/**
 * Check if a date is in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false;
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj > new Date();
}

/**
 * Check if a date is between start and end dates
 * @param {Date|string} date - The date to check
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {boolean} True if date is between start and end
 */
export function isDateBetween(date, startDate, endDate) {
  if (!date || !startDate || !endDate) return false;
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const startObj = typeof startDate === "string" ? new Date(startDate) : startDate;
  const endObj = typeof endDate === "string" ? new Date(endDate) : endDate;
  
  if (isNaN(dateObj.getTime()) || isNaN(startObj.getTime()) || isNaN(endObj.getTime())) return false;
  
  return dateObj >= startObj && dateObj <= endObj;
}