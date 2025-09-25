import logger from '../utils/logger.js';

/**
 * Error handling middleware
 * Provides centralized error handling and logging
 */

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Unique constraint violation';
    error = { message, statusCode: 409 };
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = { message, statusCode: 404 };
  }

  if (err.code === 'P2003') {
    const message = 'Foreign key constraint violation';
    error = { message, statusCode: 400 };
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    const message = 'Too many requests';
    error = { message, statusCode: 429 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  
  logger.warn('404 Not Found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  next(error);
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const validationErrorHandler = (req, res, next) => {
  const errors = req.validationErrors?.() || [];
  
  if (errors.length > 0) {
    const errorMessages = errors.map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation error', {
      errors: errorMessages,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};

export const securityErrorHandler = (err, req, res, next) => {
  // Log security-related errors
  if (err.statusCode === 401 || err.statusCode === 403) {
    logger.security('security_error', {
      error: err.message,
      statusCode: err.statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
  }

  next(err);
};

export const databaseErrorHandler = (err, req, res, next) => {
  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    logger.error('Database connection error', {
      error: err.message,
      code: err.code,
      url: req.url,
      method: req.method
    });

    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable'
    });
  }

  // Handle database timeout errors
  if (err.code === 'ETIMEDOUT') {
    logger.error('Database timeout error', {
      error: err.message,
      code: err.code,
      url: req.url,
      method: req.method
    });

    return res.status(504).json({
      success: false,
      message: 'Request timeout'
    });
  }

  next(err);
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}


export const createError = (message, statusCode = 500) => {
  return new AppError(message, statusCode);
};

export const handleError = (type, message, statusCode = 500) => {
  return (req, res, next) => {
    const error = new AppError(message, statusCode);
    error.type = type;
    next(error);
  };
};

export const sendErrorResponse = (res, message, statusCode = 500, details = {}) => {
  logger.error('Error response sent', {
    message,
    statusCode,
    details
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...details
  });
};

export const sendSuccessResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export const sendPaginatedResponse = (res, data, pagination, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};
