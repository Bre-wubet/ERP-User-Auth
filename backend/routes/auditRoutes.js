import express from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  getModuleAuditLogs,
  getAuditStats,
  searchAuditLogs,
  getAvailableModules,
  getAvailableActions,
  cleanupOldLogs,
  exportAuditLogs,
  getAuditLogsValidation,
  getUserAuditLogsValidation,
  getModuleAuditLogsValidation,
  getAuditStatsValidation,
  searchAuditLogsValidation,
  cleanupOldLogsValidation,
  exportAuditLogsValidation
} from '../controllers/auditController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAuditAccess, requireRole } from '../middlewares/roleMiddleware.js';
import { auditLog } from '../middlewares/auditMiddleware.js';

const router = express.Router();

/**
 * Audit routes
 * Handles audit logging and security tracking operations
 */

// All routes require authentication
router.use(verifyToken);

// All routes require audit access (admin/auditor only)
router.use(requireAuditAccess);

// Get all audit logs
router.get('/', 
  getAuditLogsValidation,
  auditLog('audit', 'audit_logs_listed'),
  getAuditLogs
);

// Search audit logs
router.get('/search', 
  searchAuditLogsValidation,
  auditLog('audit', 'audit_logs_searched'),
  searchAuditLogs
);

// Get audit statistics
router.get('/stats', 
  getAuditStatsValidation,
  auditLog('audit', 'audit_stats_viewed'),
  getAuditStats
);

// Get available modules
router.get('/modules', 
  auditLog('audit', 'modules_listed'),
  getAvailableModules
);

// Get available actions
router.get('/actions', 
  auditLog('audit', 'actions_listed'),
  getAvailableActions
);

// Export audit logs
router.get('/export', 
  exportAuditLogsValidation,
  auditLog('audit', 'audit_logs_exported'),
  exportAuditLogs
);

// Clean up old audit logs (admin only)
router.post('/cleanup', 
  requireRole(['admin']),
  cleanupOldLogsValidation,
  auditLog('audit', 'audit_logs_cleaned'),
  cleanupOldLogs
);

// Get audit log by ID
router.get('/:auditLogId', 
  auditLog('audit', 'audit_log_viewed'),
  getAuditLogById
);

// Get audit logs for specific user
router.get('/user/:userId', 
  getUserAuditLogsValidation,
  auditLog('audit', 'user_audit_logs_viewed'),
  getUserAuditLogs
);

// Get audit logs for specific module
router.get('/module/:module', 
  getModuleAuditLogsValidation,
  auditLog('audit', 'module_audit_logs_viewed'),
  getModuleAuditLogs
);

export default router;
