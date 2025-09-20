import { db } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Audit service
 * Handles audit logging and security tracking
 */
class AuditService {
  /**
   * Create audit log entry
   * @param {Object} auditData - Audit data
   * @returns {Promise<Object>} Created audit log
   */
  async createAuditLog(auditData) {
    const {
      userId = null,
      module,
      action,
      details = null,
      ip = null
    } = auditData;

    try {
      const auditLog = await db.client.auditLog.create({
        data: {
          userId,
          module,
          action,
          details,
          ip
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Also log to application logger
      logger.audit(action, auditLog.user, {
        module,
        details,
        ip,
        auditLogId: auditLog.id
      });

      return auditLog;
    } catch (error) {
      logger.error('Failed to create audit log', { error: error.message, auditData });
      throw error;
    }
  }

  /**
   * Get audit logs with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Audit logs and pagination info
   */
  async getAuditLogs(options = {}) {
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
    } = options;

    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where = {};
      
      if (userId) {
        where.userId = userId;
      }
      
      if (module) {
        where.module = module;
      }
      
      if (action) {
        where.action = { contains: action, mode: 'insensitive' };
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      
      if (ip) {
        where.ip = { contains: ip };
      }

      // Get audit logs
      const [auditLogs, total] = await Promise.all([
        db.client.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        db.client.auditLog.count({ where })
      ]);

      return {
        auditLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get audit logs', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Get audit log by ID
   * @param {string} auditLogId - Audit log ID
   * @returns {Promise<Object>} Audit log data
   */
  async getAuditLogById(auditLogId) {
    try {
      const auditLog = await db.client.auditLog.findUnique({
        where: { id: auditLogId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!auditLog) {
        throw new Error('Audit log not found');
      }

      return auditLog;
    } catch (error) {
      logger.error('Failed to get audit log by ID', { error: error.message, auditLogId });
      throw error;
    }
  }

  /**
   * Get audit logs for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User audit logs
   */
  async getUserAuditLogs(userId, options = {}) {
    const {
      page = 1,
      limit = 50,
      module = null,
      action = null,
      startDate = null,
      endDate = null
    } = options;

    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where = { userId };
      
      if (module) {
        where.module = module;
      }
      
      if (action) {
        where.action = { contains: action, mode: 'insensitive' };
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // Get audit logs
      const [auditLogs, total] = await Promise.all([
        db.client.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        db.client.auditLog.count({ where })
      ]);

      return {
        auditLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get user audit logs', { error: error.message, userId, options });
      throw error;
    }
  }

  /**
   * Get audit logs for a specific module
   * @param {string} module - Module name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Module audit logs
   */
  async getModuleAuditLogs(module, options = {}) {
    const {
      page = 1,
      limit = 50,
      action = null,
      startDate = null,
      endDate = null
    } = options;

    try {
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where = { module };
      
      if (action) {
        where.action = { contains: action, mode: 'insensitive' };
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // Get audit logs
      const [auditLogs, total] = await Promise.all([
        db.client.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        db.client.auditLog.count({ where })
      ]);

      return {
        auditLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get module audit logs', { error: error.message, module, options });
      throw error;
    }
  }

  /**
   * Get audit statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Audit statistics
   */
  async getAuditStats(options = {}) {
    const {
      startDate = null,
      endDate = null,
      module = null
    } = options;

    try {
      // Build where clause
      const where = {};
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      
      if (module) {
        where.module = module;
      }

      const [
        totalLogs,
        logsByModule,
        logsByAction,
        logsByUser,
        recentLogs
      ] = await Promise.all([
        db.client.auditLog.count({ where }),
        db.client.auditLog.groupBy({
          by: ['module'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        }),
        db.client.auditLog.groupBy({
          by: ['action'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 10
        }),
        db.client.auditLog.groupBy({
          by: ['userId'],
          where: {
            ...where,
            userId: { not: null }
          },
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          },
          take: 10
        }),
        db.client.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
      ]);

      return {
        totalLogs,
        logsByModule: logsByModule.reduce((acc, item) => {
          acc[item.module] = item._count.id;
          return acc;
        }, {}),
        topActions: logsByAction.map(item => ({
          action: item.action,
          count: item._count.id
        })),
        topUsers: logsByUser.map(item => ({
          userId: item.userId,
          count: item._count.id
        })),
        recentLogs
      };
    } catch (error) {
      logger.error('Failed to get audit stats', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Search audit logs
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchAuditLogs(query, options = {}) {
    const { limit = 50, module = null } = options;

    try {
      const where = {
        OR: [
          { action: { contains: query, mode: 'insensitive' } },
          { module: { contains: query, mode: 'insensitive' } },
          { ip: { contains: query } }
        ]
      };

      if (module) {
        where.module = module;
      }

      const auditLogs = await db.client.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      return auditLogs;
    } catch (error) {
      logger.error('Failed to search audit logs', { error: error.message, query, options });
      throw error;
    }
  }

  /**
   * Get available modules
   * @returns {Promise<Array>} Available modules
   */
  async getAvailableModules() {
    try {
      const modules = await db.client.auditLog.findMany({
        select: { module: true },
        distinct: ['module']
      });

      return modules
        .map(item => item.module)
        .sort();
    } catch (error) {
      logger.error('Failed to get available modules', { error: error.message });
      throw error;
    }
  }

  /**
   * Get available actions
   * @returns {Promise<Array>} Available actions
   */
  async getAvailableActions() {
    try {
      const actions = await db.client.auditLog.findMany({
        select: { action: true },
        distinct: ['action']
      });

      return actions
        .map(item => item.action)
        .sort();
    } catch (error) {
      logger.error('Failed to get available actions', { error: error.message });
      throw error;
    }
  }

  /**
   * Clean up old audit logs
   * @param {number} daysToKeep - Number of days to keep (default: 90)
   * @returns {Promise<number>} Number of deleted logs
   */
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await db.client.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      logger.info(`Cleaned up ${result.count} old audit logs`, { 
        cutoffDate: cutoffDate.toISOString(),
        daysToKeep 
      });

      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old audit logs', { error: error.message, daysToKeep });
      throw error;
    }
  }

  /**
   * Log security event
   * @param {string} event - Security event type
   * @param {Object} details - Event details
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Created audit log
   */
  async logSecurityEvent(event, details, ip = null) {
    return this.createAuditLog({
      module: 'security',
      action: event,
      details,
      ip
    });
  }

  /**
   * Log authentication event
   * @param {string} event - Authentication event type
   * @param {string} userId - User ID
   * @param {Object} details - Event details
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Created audit log
   */
  async logAuthEvent(event, userId, details, ip = null) {
    return this.createAuditLog({
      userId,
      module: 'authentication',
      action: event,
      details,
      ip
    });
  }
}

// Export singleton instance
export const auditService = new AuditService();
export default auditService;
