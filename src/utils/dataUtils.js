// src/utils/dataUtils.js

/**
 * Safely converts a value to a string for BigInteger fields
 */
export const toBigIntString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

/**
 * Format a date string from ISO to localized format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Parses a date string to a valid ISO date format
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Normalize entity data to ensure consistent types for API submission
 */
export const normalizeEntityData = (data, { bigIntFields = [], intFields = [], boolFields = [], dateFields = [] }) => {
  const normalizedData = { ...data };
  
  // Convert BigInteger fields to strings
  bigIntFields.forEach(field => {
    if (normalizedData[field] !== undefined && normalizedData[field] !== null) {
      normalizedData[field] = toBigIntString(normalizedData[field]);
    }
  });
  
  // Convert integer fields to numbers
  intFields.forEach(field => {
    if (normalizedData[field] !== undefined && normalizedData[field] !== null) {
      normalizedData[field] = parseInt(normalizedData[field], 10) || 0;
    }
  });
  
  // Convert boolean fields to booleans
  boolFields.forEach(field => {
    if (normalizedData[field] !== undefined && normalizedData[field] !== null) {
      normalizedData[field] = Boolean(normalizedData[field]);
    }
  });
  
  // Format date fields
  dateFields.forEach(field => {
    if (normalizedData[field]) {
      normalizedData[field] = parseDate(normalizedData[field]);
    }
  });
  
  return normalizedData;
};

/**
 * Format a phone number for display
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const phoneStr = String(phoneNumber);
  
  // For phone numbers of length 10
  if (phoneStr.length === 10) {
    return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
  }
  
  // For international phone numbers
  if (phoneStr.length > 10) {
    const countryCode = phoneStr.slice(0, phoneStr.length - 10);
    const areaCode = phoneStr.slice(phoneStr.length - 10, phoneStr.length - 7);
    const firstPart = phoneStr.slice(phoneStr.length - 7, phoneStr.length - 4);
    const lastPart = phoneStr.slice(phoneStr.length - 4);
    return `+${countryCode} (${areaCode}) ${firstPart}-${lastPart}`;
  }
  
  // Return original if can't be formatted
  return phoneStr;
};

/**
 * Get status display name based on code
 */
export const getStatusDisplayName = (statusCode) => {
  const statusMap = {
    'submitted': 'Submitted',
    'assigned': 'Assigned',
    'investigating': 'Investigating',
    'evidence_collection': 'Evidence Collection',
    'under_review': 'Under Review',
    'resolved': 'Resolved',
    'closed': 'Closed'
  };
  
  return statusMap[statusCode] || statusCode;
};

/**
 * Get status display class for styling based on status value
 */
export const getStatusDisplayClass = (status, type = 'general') => {
  // Handle null or undefined status
  if (!status) return 'bg-gray-100 text-gray-800';
  
  // Ensure status is a string before calling toLowerCase
  const statusLower = String(status).toLowerCase();
  
  if (type === 'fir') {
    switch(statusLower) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'evidence_collection': return 'bg-orange-100 text-orange-800';
      case 'under_review': return 'bg-indigo-100 text-indigo-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  if (type === 'criminal') {
    switch(statusLower) {
      case 'arrested': return 'bg-red-100 text-red-800';
      case 'wanted': return 'bg-yellow-100 text-yellow-800';
      case 'released': return 'bg-green-100 text-green-800';
      case 'in trial': return 'bg-blue-100 text-blue-800';
      case 'convicted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Default styling
  return 'bg-gray-100 text-gray-800';
};

/**
 * Safe access of nested properties
 */
export const safelyAccessNestedProp = (obj, path, defaultValue = null) => {
  if (!obj) return defaultValue;
  
  const pathArray = path.split('.');
  let current = obj;
  
  for (const key of pathArray) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(current, key)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
};