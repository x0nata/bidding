// Common validation utilities to reduce code duplication

export const validationRules = {
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  // Phone number validation
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid contact number'
  },
  
  // Password validation
  password: {
    minLength: 6,
    message: 'Password must be at least 6 characters long'
  },
  
  // Bid amount validation
  bidAmount: {
    min: 1,
    max: 1000000,
    message: 'Bid amount must be between $1 and $1,000,000'
  }
};

// Common validation functions
export const validateRequired = (fields, data) => {
  const missing = fields.filter(field => !data[field] || data[field].toString().trim() === '');
  if (missing.length > 0) {
    return `Please fill in all required fields: ${missing.join(', ')}`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!validationRules.email.pattern.test(email)) {
    return validationRules.email.message;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Contact number is required';
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!validationRules.phone.pattern.test(cleanPhone)) {
    return validationRules.phone.message;
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < validationRules.password.minLength) {
    return validationRules.password.message;
  }
  return null;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateBidAmount = (amount, minimumBid = 1) => {
  const numAmount = parseFloat(amount);
  
  if (!amount || isNaN(numAmount)) {
    return 'Please enter a valid bid amount';
  }
  
  if (numAmount < minimumBid) {
    return `Minimum bid is $${minimumBid.toLocaleString()}`;
  }
  
  if (numAmount > validationRules.bidAmount.max) {
    return `Bid amount cannot exceed $${validationRules.bidAmount.max.toLocaleString()}`;
  }
  
  return null;
};

export const validateAuctionDates = (startDate, endDate) => {
  // If both dates are empty, allow backend to set defaults
  if ((!startDate || startDate === '') && (!endDate || endDate === '')) {
    return null;
  }

  // If only one date is provided, that's an error
  if ((startDate && !endDate) || (!startDate && endDate)) {
    return 'Both start and end dates must be provided if setting custom auction dates';
  }

  // If both dates are provided, validate them
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start) || isNaN(end)) {
      return 'Please provide valid start and end dates';
    }

    if (start < now) {
      return 'Start date cannot be in the past';
    }

    if (end <= start) {
      return 'End date must be after start date';
    }
  }

  return null;
};

export const validatePriceComparison = (reservePrice, startingBid) => {
  if (reservePrice && parseFloat(reservePrice) < parseFloat(startingBid)) {
    return 'Reserve price cannot be lower than starting bid';
  }
  return null;
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    if (rule.required && (!data[field] || data[field].toString().trim() === '')) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      continue;
    }
    
    if (data[field] && rule.validate) {
      const error = rule.validate(data[field]);
      if (error) {
        errors[field] = error;
      }
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Auction-specific validation
export const validateAuctionForm = (formData) => {
  const required = ['title', 'description', 'startingBid', 'category', 'auctionType'];
  
  // Check required fields
  const requiredError = validateRequired(required, formData);
  if (requiredError) return requiredError;
  
  // Validate auction dates for timed auctions
  if (formData.auctionType === 'Timed') {
    const dateError = validateAuctionDates(formData.auctionStartDate, formData.auctionEndDate);
    if (dateError) return dateError;
  }
  
  // Validate price comparison
  const priceError = validatePriceComparison(formData.reservePrice, formData.startingBid);
  if (priceError) return priceError;
  
  return null;
};

// Registration form validation
export const validateRegistrationForm = (formData) => {
  const required = ['name', 'email', 'contactNumber', 'password', 'confirmPassword'];
  
  // Check required fields
  const requiredError = validateRequired(required, formData);
  if (requiredError) return requiredError;
  
  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) return emailError;
  
  // Validate phone
  const phoneError = validatePhone(formData.contactNumber);
  if (phoneError) return phoneError;
  
  // Validate password
  const passwordError = validatePassword(formData.password);
  if (passwordError) return passwordError;
  
  // Validate password match
  const matchError = validatePasswordMatch(formData.password, formData.confirmPassword);
  if (matchError) return matchError;
  
  return null;
};
