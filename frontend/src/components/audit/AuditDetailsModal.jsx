import React from 'react';
import { User, Calendar, Globe, Activity, FileText, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { format, parseISO } from 'date-fns';

/**
 * Audit Details Modal Component
 * Displays detailed information about a specific audit log entry
 */
const AuditDetailsModal = ({ 
  isOpen, 
  onClose, 
  auditLog 
}) => {
  if (!auditLog) return null;

  const getActionColor = (action) => {
    const colors = {
      'create': 'bg-moss-100 text-moss-800',
      'update': 'bg-forest-100 text-forest-800',
      'delete': 'bg-red-100 text-red-800',
      'login': 'bg-purple-100 text-purple-800',
      'logout': 'bg-sage-100 text-sage-800',
      'register': 'bg-indigo-100 text-indigo-800',
      'view': 'bg-blue-100 text-blue-800',
      'export': 'bg-yellow-100 text-yellow-800',
    };
    return colors[action.toLowerCase()] || 'bg-sage-100 text-sage-800';
  };

  const getModuleColor = (module) => {
    const colors = {
      'authentication': 'bg-forest-100 text-forest-800',
      'user': 'bg-moss-100 text-moss-800',
      'role': 'bg-purple-100 text-purple-800',
      'audit': 'bg-blue-100 text-blue-800',
      'security': 'bg-red-100 text-red-800',
      'system': 'bg-sage-100 text-sage-800',
    };
    return colors[module.toLowerCase()] || 'bg-sage-100 text-sage-800';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Log Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-forest-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-forest-900">
                  Audit Log Entry
                </h3>
                <p className="text-sage-600">
                  Detailed information about this system event
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-sage-600">
                {format(parseISO(auditLog.createdAt), 'PPpp')}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(auditLog.action)}`}>
                {auditLog.action}
              </span>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-lg font-semibold text-forest-900 mb-4">Event Information</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Module</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleColor(auditLog.module)}`}>
                    {auditLog.module}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">Timestamp</div>
                  <div className="text-sm text-sage-600">
                    {format(parseISO(auditLog.createdAt), 'PPpp')}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">IP Address</div>
                  <div className="text-sm font-mono text-sage-600">
                    {auditLog.ip || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-semibold text-forest-900 mb-4">User Information</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-4 w-4 text-sage-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-forest-900">User</div>
                  <div className="text-sm text-sage-600">
                    {auditLog.user?.firstName && auditLog.user?.lastName 
                      ? `${auditLog.user.firstName} ${auditLog.user.lastName}`
                      : auditLog.user?.email || 'System'
                    }
                  </div>
                </div>
              </div>
              {auditLog.user?.email && (
                <div className="flex items-center">
                  <div className="h-4 w-4 mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-forest-900">Email</div>
                    <div className="text-sm text-sage-600">{auditLog.user.email}</div>
                  </div>
                </div>
              )}
              {auditLog.user?.role && (
                <div className="flex items-center">
                  <div className="h-4 w-4 mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-forest-900">Role</div>
                    <div className="text-sm text-sage-600">{auditLog.user.role.name}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Details */}
        {auditLog.details && (
          <Card className="p-4">
            <h4 className="text-lg font-semibold text-forest-900 mb-4">Event Details</h4>
            <div className="bg-sage-50 rounded-lg p-4">
              <pre className="text-sm text-sage-700 whitespace-pre-wrap">
                {typeof auditLog.details === 'string' 
                  ? auditLog.details 
                  : JSON.stringify(auditLog.details, null, 2)
                }
              </pre>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditDetailsModal;
