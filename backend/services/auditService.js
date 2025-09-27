import { db } from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Audit service
 * Handles audit logging and security tracking
 */

export const createAuditLog = async (auditData) => {
    const {
      userId = null,
      userEmail = null,
      module,
      action,
      details = null,
      ip = null
    } = auditData;

    try {
      // Include userEmail in details if provided and not already present
      const enhancedDetails = {
        ...details,
        ...(userEmail && !details?.userEmail ? { userEmail } : {})
      };

      const auditLog = await db.client.auditLog.create({
        data: {
          userId,
          module,
          action,
          details: enhancedDetails,
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

export const getAuditLogs = async (options = {}) => {
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

export const getAuditLogById = async (auditLogId) => {
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

export const getUserAuditLogs = async (userId, options = {}) => {
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

export const getModuleAuditLogs = async (module, options = {}) => {
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
  
export const getAuditStats = async (options = {}) => {
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

export const searchAuditLogs = async (query, options = {}) => {
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

export const getAvailableModules = async () => {
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

export const getAvailableActions = async () => {
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

export const cleanupOldLogs = async (daysToKeep = 90) => {
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

export const logSecurityEvent = async (event, details, ip = null) => {
    return createAuditLog({
      module: 'security',
      action: event,
      details,
      ip
    });
  }

export const logAuthEvent = async (event, userId, details, ip = null, userEmail = null) => {
    return createAuditLog({
      userId,
      userEmail,
      module: 'authentication',
      action: event,
      details,
      ip
    });
  }
// Export all functions as named exports
export default {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  getModuleAuditLogs,
  getAuditStats,
  searchAuditLogs,
  getAvailableModules,
  getAvailableActions,
  cleanupOldLogs,
  logSecurityEvent,
  logAuthEvent
};
