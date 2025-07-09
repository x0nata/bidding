// Simple audit logging utility for admin actions
class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 logs in memory
  }

  // Log admin actions
  logAction(action, details = {}) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      action,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('admin_audit_logs', JSON.stringify(this.logs.slice(0, 50)));
    } catch (error) {
    }

  }

  // Get all logs
  getLogs() {
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('admin_audit_logs');
  }

  // Load logs from localStorage
  loadLogs() {
    try {
      const storedLogs = localStorage.getItem('admin_audit_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
    }
  }

  // Common admin actions to log
  static ACTIONS = {
    LOGIN: 'ADMIN_LOGIN',
    LOGOUT: 'ADMIN_LOGOUT',
    USER_VIEW: 'USER_VIEWED',
    USER_EDIT: 'USER_EDITED',
    USER_SUSPEND: 'USER_SUSPENDED',
    USER_ACTIVATE: 'USER_ACTIVATED',
    USER_DELETE: 'USER_DELETED',
    PRODUCT_APPROVE: 'PRODUCT_APPROVED',
    PRODUCT_REJECT: 'PRODUCT_REJECTED',
    PRODUCT_DELETE: 'PRODUCT_DELETED',
    BULK_ACTION: 'BULK_ACTION_PERFORMED',
    SYSTEM_ACCESS: 'SYSTEM_ACCESSED'
  };
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Load existing logs on initialization
auditLogger.loadLogs();

export { AuditLogger };
export default auditLogger;
