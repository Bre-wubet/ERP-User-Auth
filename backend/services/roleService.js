import { db } from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Role service
 * Handles role-based access control operations
 */

export const getRoles = async (options = {}) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      scope = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { scope: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (scope) {
        where.scope = scope;
      }

      // Get roles
      const [roles, total] = await Promise.all([
        db.client.role.findMany({
          where,
          include: {
            _count: {
              select: {
                users: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        db.client.role.count({ where })
      ]);

      return {
        roles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get roles', { error: error.message, options });
      throw error;
    }
  }

export const getRoleById = async (roleId) => {
    try {
      const role = await db.client.role.findUnique({
        where: { id: roleId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
              lastLogin: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              users: true
            }
          }
        }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      return role;
    } catch (error) {
      logger.error('Failed to get role by ID', { error: error.message, roleId });
      throw error;
    }
  }

export const getRoleByName = async (roleName) => {
    try {
      const role = await db.client.role.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      return role;
    } catch (error) {
      logger.error('Failed to get role by name', { error: error.message, roleName });
      throw error;
    }
  }

export const createRole = async (roleData) => {
    const { name, scope } = roleData;

    try {
      // Check if role already exists
      const existingRole = await db.client.role.findUnique({
        where: { name }
      });

      if (existingRole) {
        throw new Error('Role with this name already exists');
      }

      // Create role
      const role = await db.client.role.create({
        data: {
          name,
          scope
        }
      });

      logger.audit('role_created', role);

      return role;
    } catch (error) {
      logger.error('Failed to create role', { error: error.message, roleData });
      throw error;
    }
  }

export const updateRole = async (roleId, updateData) => {
    const { name, scope } = updateData;

    try {
      // Check if role exists
      const existingRole = await db.client.role.findUnique({
        where: { id: roleId }
      });

      if (!existingRole) {
        throw new Error('Role not found');
      }

      // Check if name is being changed and if it's already taken
      if (name && name !== existingRole.name) {
        const nameExists = await db.client.role.findUnique({
          where: { name }
        });

        if (nameExists) {
          throw new Error('Role name already taken');
        }
      }

      // Prepare update data
      const data = {};
      if (name) data.name = name;
      if (scope !== undefined) data.scope = scope;

      // Update role
      const role = await db.client.role.update({
        where: { id: roleId },
        data
      });

      logger.audit('role_updated', role, { 
        changes: updateData,
        originalRole: existingRole 
      });

      return role;
    } catch (error) {
      logger.error('Failed to update role', { error: error.message, roleId, updateData });
      throw error;
    }
  }

export const deleteRole = async (roleId) => {
    try {
      const role = await db.client.role.findUnique({
        where: { id: roleId },
        include: {
          _count: {
            select: {
              users: true
            }
          }
        }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      // Check if role has users
      if (role._count.users > 0) {
        throw new Error('Cannot delete role with assigned users');
      }

      // Delete role
      await db.client.role.delete({
        where: { id: roleId }
      });

      logger.audit('role_deleted', role);
    } catch (error) {
      logger.error('Failed to delete role', { error: error.message, roleId });
      throw error;
    }
  }

export const assignRoleToUser = async (userId, roleId) => {
    try {
      // Check if user exists
      const user = await db.client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if role exists
      const role = await db.client.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      // Update user role
      const updatedUser = await db.client.user.update({
        where: { id: userId },
        data: { roleId },
        include: { role: true }
      });

      logger.audit('role_assigned', updatedUser, { 
        roleId, 
        roleName: role.name 
      });

      return updatedUser;
    } catch (error) {
      logger.error('Failed to assign role to user', { error: error.message, userId, roleId });
      throw error;
    }
  }

export const removeRoleFromUser = async (userId, defaultRoleId) => {
    try {
      // Check if user exists
      const user = await db.client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if default role exists
      const defaultRole = await db.client.role.findUnique({
        where: { id: defaultRoleId }
      });

      if (!defaultRole) {
        throw new Error('Default role not found');
      }

      // Update user role
      const updatedUser = await db.client.user.update({
        where: { id: userId },
        data: { roleId: defaultRoleId },
        include: { role: true }
      });

      logger.audit('role_removed', updatedUser, { 
        defaultRoleId, 
        defaultRoleName: defaultRole.name 
      });

      return updatedUser;
    } catch (error) {
      logger.error('Failed to remove role from user', { error: error.message, userId, defaultRoleId });
      throw error;
    }
  }

export const getRoleStats = async () => {
    try {
      const [totalRoles, rolesByScope, usersByRole] = await Promise.all([
        db.client.role.count(),
        db.client.role.groupBy({
          by: ['scope'],
          _count: {
            id: true
          }
        }),
        db.client.role.findMany({
          include: {
            _count: {
              select: {
                users: true
              }
            }
          },
          orderBy: {
            users: {
              _count: 'desc'
            }
          }
        })
      ]);

      return {
        totalRoles,
        rolesByScope: rolesByScope.reduce((acc, item) => {
          acc[item.scope || 'global'] = item._count.id;
          return acc;
        }, {}),
        topRoles: usersByRole.slice(0, 5).map(role => ({
          id: role.id,
          name: role.name,
          scope: role.scope,
          userCount: role._count.users
        }))
      };
    } catch (error) {
      logger.error('Failed to get role stats', { error: error.message });
      throw error;
    }
  }

export const searchRoles = async (query, options = {}) => {
    const { limit = 10, scope = null } = options;

    try {
      const where = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { scope: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (scope) {
        where.scope = scope;
      }

      const roles = await db.client.role.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true
            }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      return roles;
    } catch (error) {
      logger.error('Failed to search roles', { error: error.message, query, options });
      throw error;
    }
  }


export const getAvailableScopes = async () => {
    try {
      const scopes = await db.client.role.findMany({
        select: { scope: true },
        distinct: ['scope']
      });

      return scopes
        .map(item => item.scope)
        .filter(scope => scope !== null)
        .sort();
    } catch (error) {
      logger.error('Failed to get available scopes', { error: error.message });
      throw error;
    }
  }

export const userHasRole = async (userId, roleName) => {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });

      if (!user) {
        return false;
      }

      return user.role.name === roleName;
    } catch (error) {
      logger.error('Failed to check user role', { error: error.message, userId, roleName });
      return false;
    }
  }

export const userHasRoleInScope = async (userId, scope) => {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });

      if (!user) {
        return false;
      }

      return user.role.scope === scope || user.role.scope === null; // null means global scope
    } catch (error) {
      logger.error('Failed to check user role scope', { error: error.message, userId, scope });
      return false;
    }
  }
// Export all functions as named exports
export default {
  getRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getRoleStats,
  searchRoles,
  getAvailableScopes,
  userHasRole,
  userHasRoleInScope
};
