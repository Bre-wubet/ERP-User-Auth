import { query, validationResult } from 'express-validator';
import { auditService } from '../services/auditService.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, asyncHandler } from '../middlewares/errorMiddleware.js';
import { logger } from '../utils/logger.js';

/**
 * Audit controller
 * Handles audit logging and security tracking operations
 */

/**
 * Get audit logs with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const {
    page = 1,
    limit = 50,
    userId = null,
    module = null,
    action = null,
    startDate = null,
    endDate = null,
    ip = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const result = await auditService.getAuditLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      module,
      action,
      startDate,
      endDate,
      ip,
      sortBy,
      sortOrder
    });

    sendPaginatedResponse(res, result.auditLogs, result.pagination, 'Audit logs retrieved successfully');
  } catch (error) {
    logger.error('Get audit logs failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Get audit log by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAuditLogById = asyncHandler(async (req, res) => {
  const { auditLogId } = req.params;

  try {
    const auditLog = await auditService.getAuditLogById(auditLogId);

    // Log audit log access
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'audit',
      action: 'audit_log_viewed',
      details: { auditLogId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Audit log retrieved successfully', auditLog);
  } catch (error) {
    logger.error('Get audit log by ID failed', { error: error.message, auditLogId });
    sendErrorResponse(res, error.message, 404);
  }
});

/**
 * Get audit logs for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserAuditLogs = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { userId } = req.params;
  const {
    page = 1,
    limit = 50,
    module = null,
    action = null,
    startDate = null,
    endDate = null
  } = req.query;

  try {
    const result = await auditService.getUserAuditLogs(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      module,
      action,
      startDate,
      endDate
    });

    // Log user audit logs access
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'audit',
      action: 'user_audit_logs_viewed',
      details: { targetUserId: userId },
      ip: req.ip
    });

    sendPaginatedResponse(res, result.auditLogs, result.pagination, 'User audit logs retrieved successfully');
  } catch (error) {
    logger.error('Get user audit logs failed', { error: error.message, userId, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Get audit logs for a specific module
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getModuleAuditLogs = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { module } = req.params;
  const {
    page = 1,
    limit = 50,
    action = null,
    startDate = null,
    endDate = null
  } = req.query;

  try {
    const result = await auditService.getModuleAuditLogs(module, {
      page: parseInt(page),
      limit: parseInt(limit),
      action,
      startDate,
      endDate
    });

    // Log module audit logs access
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'audit',
      action: 'module_audit_logs_viewed',
      details: { targetModule: module },
      ip: req.ip
    });

    sendPaginatedResponse(res, result.auditLogs, result.pagination, 'Module audit logs retrieved successfully');
  } catch (error) {
    logger.error('Get module audit logs failed', { error: error.message, module, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Get audit statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAuditStats = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const {
    startDate = null,
    endDate = null,
    module = null
  } = req.query;

  try {
    const stats = await auditService.getAuditStats({
      startDate,
      endDate,
      module
    });

    // Log audit stats access
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'audit',
      action: 'audit_stats_viewed',
      details: { startDate, endDate, module },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Audit statistics retrieved successfully', stats);
  } catch (error) {
    logger.error('Get audit stats failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Search audit logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchAuditLogs = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { q: query, limit = 50, module = null } = req.query;

  try {
    const auditLogs = await auditService.searchAuditLogs(query, {
      limit: parseInt(limit),
      module
    });

    // Log audit search
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'audit',
      action: 'audit_logs_searched',
      details: { query, module },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Audit log search completed', auditLogs);
  } catch (error) {
    logger.error('Search audit logs failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Get available modules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAvailableModules = asyncHandler(async (req, res) => {
  try {
    const modules = await auditService.getAvailableModules();

    sendSuccessResponse(res, 'Available modules retrieved successfully', modules);
  } catch (error) {
    logger.error('Get available modules failed', { error: error.message });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Get available actions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAvailableActions = asyncHandler(async (req, res) => {
  try {
    const actions = await auditService.getAvailableActions();

    sendSuccessResponse(res, 'Available actions retrieved successfully', actions);
  } catch (error) {
    logger.error('Get available actions failed', { error: error.message });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Clean up old audit logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const cleanupOldLogs = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { daysToKeep = 90 } = req.body;

  try {
    const deletedCount = await auditService.cleanupOldLogs(daysToKeep);

    // Log cleanup operation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'audit',
      action: 'audit_logs_cleaned',
      details: { daysToKeep, deletedCount },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Old audit logs cleaned up successfully', { deletedCount });
  } catch (error) {
    logger.error('Cleanup old logs failed', { error: error.message, daysToKeep });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Export audit logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportAuditLogs = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const {
    userId = null,
    module = null,
    action = null,
    startDate = null,
    endDate = null,
    format = 'json'
  } = req.query;

  try {
    // Get audit logs (without pagination for export)
    const result = await auditService.getAuditLogs({
      userId,
      module,
      action,
      startDate,
      endDate,
      page: 1,
      limit: 10000, // Large limit for export
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // Log export operation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'audit',
      action: 'audit_logs_exported',
      details: { 
        userId, 
        module, 
        action, 
        startDate, 
        endDate, 
        format,
        recordCount: result.auditLogs.length
      },
      ip: req.ip
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(result.auditLogs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      res.send(csvData);
    } else {
      // Return JSON format
      sendSuccessResponse(res, 'Audit logs exported successfully', {
        logs: result.auditLogs,
        total: result.auditLogs.length,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Export audit logs failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Convert audit logs to CSV format
 * @param {Array} auditLogs - Audit logs array
 * @returns {string} CSV data
 */
function convertToCSV(auditLogs) {
  if (auditLogs.length === 0) {
    return 'No data available';
  }

  const headers = [
    'ID',
    'User ID',
    'User Email',
    'Module',
    'Action',
    'Details',
    'IP Address',
    'Created At'
  ];

  const rows = auditLogs.map(log => [
    log.id,
    log.user?.id || '',
    log.user?.email || '',
    log.module,
    log.action,
    JSON.stringify(log.details),
    log.ip || '',
    log.createdAt.toISOString()
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

// Validation rules
export const getAuditLogsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('userId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('User ID must be provided'),
  query('module')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Module must be less than 50 characters'),
  query('action')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Action must be less than 100 characters'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('ip')
    .optional()
    .isIP()
    .withMessage('IP must be a valid IP address'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'module', 'action'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

export const getUserAuditLogsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('module')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Module must be less than 50 characters'),
  query('action')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Action must be less than 100 characters'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

export const getModuleAuditLogsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('action')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Action must be less than 100 characters'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

export const getAuditStatsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('module')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Module must be less than 50 characters')
];

export const searchAuditLogsValidation = [
  query('q')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query is required and must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('module')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Module must be less than 50 characters')
];

export const cleanupOldLogsValidation = [
  query('daysToKeep')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days to keep must be between 1 and 365')
];

export const exportAuditLogsValidation = [
  query('userId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('User ID must be provided'),
  query('module')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Module must be less than 50 characters'),
  query('action')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Action must be less than 100 characters'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv')
];
