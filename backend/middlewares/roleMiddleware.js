import { roleService } from '../services/roleService.js';
import { logger } from '../utils/logger.js';

/**
 * Role-based access control middleware
 * Handles role and permission checking
 */

export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role?.name || req.user.role || null;
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      if (!requiredRoles.includes(userRole)) {
        logger.security('insufficient_role', req.user, {
          requiredRoles,
          userRole,
          ip: req.ip,
          endpoint: req.path
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredRoles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      logger.error('Role check failed', { 
        error: error.message, 
        userId: req.user?.id,
        roles 
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

export const requireScope = (scope) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userScope = req.user.role?.scope;
      
      // Global scope (null) has access to everything
      if (userScope === null || userScope === scope) {
        return next();
      }

      logger.security('insufficient_scope', req.user, {
        requiredScope: scope,
        userScope,
        ip: req.ip,
        endpoint: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient scope permissions',
        required: scope,
        current: userScope
      });
    } catch (error) {
      logger.error('Scope check failed', { 
        error: error.message, 
        userId: req.user?.id,
        scope 
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

export const requireAnyRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role?.name || req.user.role || null;

      if (!roles.includes(userRole)) {
        logger.security('insufficient_role_any', req.user, {
          allowedRoles: roles,
          userRole,
          ip: req.ip,
          endpoint: req.path
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          allowed: roles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      logger.error('Any role check failed', { 
        error: error.message, 
        userId: req.user?.id,
        roles 
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role?.name || req.user.role;

    if (userRole !== 'admin') {
      logger.security('admin_required', req.user, {
        ip: req.ip,
        endpoint: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin check failed', { 
      error: error.message, 
      userId: req.user?.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const requireOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role?.name || req.user.role || null;
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

      // Admin can access everything
      if (userRole === 'admin') {
        return next();
      }

      // User can only access their own resources
      if (req.user.id === resourceUserId) {
        return next();
      }

      logger.security('resource_access_denied', req.user, {
        resourceUserId,
        ip: req.ip,
        endpoint: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    } catch (error) {
      logger.error('Owner or admin check failed', { 
        error: error.message, 
        userId: req.user?.id,
        resourceUserIdField 
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

export const requireUserManagement = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role?.name || req.user.role || null;
    const allowedRoles = ['admin', 'manager', 'hr'];

    // Debug logging
    logger.info('User management check', {
      userId: req.user.id,
      userRole,
      allowedRoles,
      userObject: req.user,
      endpoint: req.path
    });

    if (!allowedRoles.includes(userRole)) {
      logger.security('user_management_denied', req.user, {
        ip: req.ip,
        endpoint: req.path,
        userRole,
        allowedRoles
      });

      return res.status(403).json({
        success: false,
        message: 'User management access required',
        debug: {
          userRole,
          allowedRoles,
          userObject: req.user
        }
      });
    }

    next();
  } catch (error) {
    logger.error('User management check failed', { 
      error: error.message, 
      userId: req.user?.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const requireAuditAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role?.name || req.user.role;
    const allowedRoles = ['admin', 'auditor'];

    if (!allowedRoles.includes(userRole)) {
      logger.security('audit_access_denied', req.user, {
        ip: req.ip,
        endpoint: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'Audit access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Audit access check failed', { 
      error: error.message, 
      userId: req.user?.id 
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const requireDynamicRole = (roleChecker) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const requiredRole = roleChecker(req);
      const userRole = req.user.role?.name || req.user.role || null;

      if (userRole !== requiredRole) {
        logger.security('dynamic_role_check_failed', req.user, {
          requiredRole,
          userRole,
          ip: req.ip,
          endpoint: req.path
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredRole,
          current: userRole
        });
      }

      next();
    } catch (error) {
      logger.error('Dynamic role check failed', { 
        error: error.message, 
        userId: req.user?.id 
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

export const requirePermission = (action, resource) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role?.name || req.user.role || null;
      
      // Define permission matrix (this would typically come from a database)
      const permissions = {
        admin: ['*'], // Admin has all permissions
        manager: ['read:*', 'create:user', 'update:user', 'read:audit'],
        hr: ['read:user', 'create:user', 'update:user'],
        user: ['read:own', 'update:own']
      };

      const userPermissions = permissions[userRole] || [];
      
      // Check if user has permission
      const hasPermission = userPermissions.includes('*') || 
                           userPermissions.includes(`${action}:*`) ||
                           userPermissions.includes(`${action}:${resource}`);

      if (!hasPermission) {
        logger.security('permission_denied', req.user, {
          action,
          resource,
          userRole,
          ip: req.ip,
          endpoint: req.path
        });

        return res.status(403).json({
          success: false,
          message: 'Permission denied',
          required: `${action}:${resource}`,
          current: userPermissions
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check failed', { 
        error: error.message, 
        userId: req.user?.id,
        action,
        resource 
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
