import fs from 'fs';
import path from 'path';

/**
 * Custom logger utility for the ERP system
 * Provides structured logging with different levels and file output
 */

// Configuration constants
const LOG_DIR = process.env.LOG_DIR || './logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Ensure log directory exists
const ensureLogDirectory = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

ensureLogDirectory();

const shouldLog = (level) => {
  return LEVELS[level] <= LEVELS[LOG_LEVEL];
};

const formatMessage = (level, message, meta = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...meta
  };
};

const writeToFile = (filename, logData) => {
  const filePath = path.join(LOG_DIR, filename);
  const logLine = JSON.stringify(logData) + '\n';
  
  fs.appendFile(filePath, logLine, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

export const error = (message, meta = {}) => {
  if (!shouldLog('error')) return;

  const logData = formatMessage('error', message, meta);
  
  // Console output
  console.error(`[ERROR] ${logData.timestamp}: ${message}`, meta);
  
  // File output
  writeToFile('error.log', logData);
};

export const warn = (message, meta = {}) => {
  if (!shouldLog('warn')) return;

  const logData = formatMessage('warn', message, meta);
  
  // Console output
  console.warn(`[WARN] ${logData.timestamp}: ${message}`, meta);
  
  // File output
  writeToFile('warn.log', logData);
};

export const info = (message, meta = {}) => {
  if (!shouldLog('info')) return;

  const logData = formatMessage('info', message, meta);
  
  // Console output
  console.log(`[INFO] ${logData.timestamp}: ${message}`, meta);
  
  // File output
  writeToFile('info.log', logData);
};

export const debug = (message, meta = {}) => {
  if (!shouldLog('debug')) return;

  const logData = formatMessage('debug', message, meta);
  
  // Console output
  console.log(`[DEBUG] ${logData.timestamp}: ${message}`, meta);
  
  // File output
  writeToFile('debug.log', logData);
};

export const auth = (event, user, meta = {}) => {
  const message = `Authentication event: ${event}`;
  const authMeta = {
    event,
    userId: user?.id,
    userEmail: user?.email,
    ...meta
  };

  info(message, authMeta);
  writeToFile('auth.log', formatMessage('info', message, authMeta));
};

export const security = (event, meta = {}) => {
  const message = `Security event: ${event}`;
  const securityMeta = {
    event,
    ...meta
  };

  warn(message, securityMeta);
  writeToFile('security.log', formatMessage('warn', message, securityMeta));
};

export const audit = (action, user, meta = {}) => {
  const message = `Audit: ${action}`;
  const auditMeta = {
    action,
    userId: user?.id,
    userEmail: user?.email,
    ...meta
  };

  info(message, auditMeta);
  writeToFile('audit.log', formatMessage('info', message, auditMeta));
};

export const http = (req, res, responseTime) => {
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
    warn(message, logData);
  } else {
    info(message, logData);
  }
};
// Export all functions as named exports
export default {
  error,
  warn,
  info,
  debug,
  auth,
  security,
  audit,
  http
};
