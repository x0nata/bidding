// Audit logging service for admin actions
class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
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
      sessionId: this.getSessionId()
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage for persistence
    this.persistLogs();

    // In production, you would also send this to your backend
    this.sendToBackend(logEntry);

  }

  // Get session ID (simplified version)
  getSessionId() {
    let sessionId = sessionStorage.getItem('adminSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('adminSessionId', sessionId);
    }
    return sessionId;
  }

  // Persist logs to localStorage
  persistLogs() {
    try {
      localStorage.setItem('adminAuditLogs', JSON.stringify(this.logs.slice(0, 100))); // Store only 100 most recent
    } catch (error) {
    }
  }

  // Load logs from localStorage
  loadPersistedLogs() {
    try {
      const persistedLogs = localStorage.getItem('adminAuditLogs');
      if (persistedLogs) {
        this.logs = JSON.parse(persistedLogs);
      }
    } catch (error) {
    }
  }

  // Send log to backend (placeholder)
  async sendToBackend(logEntry) {
    try {
      // In production, implement actual API call
      // await fetch('/api/admin/audit-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      //   credentials: 'include'
      // });
    } catch (error) {
    }
  }

  // Get all logs
  getLogs(limit = 50) {
    return this.logs.slice(0, limit);
  }

  // Get logs by action type
  getLogsByAction(action, limit = 50) {
    return this.logs.filter(log => log.action === action).slice(0, limit);
  }

  // Get logs by date range
  getLogsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('adminAuditLogs');
    this.logAction('AUDIT_LOGS_CLEARED', { reason: 'Manual clear by admin' });
  }

  // Export logs as JSON
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    this.logAction('AUDIT_LOGS_EXPORTED', { exportDate: new Date().toISOString() });
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
    CERTIFICATE_APPROVE: 'CERTIFICATE_APPROVED',
    CERTIFICATE_REJECT: 'CERTIFICATE_REJECTED',
    BULK_ACTION: 'BULK_ACTION_PERFORMED',
    SETTINGS_CHANGE: 'SETTINGS_CHANGED',
    SYSTEM_ACCESS: 'SYSTEM_ACCESSED'
  };
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Load persisted logs on initialization
auditLogger.loadPersistedLogs();

// Log initial system access
auditLogger.logAction(AuditLogger.ACTIONS.SYSTEM_ACCESS, {
  page: 'Admin Dashboard',
  timestamp: new Date().toISOString()
});

export default auditLogger;
export { AuditLogger };
