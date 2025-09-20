import { body, query, validationResult } from 'express-validator';
import { userService } from '../services/userService.js';
import { auditService } from '../services/auditService.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, asyncHandler } from '../middlewares/errorMiddleware.js';
import { logger } from '../utils/logger.js';

/**
 * User management controller
 * Handles user CRUD operations and management
 */

/**
 * Get all users with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUsers = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const {
    page = 1,
    limit = 10,
    search = '',
    roleId = null,
    isActive = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const result = await userService.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      roleId,
      isActive: isActive !== null ? isActive === 'true' : null,
      sortBy,
      sortOrder
    });

    sendPaginatedResponse(res, result.users, result.pagination, 'Users retrieved successfully');
  } catch (error) {
    logger.error('Get users failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userService.getUserById(userId);

    // Log user access
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'user_viewed',
      details: { targetUserId: userId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'User retrieved successfully', user);
  } catch (error) {
    logger.error('Get user by ID failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 404);
  }
});

/**
 * Create new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { email, password, firstName, lastName, roleId, isActive = true } = req.body;

  try {
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      roleId,
      isActive
    });

    // Log user creation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'user_created',
      details: { 
        targetUserId: user.id,
        targetUserEmail: user.email,
        roleId: user.roleId
      },
      ip: req.ip
    });

    sendSuccessResponse(res, 'User created successfully', user, 201);
  } catch (error) {
    logger.error('Create user failed', { error: error.message, userData: req.body });
    sendErrorResponse(res, error.message, 400);
  }
});

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { userId } = req.params;
  const updateData = req.body;

  try {
    const user = await userService.updateUser(userId, updateData);

    // Log user update
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'user_updated',
      details: { 
        targetUserId: userId,
        changes: updateData
      },
      ip: req.ip
    });

    sendSuccessResponse(res, 'User updated successfully', user);
  } catch (error) {
    logger.error('Update user failed', { error: error.message, userId, updateData });
    sendErrorResponse(res, error.message, 400);
  }
});

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    await userService.deleteUser(userId);

    // Log user deletion
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'user_deleted',
      details: { targetUserId: userId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'User deleted successfully');
  } catch (error) {
    logger.error('Delete user failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

/**
 * Activate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userService.activateUser(userId);

    // Log user activation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'user_activated',
      details: { targetUserId: userId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'User activated successfully', user);
  } catch (error) {
    logger.error('Activate user failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

/**
 * Deactivate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deactivateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userService.deactivateUser(userId);

    // Log user deactivation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'user_deactivated',
      details: { targetUserId: userId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'User deactivated successfully', user);
  } catch (error) {
    logger.error('Deactivate user failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

/**
 * Get user sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserSessions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const sessions = await userService.getUserSessions(userId);

    sendSuccessResponse(res, 'User sessions retrieved successfully', sessions);
  } catch (error) {
    logger.error('Get user sessions failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Revoke user session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  try {
    await userService.revokeSession(sessionId);

    // Log session revocation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'session_revoked',
      details: { sessionId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Session revoked successfully');
  } catch (error) {
    logger.error('Revoke session failed', { error: error.message, sessionId });
    sendErrorResponse(res, error.message, 400);
  }
});

/**
 * Revoke all user sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const revokeAllSessions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    await userService.revokeAllSessions(userId);

    // Log all sessions revocation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'user_management',
      action: 'all_sessions_revoked',
      details: { targetUserId: userId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'All user sessions revoked successfully');
  } catch (error) {
    logger.error('Revoke all sessions failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

/**
 * Get user statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const stats = await userService.getUserStats(userId);

    sendSuccessResponse(res, 'User statistics retrieved successfully', stats);
  } catch (error) {
    logger.error('Get user stats failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 500);
  }
});

/**
 * Search users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { q: query, limit = 10, roleId = null } = req.query;

  try {
    const users = await userService.searchUsers(query, {
      limit: parseInt(limit),
      roleId
    });

    sendSuccessResponse(res, 'User search completed', users);
  } catch (error) {
    logger.error('Search users failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});

// Validation rules
export const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  query('roleId')
    .optional()
    .isUUID()
    .withMessage('Role ID must be a valid UUID'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'email', 'firstName', 'lastName', 'lastLogin'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

export const createUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('roleId')
    .isUUID()
    .withMessage('Role ID must be a valid UUID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const updateUserValidation = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('roleId')
    .optional()
    .isUUID()
    .withMessage('Role ID must be a valid UUID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const searchUsersValidation = [
  query('q')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query is required and must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('roleId')
    .optional()
    .isUUID()
    .withMessage('Role ID must be a valid UUID')
];
