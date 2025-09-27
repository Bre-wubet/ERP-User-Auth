import React from 'react';
import { User, Eye, Activity, Calendar, Globe } from 'lucide-react';
import Card from '../ui/Card';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { format, parseISO } from 'date-fns';

/**
 * Audit Table Component
 * Displays audit logs in a table with actions
 */
const AuditTable = ({ 
  auditLogs = [], 
  loading = false, 
  error = null,
  pagination = {},
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  canViewAuditLogs = false
}) => {
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

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (log) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-sage-400 mr-2" />
          <div className="text-sm">
            <div className="font-medium text-forest-900">
              {format(parseISO(log.createdAt), 'MMM dd, yyyy')}
            </div>
            <div className="text-sage-500">
              {format(parseISO(log.createdAt), 'HH:mm:ss')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (log) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-forest-100 flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-forest-600" />
          </div>
          <div>
            <div className="font-medium text-forest-900">
              {log.user?.firstName && log.user?.lastName 
                ? `${log.user.firstName} ${log.user.lastName}`
                : log.user?.email || 'System'
              }
            </div>
            {log.user?.email && log.user?.firstName && (
              <div className="text-xs text-sage-600">{log.user.email}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'module',
      label: 'Module',
      render: (log) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleColor(log.module)}`}>
          <Activity className="h-3 w-3 mr-1" />
          {log.module}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
          {log.action}
        </span>
      ),
    },
    {
      key: 'ip',
      label: 'IP Address',
      render: (log) => (
        <div className="flex items-center">
          <Globe className="h-4 w-4 text-sage-400 mr-2" />
          <span className="text-sm font-mono text-sage-600">
            {log.ip || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (log) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(log)}
          icon={<Eye className="h-4 w-4" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (!canViewAuditLogs) {
    return (
      <Card>
        <div className="text-center py-8 text-sage-500">
          Loading audit data...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table
        data={auditLogs}
        columns={columns}
        loading={loading}
        error={error}
        pagination={{
          current: pagination.currentPage || 1,
          total: pagination.totalPages || 0,
          pageSize: pagination.pageSize || 20,
          onPageChange,
          onPageSizeChange,
        }}
      />
    </Card>
  );
};

export default AuditTable;
