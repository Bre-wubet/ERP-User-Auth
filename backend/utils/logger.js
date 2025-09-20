import fs from 'fs';
import path from 'path';

/**
 * Custom logger utility for the ERP system
 * Provides structured logging with different levels and file output
 */
class Logger {
  constructor() {
    this.logDir = process.env.LOG_DIR || './logs';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Check if log level should be logged
   * @param {string} level - Log level to check
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {Object} Formatted log object
   */
  formatMessage(level, message, meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta
    };
  }

  /**
   * Write log to file
   * @param {string} filename - Log file name
   * @param {Object} logData - Log data to write
   */
  writeToFile(filename, logData) {
    const filePath = path.join(this.logDir, filename);
    const logLine = JSON.stringify(logData) + '\n';
    
    fs.appendFile(filePath, logLine, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    if (!this.shouldLog('error')) return;

    const logData = this.formatMessage('error', message, meta);
    
    // Console output
    console.error(`[ERROR] ${logData.timestamp}: ${message}`, meta);
    
    // File output
    this.writeToFile('error.log', logData);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;

    const logData = this.formatMessage('warn', message, meta);
    
    // Console output
    console.warn(`[WARN] ${logData.timestamp}: ${message}`, meta);
    
    // File output
    this.writeToFile('warn.log', logData);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;

    const logData = this.formatMessage('info', message, meta);
    
    // Console output
    console.log(`[INFO] ${logData.timestamp}: ${message}`, meta);
    
    // File output
    this.writeToFile('info.log', logData);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;

    const logData = this.formatMessage('debug', message, meta);
    
    // Console output
    console.log(`[DEBUG] ${logData.timestamp}: ${message}`, meta);
    
    // File output
    this.writeToFile('debug.log', logData);
  }

  /**
   * Log authentication events
   * @param {string} event - Authentication event type
   * @param {Object} user - User information
   * @param {Object} meta - Additional metadata
   */
  auth(event, user, meta = {}) {
    const message = `Authentication event: ${event}`;
    const authMeta = {
      event,
      userId: user?.id,
      userEmail: user?.email,
      ...meta
    };

    this.info(message, authMeta);
    this.writeToFile('auth.log', this.formatMessage('info', message, authMeta));
  }

  /**
   * Log security events
   * @param {string} event - Security event type
   * @param {Object} meta - Additional metadata
   */
  security(event, meta = {}) {
    const message = `Security event: ${event}`;
    const securityMeta = {
      event,
      ...meta
    };

    this.warn(message, securityMeta);
    this.writeToFile('security.log', this.formatMessage('warn', message, securityMeta));
  }

  /**
   * Log audit events
   * @param {string} action - Action performed
   * @param {Object} user - User information
   * @param {Object} meta - Additional metadata
   */
  audit(action, user, meta = {}) {
    const message = `Audit: ${action}`;
    const auditMeta = {
      action,
      userId: user?.id,
      userEmail: user?.email,
      ...meta
    };

    this.info(message, auditMeta);
    this.writeToFile('audit.log', this.formatMessage('info', message, auditMeta));
  }

  /**
   * Log HTTP requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in ms
   */
  http(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id
    };

    const message = `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
    
    if (res.statusCode >= 400) {
      this.warn(message, logData);
    } else {
      this.info(message, logData);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
