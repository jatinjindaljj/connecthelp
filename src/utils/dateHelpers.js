export const isSameDate = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth();
};

/**
 * Format a date string (YYYY-MM-DD) to a localized date string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Get the month number (01-12) from a date string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Month number as string (01-12) or empty string if invalid
 */
export const getMonthFromDate = (dateString) => {
  if (!dateString) return '';
  try {
    return dateString.split('-')[1];
  } catch (error) {
    console.error('Error getting month from date:', error);
    return '';
  }
};

/**
 * Get the month name from a month number
 * @param {string} monthNumber - Month number (1-12 or 01-12)
 * @returns {string} Month name or empty string if invalid
 */
export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  try {
    // Convert to number and subtract 1 for zero-based array index
    const index = parseInt(monthNumber, 10) - 1;
    return months[index] || '';
  } catch (error) {
    console.error('Error getting month name:', error);
    return '';
  }
};

/**
 * Get all months as an array of objects with value and label
 * @returns {Array} Array of month objects with value (01-12) and label (month name)
 */
export const getAllMonths = () => {
  return [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
};
