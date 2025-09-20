import { auditService } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

/**
 * Audit middleware
 * Handles automatic audit logging for API requests
 */

/**
 * Audit middleware for logging API requests
 * @param {string} module - Module name for audit logs
 * @param {string} action - Action name (optional, will be inferred from HTTP method)
 * @returns {Function} Middleware function
 */
export const auditLog = (module, action = null) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override response methods to capture response data
    res.send = function(data) {
      logAuditEntry(req, res, startTime, data, module, action);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logAuditEntry(req, res, startTime, data, module, action);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Log audit entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} startTime - Request start time
 * @param {any} responseData - Response data
 * @param {string} module - Module name
 * @param {string} action - Action name
 */
async function logAuditEntry(req, res, startTime, responseData, module, action) {
  try {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Determine action if not provided
    const auditAction = action || getActionFromMethod(req.method);
    
    // Prepare audit details
    const details = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      requestBody: sanitizeRequestBody(req.body),
      responseData: sanitizeResponseData(responseData),
      params: req.params,
      query: req.query
    };
    
    // Only log significant events (not every GET request)
    if (shouldLogRequest(req, res)) {
      await auditService.createAuditLog({
        userId: req.user?.id || null,
        module,
        action: auditAction,
        details,
        ip: req.ip || req.connection.remoteAddress
      });
    }
  } catch (error) {
    logger.error('Audit logging failed', { 
      error: error.message,
      module,
      action,
      userId: req.user?.id 
    });
  }
}

/**
 * Get action from HTTP method
 * @param {string} method - HTTP method
 * @returns {string} Action name
 */
function getActionFromMethod(method) {
  const methodActions = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  
  return methodActions[method.toUpperCase()] || 'unknown';
}

/**
 * Determine if request should be logged
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} True if should log
 */
function shouldLogRequest(req, res) {
  // Don't log successful GET requests for non-sensitive endpoints
  if (req.method === 'GET' && res.statusCode < 400) {
    const sensitiveEndpoints = ['/auth', '/users', '/roles', '/audit'];
    const isSensitive = sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint));
    
    if (!isSensitive) {
      return false;
    }
  }
  
  // Always log POST, PUT, PATCH, DELETE requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return true;
  }
  
  // Log failed requests
  if (res.statusCode >= 400) {
    return true;
  }
  
  // Log authentication-related requests
  if (req.path.includes('/auth')) {
    return true;
  }
  
  return false;
}

/**
 * Sanitize request body for audit logging
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'mfaSecret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Sanitize response data for audit logging
 * @param {any} data - Response data
 * @returns {any} Sanitized data
 */
function sanitizeResponseData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // For large responses, only log metadata
  if (JSON.stringify(data).length > 1000) {
    return {
      type: 'large_response',
      size: JSON.stringify(data).length,
      keys: Object.keys(data)
    };
  }
  
  return sanitizeRequestBody(data);
}

/**
 * Audit middleware for sensitive operations
 * @param {string} module - Module name
 * @param {string} action - Action name
 * @returns {Function} Middleware function
 */
export const auditSensitive = (module, action) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override response methods to capture response data
    res.send = function(data) {
      logSensitiveAuditEntry(req, res, startTime, data, module, action);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logSensitiveAuditEntry(req, res, startTime, data, module, action);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Log sensitive audit entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} startTime - Request start time
 * @param {any} responseData - Response data
 * @param {string} module - Module name
 * @param {string} action - Action name
 */
async function logSensitiveAuditEntry(req, res, startTime, responseData, module, action) {
  try {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Prepare audit details
    const details = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      requestBody: sanitizeRequestBody(req.body),
      responseData: sanitizeResponseData(responseData),
      params: req.params,
      query: req.query,
      sensitive: true
    };
    
    // Always log sensitive operations
    await auditService.createAuditLog({
      userId: req.user?.id || null,
      module,
      action,
      details,
      ip: req.ip || req.connection.remoteAddress
    });
    
    // Also log as security event
    await auditService.logSecurityEvent(`${module}_${action}`, details, req.ip);
  } catch (error) {
    logger.error('Sensitive audit logging failed', { 
      error: error.message,
      module,
      action,
      userId: req.user?.id 
    });
  }
}

/**
 * Audit middleware for authentication events
 * @param {string} action - Authentication action
 * @returns {Function} Middleware function
 */
export const auditAuth = (action) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override response methods to capture response data
    res.send = function(data) {
      logAuthAuditEntry(req, res, startTime, data, action);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logAuthAuditEntry(req, res, startTime, data, action);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Log authentication audit entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} startTime - Request start time
 * @param {any} responseData - Response data
 * @param {string} action - Authentication action
 */
async function logAuthAuditEntry(req, res, startTime, responseData, action) {
  try {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Prepare audit details
    const details = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      requestBody: sanitizeRequestBody(req.body),
      responseData: sanitizeResponseData(responseData),
      params: req.params,
      query: req.query,
      authEvent: true
    };
    
    // Always log authentication events
    await auditService.logAuthEvent(action, req.user?.id || null, details, req.ip);
  } catch (error) {
    logger.error('Auth audit logging failed', { 
      error: error.message,
      action,
      userId: req.user?.id 
    });
  }
}

/**
 * Audit middleware for user management operations
 * @param {string} action - User management action
 * @returns {Function} Middleware function
 */
export const auditUserManagement = (action) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override response methods to capture response data
    res.send = function(data) {
      logUserManagementAuditEntry(req, res, startTime, data, action);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logUserManagementAuditEntry(req, res, startTime, data, action);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Log user management audit entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} startTime - Request start time
 * @param {any} responseData - Response data
 * @param {string} action - User management action
 */
async function logUserManagementAuditEntry(req, res, startTime, responseData, action) {
  try {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Prepare audit details
    const details = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      requestBody: sanitizeRequestBody(req.body),
      responseData: sanitizeResponseData(responseData),
      params: req.params,
      query: req.query,
      userManagement: true,
      targetUserId: req.params.userId || req.body.userId
    };
    
    // Always log user management operations
    await auditService.createAuditLog({
      userId: req.user?.id || null,
      module: 'user_management',
      action,
      details,
      ip: req.ip || req.connection.remoteAddress
    });
  } catch (error) {
    logger.error('User management audit logging failed', { 
      error: error.message,
      action,
      userId: req.user?.id 
    });
  }
}
