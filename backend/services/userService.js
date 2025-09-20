import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * User service
 * Handles user management operations
 */
class UserService {
  constructor() {
    this.saltRounds = 12;
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users and pagination info
   */
  async getUsers(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      roleId = null,
      isActive = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where = {};
      
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (roleId) {
        where.roleId = roleId;
      }
      
      if (isActive !== null) {
        where.isActive = isActive;
      }

      // Get users
      const [users, total] = await Promise.all([
        db.client.user.findMany({
          where,
          include: {
            role: true,
            sessions: {
              select: {
                id: true,
                ip: true,
                userAgent: true,
                createdAt: true,
                expiresAt: true
              }
            },
            _count: {
              select: {
                auditLogs: true,
                apiTokens: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        db.client.user.count({ where })
      ]);

      // Sanitize users
      const sanitizedUsers = users.map(user => this.sanitizeUser(user));

      return {
        users: sanitizedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get users', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          sessions: {
            select: {
              id: true,
              ip: true,
              userAgent: true,
              createdAt: true,
              expiresAt: true
            }
          },
          auditLogs: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              module: true,
              action: true,
              details: true,
              ip: true,
              createdAt: true
            }
          },
          apiTokens: {
            select: {
              id: true,
              description: true,
              scopes: true,
              expiresAt: true,
              createdAt: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Failed to get user by ID', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data
   */
  async getUserByEmail(email) {
    try {
      const user = await db.client.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Failed to get user by email', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    const { email, password, firstName, lastName, roleId, isActive = true } = userData;

    try {
      // Check if user already exists
      const existingUser = await db.client.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Create user
      const user = await db.client.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          roleId,
          isActive
        },
        include: { role: true }
      });

      logger.audit('user_created', user);

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Failed to create user', { error: error.message, userData });
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    const { email, firstName, lastName, roleId, isActive } = updateData;

    try {
      // Check if user exists
      const existingUser = await db.client.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingUser.email) {
        const emailExists = await db.client.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (emailExists) {
          throw new Error('Email already taken');
        }
      }

      // Prepare update data
      const data = {};
      if (email) data.email = email.toLowerCase();
      if (firstName) data.firstName = firstName;
      if (lastName) data.lastName = lastName;
      if (roleId) data.roleId = roleId;
      if (isActive !== undefined) data.isActive = isActive;

      // Update user
      const user = await db.client.user.update({
        where: { id: userId },
        data,
        include: { role: true }
      });

      logger.audit('user_updated', user, { 
        changes: updateData,
        originalUser: existingUser 
      });

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Failed to update user', { error: error.message, userId, updateData });
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete user (this will cascade delete related records)
      await db.client.user.delete({
        where: { id: userId }
      });

      logger.audit('user_deleted', user);
    } catch (error) {
      logger.error('Failed to delete user', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Activate user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async activateUser(userId) {
    try {
      const user = await db.client.user.update({
        where: { id: userId },
        data: { isActive: true },
        include: { role: true }
      });

      logger.audit('user_activated', user);

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Failed to activate user', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Deactivate user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async deactivateUser(userId) {
    try {
      const user = await db.client.user.update({
        where: { id: userId },
        data: { isActive: false },
        include: { role: true }
      });

      // Logout all sessions
      await db.client.session.deleteMany({
        where: { userId }
      });

      logger.audit('user_deactivated', user);

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Failed to deactivate user', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get user sessions
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User sessions
   */
  async getUserSessions(userId) {
    try {
      const sessions = await db.client.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return sessions;
    } catch (error) {
      logger.error('Failed to get user sessions', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Revoke user session
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async revokeSession(sessionId) {
    try {
      await db.client.session.delete({
        where: { id: sessionId }
      });

      logger.audit('session_revoked', { sessionId });
    } catch (error) {
      logger.error('Failed to revoke session', { error: error.message, sessionId });
      throw error;
    }
  }

  /**
   * Revoke all user sessions
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async revokeAllSessions(userId) {
    try {
      await db.client.session.deleteMany({
        where: { userId }
      });

      logger.audit('all_sessions_revoked', { userId });
    } catch (error) {
      logger.error('Failed to revoke all sessions', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userId) {
    try {
      const [user, sessionCount, auditLogCount, apiTokenCount] = await Promise.all([
        db.client.user.findUnique({
          where: { id: userId },
          include: { role: true }
        }),
        db.client.session.count({ where: { userId } }),
        db.client.auditLog.count({ where: { userId } }),
        db.client.apiToken.count({ where: { userId } })
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user: this.sanitizeUser(user),
        stats: {
          activeSessions: sessionCount,
          totalAuditLogs: auditLogCount,
          apiTokens: apiTokenCount,
          lastLogin: user.lastLogin,
          accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) // days
        }
      };
    } catch (error) {
      logger.error('Failed to get user stats', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Search users
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchUsers(query, options = {}) {
    const { limit = 10, roleId = null } = options;

    try {
      const where = {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (roleId) {
        where.roleId = roleId;
      }

      const users = await db.client.user.findMany({
        where,
        include: { role: true },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      return users.map(user => this.sanitizeUser(user));
    } catch (error) {
      logger.error('Failed to search users', { error: error.message, query, options });
      throw error;
    }
  }

  /**
   * Sanitize user data (remove sensitive information)
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   */
  sanitizeUser(user) {
    const { password, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
