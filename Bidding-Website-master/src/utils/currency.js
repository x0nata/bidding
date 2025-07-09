/**
 * Currency formatting utilities for Ethiopian Birr (ETB)
 * Horn of Antiques - Antique Auction for Ethiopia
 */

/**
 * Format amount as Ethiopian Birr (ETB)
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatETB = (amount, options = {}) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? 'ETB 0.00' : '0.00';
  }

  const formatter = new Intl.NumberFormat('en-ET', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'ETB',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(amount);
};

/**
 * Format amount as Ethiopian Birr without currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted number string
 */
export const formatETBNumber = (amount) => {
  return formatETB(amount, { showSymbol: false });
};

/**
 * Parse ETB formatted string back to number
 * @param {string} formattedAmount - The formatted amount string
 * @returns {number} Parsed number
 */
export const parseETB = (formattedAmount) => {
  if (!formattedAmount) return 0;
  
  // Remove currency symbols and spaces, keep only numbers, dots, and commas
  const cleanAmount = formattedAmount.toString().replace(/[^\d.,]/g, '');
  
  // Handle Ethiopian number format (comma as thousands separator, dot as decimal)
  const normalizedAmount = cleanAmount.replace(/,/g, '');
  
  return parseFloat(normalizedAmount) || 0;
};

/**
 * Format amount for display in bid inputs and buttons
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount for input display
 */
export const formatBidAmount = (amount) => {
  if (!amount || amount === 0) return '';
  return Math.round(amount).toString();
};

/**
 * Format amount for compact display (e.g., 1.2K, 1.5M)
 * @param {number} amount - The amount to format
 * @returns {string} Compact formatted amount
 */
export const formatETBCompact = (amount) => {
  if (!amount || amount === 0) return 'ETB 0';
  
  if (amount >= 1000000) {
    return `ETB ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `ETB ${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatETB(amount);
  }
};

/**
 * Validate if a string represents a valid ETB amount
 * @param {string} amount - The amount string to validate
 * @returns {boolean} True if valid amount
 */
export const isValidETBAmount = (amount) => {
  if (!amount) return false;
  const parsed = parseETB(amount);
  return !isNaN(parsed) && parsed >= 0;
};

/**
 * Get currency symbol for ETB
 * @returns {string} ETB currency symbol
 */
export const getETBSymbol = () => 'ETB';

/**
 * Format percentage for display
 * @param {number} percentage - The percentage to format
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '0%';
  }
  return `${percentage.toFixed(1)}%`;
};

/**
 * Calculate bid increment based on current price (Ethiopian Birr amounts)
 * @param {number} currentPrice - Current auction price
 * @returns {number} Recommended bid increment
 */
export const calculateBidIncrement = (currentPrice) => {
  if (currentPrice < 100) return 5;
  if (currentPrice < 500) return 10;
  if (currentPrice < 1000) return 25;
  if (currentPrice < 5000) return 50;
  if (currentPrice < 10000) return 100;
  if (currentPrice < 50000) return 250;
  return 500;
};

/**
 * Generate quick bid amounts based on current price
 * @param {number} currentPrice - Current auction price
 * @param {number} count - Number of quick bid amounts to generate
 * @returns {Array<number>} Array of quick bid amounts
 */
export const generateQuickBidAmounts = (currentPrice, count = 4) => {
  const increment = calculateBidIncrement(currentPrice);
  const amounts = [];
  
  for (let i = 1; i <= count; i++) {
    amounts.push(currentPrice + (increment * i));
  }
  
  return amounts;
};

/**
 * Format amount for auction listing display
 * @param {number} amount - The amount to format
 * @param {string} type - Type of amount (starting, current, reserve)
 * @returns {string} Formatted amount with context
 */
export const formatAuctionAmount = (amount, type = 'current') => {
  const formattedAmount = formatETB(amount);
  
  switch (type) {
    case 'starting':
      return `Starting: ${formattedAmount}`;
    case 'current':
      return `Current: ${formattedAmount}`;
    case 'reserve':
      return `Reserve: ${formattedAmount}`;
    case 'estimate':
      return `Est: ${formattedAmount}`;
    default:
      return formattedAmount;
  }
};

// Default export
export default {
  formatETB,
  formatETBNumber,
  parseETB,
  formatBidAmount,
  formatETBCompact,
  isValidETBAmount,
  getETBSymbol,
  formatPercentage,
  calculateBidIncrement,
  generateQuickBidAmounts,
  formatAuctionAmount
};
