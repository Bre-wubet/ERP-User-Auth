import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  getUserStats,
  searchUsers,
  getUsersValidation,
  createUserValidation,
  updateUserValidation,
  searchUsersValidation
} from '../controllers/userController.js';
import { verifyToken, requireAuth } from '../middlewares/authMiddleware.js';
import { requireUserManagement, requireOwnerOrAdmin, requireRole } from '../middlewares/roleMiddleware.js';
import { auditUserManagement } from '../middlewares/auditMiddleware.js';

const router = express.Router();

/**
 * User management routes
 * Handles user CRUD operations and management
 */

// All routes require authentication
router.use(verifyToken);

// Debug endpoint to check user role (remove in production)
router.get('/debug/me', (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      canManageUsers: ['admin', 'manager', 'hr'].includes(req.user.role?.name)
    }
  });
});

// Get all users (admin/manager/hr only)
router.get('/', 
  requireUserManagement,
  getUsersValidation,
  auditUserManagement('users_listed'),
  getUsers
);

// Search users (admin/manager/hr only)
router.get('/search', 
  requireUserManagement,
  searchUsersValidation,
  auditUserManagement('users_searched'),
  searchUsers
);

// Create new user (admin/manager/hr only)
router.post('/', 
  requireUserManagement,
  createUserValidation,
  auditUserManagement('user_created'),
  createUser
);

// Get user by ID (owner or admin/manager/hr)
router.get('/:userId', 
  requireOwnerOrAdmin('userId'),
  auditUserManagement('user_viewed'),
  getUserById
);

// Update user (owner or admin/manager/hr)
router.put('/:userId', 
  requireOwnerOrAdmin('userId'),
  updateUserValidation,
  auditUserManagement('user_updated'),
  updateUser
);

// Delete user (admin only)
router.delete('/:userId', 
  requireRole(['admin']),
  auditUserManagement('user_deleted'),
  deleteUser
);

// Activate user (admin/manager/hr only)
router.patch('/:userId/activate', 
  requireUserManagement,
  auditUserManagement('user_activated'),
  activateUser
);

// Deactivate user (admin/manager/hr only)
router.patch('/:userId/deactivate', 
  requireUserManagement,
  auditUserManagement('user_deactivated'),
  deactivateUser
);

// Get user sessions (owner or admin/manager/hr)
router.get('/:userId/sessions', 
  requireOwnerOrAdmin('userId'),
  auditUserManagement('user_sessions_viewed'),
  getUserSessions
);

// Revoke user session (owner or admin/manager/hr)
router.delete('/sessions/:sessionId', 
  requireUserManagement,
  auditUserManagement('session_revoked'),
  revokeSession
);

// Revoke all user sessions (admin/manager/hr only)
router.delete('/:userId/sessions', 
  requireUserManagement,
  auditUserManagement('all_sessions_revoked'),
  revokeAllSessions
);

// Get user statistics (owner or admin/manager/hr)
router.get('/:userId/stats', 
  requireOwnerOrAdmin('userId'),
  auditUserManagement('user_stats_viewed'),
  getUserStats
);

export default router;
