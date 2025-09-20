import { body, query, validationResult } from 'express-validator';
import { roleService } from '../services/roleService.js';
import { auditService } from '../services/auditService.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, asyncHandler } from '../middlewares/errorMiddleware.js';
import { logger } from '../utils/logger.js';



export const getRoles = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const {
    page = 1,
    limit = 10,
    search = '',
    scope = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const result = await roleService.getRoles({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      scope,
      sortBy,
      sortOrder
    });

    sendPaginatedResponse(res, result.roles, result.pagination, 'Roles retrieved successfully');
  } catch (error) {
    logger.error('Get roles failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});


export const getRoleById = asyncHandler(async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await roleService.getRoleById(roleId);

    // Log role access
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'role_management',
      action: 'role_viewed',
      details: { roleId, roleName: role.name },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Role retrieved successfully', role);
  } catch (error) {
    logger.error('Get role by ID failed', { error: error.message, roleId });
    sendErrorResponse(res, error.message, 404);
  }
});


export const createRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { name, scope } = req.body;

  try {
    const role = await roleService.createRole({ name, scope });

    // Log role creation
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'role_management',
      action: 'role_created',
      details: { 
        roleId: role.id,
        roleName: role.name,
        scope: role.scope
      },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Role created successfully', role, 201);
  } catch (error) {
    logger.error('Create role failed', { error: error.message, roleData: req.body });
    sendErrorResponse(res, error.message, 400);
  }
});


export const updateRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { roleId } = req.params;
  const updateData = req.body;

  try {
    const role = await roleService.updateRole(roleId, updateData);

    // Log role update
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'role_management',
      action: 'role_updated',
      details: { 
        roleId,
        roleName: role.name,
        changes: updateData
      },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Role updated successfully', role);
  } catch (error) {
    logger.error('Update role failed', { error: error.message, roleId, updateData });
    sendErrorResponse(res, error.message, 400);
  }
});


export const deleteRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;

  try {
    await roleService.deleteRole(roleId);

    // Log role deletion
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'role_management',
      action: 'role_deleted',
      details: { roleId },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Role deleted successfully');
  } catch (error) {
    logger.error('Delete role failed', { error: error.message, roleId });
    sendErrorResponse(res, error.message, 400);
  }
});


export const assignRoleToUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { userId, roleId } = req.body;

  try {
    const user = await roleService.assignRoleToUser(userId, roleId);

    // Log role assignment
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'role_management',
      action: 'role_assigned',
      details: { 
        targetUserId: userId,
        roleId,
        roleName: user.role.name
      },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Role assigned successfully', user);
  } catch (error) {
    logger.error('Assign role failed', { error: error.message, userId, roleId });
    sendErrorResponse(res, error.message, 400);
  }
});


export const removeRoleFromUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { userId, defaultRoleId } = req.body;

  try {
    const user = await roleService.removeRoleFromUser(userId, defaultRoleId);

    // Log role removal
    await auditService.createAuditLog({
      userId: req.user.id,
      module: 'role_management',
      action: 'role_removed',
      details: { 
        targetUserId: userId,
        defaultRoleId,
        defaultRoleName: user.role.name
      },
      ip: req.ip
    });

    sendSuccessResponse(res, 'Role removed successfully', user);
  } catch (error) {
    logger.error('Remove role failed', { error: error.message, userId, defaultRoleId });
    sendErrorResponse(res, error.message, 400);
  }
});


export const getRoleStats = asyncHandler(async (req, res) => {
  try {
    const stats = await roleService.getRoleStats();

    sendSuccessResponse(res, 'Role statistics retrieved successfully', stats);
  } catch (error) {
    logger.error('Get role stats failed', { error: error.message });
    sendErrorResponse(res, error.message, 500);
  }
});


export const searchRoles = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { q: query, limit = 10, scope = null } = req.query;

  try {
    const roles = await roleService.searchRoles(query, {
      limit: parseInt(limit),
      scope
    });

    sendSuccessResponse(res, 'Role search completed', roles);
  } catch (error) {
    logger.error('Search roles failed', { error: error.message, query: req.query });
    sendErrorResponse(res, error.message, 500);
  }
});


export const getAvailableScopes = asyncHandler(async (req, res) => {
  try {
    const scopes = await roleService.getAvailableScopes();

    sendSuccessResponse(res, 'Available scopes retrieved successfully', scopes);
  } catch (error) {
    logger.error('Get available scopes failed', { error: error.message });
    sendErrorResponse(res, error.message, 500);
  }
});


export const checkUserRole = asyncHandler(async (req, res) => {
  const { userId, roleName } = req.params;

  try {
    const hasRole = await roleService.userHasRole(userId, roleName);

    sendSuccessResponse(res, 'Role check completed', { hasRole });
  } catch (error) {
    logger.error('Check user role failed', { error: error.message, userId, roleName });
    sendErrorResponse(res, error.message, 500);
  }
});

  
export const checkUserRoleScope = asyncHandler(async (req, res) => {
  const { userId, scope } = req.params;

  try {
    const hasRoleInScope = await roleService.userHasRoleInScope(userId, scope);

    sendSuccessResponse(res, 'Role scope check completed', { hasRoleInScope });
  } catch (error) {
    logger.error('Check user role scope failed', { error: error.message, userId, scope });
    sendErrorResponse(res, error.message, 500);
  }
});

// Validation rules
export const getRolesValidation = [
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
  query('scope')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Scope must be less than 50 characters'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'scope'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

export const createRoleValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Role name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Role name can only contain letters, numbers, underscores, and hyphens'),
  body('scope')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Scope must be less than 50 characters')
];

export const updateRoleValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Role name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Role name can only contain letters, numbers, underscores, and hyphens'),
  body('scope')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Scope must be less than 50 characters')
];

export const assignRoleValidation = [
  body('userId')
    .isLength({ min: 1 })
    .withMessage('User ID must be provided'),
  body('roleId')
    .isLength({ min: 1 })
    .withMessage('Role ID must be provided')
];

export const removeRoleValidation = [
  body('userId')
    .isLength({ min: 1 })
    .withMessage('User ID must be provided'),
  body('defaultRoleId')
    .isLength({ min: 1 })
    .withMessage('Default role ID must be provided')
];

export const searchRolesValidation = [
  query('q')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query is required and must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('scope')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Scope must be less than 50 characters')
];
