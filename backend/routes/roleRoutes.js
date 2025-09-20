import express from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getRoleStats,
  searchRoles,
  getAvailableScopes,
  checkUserRole,
  checkUserRoleScope,
  getRolesValidation,
  createRoleValidation,
  updateRoleValidation,
  assignRoleValidation,
  removeRoleValidation,
  searchRolesValidation
} from '../controllers/roleController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRole, requireAdmin } from '../middlewares/roleMiddleware.js';
import { auditLog } from '../middlewares/auditMiddleware.js';

const router = express.Router();

/**
 * Role management routes
 * Handles role-based access control operations
 */

// Public route for registration - get available roles
router.get('/public', getRoles);

// All other routes require authentication
router.use(verifyToken);

// Get all roles (admin/manager/hr only)
router.get('/', 
  requireRole(['admin', 'manager', 'hr']),
  getRolesValidation,
  auditLog('role_management', 'roles_listed'),
  getRoles
);

// Search roles (admin/manager/hr only)
router.get('/search', 
  requireRole(['admin', 'manager', 'hr']),
  searchRolesValidation,
  auditLog('role_management', 'roles_searched'),
  searchRoles
);

// Get available scopes (admin/manager/hr only)
router.get('/scopes', 
  requireRole(['admin', 'manager', 'hr']),
  auditLog('role_management', 'scopes_viewed'),
  getAvailableScopes
);

// Get role statistics (admin only)
router.get('/stats', 
  requireAdmin,
  auditLog('role_management', 'role_stats_viewed'),
  getRoleStats
);

// Create new role (admin only)
router.post('/', 
  requireAdmin,
  createRoleValidation,
  auditLog('role_management', 'role_created'),
  createRole
);

// Get role by ID (admin/manager/hr only)
router.get('/:roleId', 
  requireRole(['admin', 'manager', 'hr']),
  auditLog('role_management', 'role_viewed'),
  getRoleById
);

// Update role (admin only)
router.put('/:roleId', 
  requireAdmin,
  updateRoleValidation,
  auditLog('role_management', 'role_updated'),
  updateRole
);

// Delete role (admin only)
router.delete('/:roleId', 
  requireAdmin,
  auditLog('role_management', 'role_deleted'),
  deleteRole
);

// Assign role to user (admin/manager/hr only)
router.post('/assign', 
  requireRole(['admin', 'manager', 'hr']),
  assignRoleValidation,
  auditLog('role_management', 'role_assigned'),
  assignRoleToUser
);

// Remove role from user (admin/manager/hr only)
router.post('/remove', 
  requireRole(['admin', 'manager', 'hr']),
  removeRoleValidation,
  auditLog('role_management', 'role_removed'),
  removeRoleFromUser
);

// Check if user has specific role (admin/manager/hr only)
router.get('/check/:userId/:roleName', 
  requireRole(['admin', 'manager', 'hr']),
  auditLog('role_management', 'role_check'),
  checkUserRole
);

// Check if user has role in specific scope (admin/manager/hr only)
router.get('/check-scope/:userId/:scope', 
  requireRole(['admin', 'manager', 'hr']),
  auditLog('role_management', 'role_scope_check'),
  checkUserRoleScope
);

export default router;
