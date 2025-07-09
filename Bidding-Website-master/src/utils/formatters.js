/**
 * Utility functions for formatting data display
 */

// Format currency values (Ethiopian Birr by default)
export const formatCurrency = (amount, currency = 'ETB', locale = 'en-ET') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'ETB 0.00';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch (error) {
    // Fallback formatting for ETB
    return `ETB ${Number(amount).toLocaleString('en-ET', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

// Format large numbers with abbreviations (K, M, B)
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const number = Number(num);
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B';
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  
  return number.toString();
};

// Format date and time
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    return '';
  }
};

// Format time remaining
export const formatTimeRemaining = (endDate) => {
  if (!endDate) return '';
  
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Format auction status
export const formatAuctionStatus = (auction) => {
  if (!auction) return 'timed';
  
  const now = new Date();
  const startDate = new Date(auction.auctionStartDate || auction.createdAt);
  const endDate = new Date(auction.auctionEndDate);
  
  if (auction.isSoldout) return 'sold';
  if (now > endDate) return 'ended';
  if (now < startDate) return 'upcoming';
  
  // Check if ending soon (within 24 hours)
  const hoursUntilEnd = (endDate - now) / (1000 * 60 * 60);
  if (hoursUntilEnd <= 24) return 'ending-soon';
  
  return 'live';
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${Number(value).toFixed(decimals)}%`;
};

// Format phone number
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneNumber; // Return original if not standard format
};

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatTimeRemaining,
  formatAuctionStatus,
  truncateText,
  formatFileSize,
  formatPercentage,
  formatPhoneNumber
};
