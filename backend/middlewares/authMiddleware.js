import { jwtUtils } from '../utils/jwtUtils.js';
import { authService } from '../services/authService.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware
 * Handles JWT token verification and user authentication
 */

/**
 * Verify JWT access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format'
      });
    }

    // Verify token
    const decoded = jwtUtils.verifyAccessToken(token);
    
    // Check if token is expired
    if (jwtUtils.isTokenExpired(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    // Get user with role information from database
    const { db } = await import('../config/db.js');
    const user = await db.client.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      role: user.role || { name: decoded.roleName }
    };

    next();
  } catch (error) {
    logger.error('Token verification failed', { 
      error: error.message, 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Verify session token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const verifySession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Session token required'
      });
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format'
      });
    }

    // Verify session
    const session = await authService.verifySession(token);
    
    // Attach user info to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      roleId: session.user.roleId,
      role: session.user.role || { name: null }
    };
    req.session = session;

    next();
  } catch (error) {
    logger.error('Session verification failed', { 
      error: error.message, 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session'
    });
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    try {
      const decoded = jwtUtils.verifyAccessToken(token);
      
      if (!jwtUtils.isTokenExpired(token)) {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          roleId: decoded.roleId
        };
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Verify API token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const verifyApiToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'API token required'
      });
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format'
      });
    }

    // Verify API token
    const decoded = jwtUtils.verifyApiToken(token);
    
    // Attach API token info to request
    req.apiToken = decoded;

    next();
  } catch (error) {
    logger.error('API token verification failed', { 
      error: error.message, 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired API token'
    });
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const authRateLimit = (req, res, next) => {
  // This would typically use a rate limiting library like express-rate-limit
  // For now, we'll implement a simple in-memory rate limiter
  
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // Initialize rate limit store if it doesn't exist
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const key = `auth_${ip}`;
  const attempts = global.rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

  // Reset if window has passed
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    logger.security('rate_limit_exceeded', { ip, attempts: attempts.count });
    
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil((attempts.resetTime - now) / 1000)
    });
  }

  // Increment attempt count
  attempts.count++;
  global.rateLimitStore.set(key, attempts);

  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': maxAttempts,
    'X-RateLimit-Remaining': Math.max(0, maxAttempts - attempts.count),
    'X-RateLimit-Reset': new Date(attempts.resetTime).toISOString()
  });

  next();
};

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

/**
 * Check if user is active
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const requireActiveUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is active (this would typically be done in the token verification)
    // For now, we'll assume the user is active if they have a valid token
    next();
  } catch (error) {
    logger.error('Active user check failed', { error: error.message, userId: req.user?.id });
    
    return res.status(401).json({
      success: false,
      message: 'User account is not active'
    });
  }
};

/**
 * Log authentication attempts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const logAuthAttempt = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log authentication attempt
    const isSuccess = res.statusCode < 400;
    const event = isSuccess ? 'auth_success' : 'auth_failed';
    
    logger.auth(event, req.user || { email: req.body?.email }, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode
    });
    
    originalSend.call(this, data);
  };
  
  next();
};
