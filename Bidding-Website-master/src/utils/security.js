// Security utilities for the admin panel
export class SecurityManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.init();
  }

  init() {
    // Set up session timeout monitoring
    this.setupSessionTimeout();
    
    // Set up security headers (if running in production)
    this.setupSecurityHeaders();
    
    // Monitor for suspicious activity
    this.setupActivityMonitoring();
  }

  // Session timeout management
  setupSessionTimeout() {
    let lastActivity = Date.now();
    
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check for timeout every minute
    setInterval(() => {
      if (Date.now() - lastActivity > this.sessionTimeout) {
        this.handleSessionTimeout();
      }
    }, 60000);
  }

  handleSessionTimeout() {
    // Clear authentication
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Show timeout message
    alert('Your session has expired due to inactivity. Please log in again.');
    
    // Redirect to login
    window.location.href = '/admin/login';
  }

  // Security headers (for production deployment)
  setupSecurityHeaders() {
    // These would typically be set by the server, but we can add some client-side security measures
    
    // Prevent clickjacking
    if (window.self !== window.top) {
      window.top.location = window.self.location;
    }

    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });

      // Disable F12, Ctrl+Shift+I, Ctrl+U
      document.addEventListener('keydown', (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
          return false;
        }
      });
    }
  }

  // Activity monitoring for suspicious behavior
  setupActivityMonitoring() {
    let rapidClickCount = 0;
    let rapidClickTimer = null;

    document.addEventListener('click', () => {
      rapidClickCount++;
      
      if (rapidClickTimer) {
        clearTimeout(rapidClickTimer);
      }

      rapidClickTimer = setTimeout(() => {
        rapidClickCount = 0;
      }, 1000);

      // If more than 20 clicks per second, flag as suspicious
      if (rapidClickCount > 20) {
        this.flagSuspiciousActivity('rapid_clicking', {
          clickCount: rapidClickCount,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  flagSuspiciousActivity(type, details) {
    
    // In production, you would send this to your backend
    // fetch('/api/admin/security/flag-activity', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, details, timestamp: new Date().toISOString() })
    // });
  }

  // Rate limiting for API calls
  createRateLimiter(maxRequests = 10, timeWindow = 60000) {
    const requests = new Map();

    return (identifier) => {
      const now = Date.now();
      const windowStart = now - timeWindow;

      // Clean old requests
      for (const [key, timestamps] of requests.entries()) {
        requests.set(key, timestamps.filter(time => time > windowStart));
        if (requests.get(key).length === 0) {
          requests.delete(key);
        }
      }

      // Check current requests for this identifier
      const currentRequests = requests.get(identifier) || [];
      
      if (currentRequests.length >= maxRequests) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Add current request
      currentRequests.push(now);
      requests.set(identifier, currentRequests);

      return true;
    };
  }

  // Input sanitization
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate admin permissions
  validateAdminAccess(user) {
    if (!user) {
      throw new Error('No user provided');
    }

    if (user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      throw new Error('Account is suspended or inactive');
    }

    return true;
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Password strength validation
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  }

  calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length >= 16) score += 1;

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }

  // Environment checks
  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }
}

// Create singleton instance
const securityManager = new SecurityManager();

export default securityManager;
