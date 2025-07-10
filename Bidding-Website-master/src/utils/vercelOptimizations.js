/**
 * Vercel-specific optimizations for preventing infinite loops and improving performance
 * These utilities help prevent the infinite loop issues in serverless environments
 */

// Debounce function optimized for Vercel serverless environment
export const vercelDebounce = (func, delay = 2000) => {
  let timeoutId;
  let lastCall = 0;
  
  return function (...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // If enough time has passed, execute immediately
    if (timeSinceLastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
    
    // Otherwise, schedule for later
    timeoutId = setTimeout(() => {
      lastCall = Date.now();
      func.apply(this, args);
    }, delay - timeSinceLastCall);
  };
};

// Stable object comparison for preventing unnecessary re-renders
export const isStableEqual = (obj1, obj2, keys = null) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keysToCheck = keys || Object.keys(obj1);
  
  for (const key of keysToCheck) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
};

// Create stable filter key for preventing unnecessary API calls
export const createFilterKey = (filters) => {
  const relevantKeys = ['search', 'status', 'assignedTo', 'dateFrom', 'dateTo', 'page', 'limit'];
  return relevantKeys.map(key => `${key}:${filters[key] || ''}`).join('|');
};

// Rate limiter for API calls in Vercel environment
export class VercelRateLimiter {
  constructor(minInterval = 2000) {
    this.minInterval = minInterval;
    this.lastCall = 0;
    this.pending = null;
  }
  
  async execute(asyncFunction) {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    // If we have a pending call, return it
    if (this.pending) {
      return this.pending;
    }
    
    // If enough time has passed, execute immediately
    if (timeSinceLastCall >= this.minInterval) {
      this.lastCall = now;
      return asyncFunction();
    }
    
    // Otherwise, wait and then execute
    const waitTime = this.minInterval - timeSinceLastCall;
    this.pending = new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          this.lastCall = Date.now();
          const result = await asyncFunction();
          this.pending = null;
          resolve(result);
        } catch (error) {
          this.pending = null;
          reject(error);
        }
      }, waitTime);
    });
    
    return this.pending;
  }
}

// Console logger with component identification for debugging in Vercel
export const createVercelLogger = (componentName) => {
  const componentId = `${componentName}-${Date.now()}`;
  
  return {
    log: (message, data = null) => {
      console.log(`🔧 [${componentId}] ${message}`, data || '');
    },
    warn: (message, data = null) => {
      console.warn(`⚠️ [${componentId}] ${message}`, data || '');
    },
    error: (message, data = null) => {
      console.error(`❌ [${componentId}] ${message}`, data || '');
    }
  };
};
