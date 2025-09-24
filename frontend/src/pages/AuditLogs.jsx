import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Eye,
  AlertTriangle,
  Trash2,
  Settings
} from 'lucide-react';
import { auditAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Audit Logs Page
 * Comprehensive audit logging with filtering, search, and export
 */
const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has permission to view audit logs
  const canViewAuditLogs = hasRole(['admin', 'auditor']);

  // Fetch audit logs with filters (only if user has permission)
  const { data: auditData, isLoading: auditLoading, error: auditError } = useQuery({
    queryKey: ['audit-logs', currentPage, pageSize, searchQuery, selectedModule, selectedAction, selectedUser, dateFrom, dateTo],
    queryFn: () => auditAPI.getAuditLogs({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      module: selectedModule || undefined,
      action: selectedAction || undefined,
      userId: selectedUser || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    enabled: canViewAuditLogs, // Only fetch if user has permission
    keepPreviousData: true,
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds if enabled
  });

  // Fetch available modules (only if user has permission)
  const { data: modulesData } = useQuery({
    queryKey: ['audit-modules'],
    queryFn: auditAPI.getAvailableModules,
    enabled: canViewAuditLogs, // Only fetch if user has permission
  });

  // Fetch available actions (only if user has permission)
  const { data: actionsData } = useQuery({
    queryKey: ['audit-actions'],
    queryFn: auditAPI.getAvailableActions,
    enabled: canViewAuditLogs, // Only fetch if user has permission
  });

  // Fetch audit statistics (only if user has permission)
  const { data: statsData } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditAPI.getAuditStats({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    enabled: canViewAuditLogs, // Only fetch if user has permission
  });

  const auditLogs = Array.isArray(auditData?.data?.data) ? auditData.data.data : Array.isArray(auditData?.data) ? auditData.data : [];
  const pagination = auditData?.data?.pagination || auditData?.pagination || {};
  const modules = Array.isArray(modulesData?.data?.data) ? modulesData.data.data : Array.isArray(modulesData?.data) ? modulesData.data : [];
  const actions = Array.isArray(actionsData?.data?.data) ? actionsData.data.data : Array.isArray(actionsData?.data) ? actionsData.data : [];
  const stats = statsData?.data || {};

  // Audit cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: ({ daysToKeep }) => auditAPI.cleanupOldLogs(daysToKeep),
    onSuccess: () => {
      queryClient.invalidateQueries(['audit-logs']);
      queryClient.invalidateQueries(['audit-stats']);
      setShowCleanupModal(false);
      toast.success('Old audit logs cleaned up successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cleanup audit logs');
    },
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'module':
        setSelectedModule(value);
        break;
      case 'action':
        setSelectedAction(value);
        break;
      case 'user':
        setSelectedUser(value);
        break;
      case 'dateFrom':
        setDateFrom(value);
        break;
      case 'dateTo':
        setDateTo(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedModule('');
    setSelectedAction('');
    setSelectedUser('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const response = await auditAPI.exportAuditLogs({
        search: searchQuery,
        module: selectedModule || undefined,
        action: selectedAction || undefined,
        userId: selectedUser || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const openDetailsModal = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleCleanup = (data) => {
    cleanupMutation.mutate({ daysToKeep: data.daysToKeep });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['audit-logs']);
    queryClient.invalidateQueries(['audit-stats']);
  };

  const getActionColor = (action) => {
    const colors = {
      'create': 'bg-green-100 text-green-800',
      'update': 'bg-blue-100 text-blue-800',
      'delete': 'bg-red-100 text-red-800',
      'login': 'bg-purple-100 text-purple-800',
      'logout': 'bg-gray-100 text-gray-800',
      'register': 'bg-indigo-100 text-indigo-800',
    };
    return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (log) => (
        <div className="text-sm">
          <div className="font-medium">
            {format(parseISO(log.createdAt), 'MMM dd, yyyy')}
          </div>
          <div className="text-gray-500">
            {format(parseISO(log.createdAt), 'HH:mm:ss')}
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (log) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">
            {log.user?.firstName && log.user?.lastName 
              ? `${log.user.firstName} ${log.user.lastName}`
              : log.user?.email || 'System'
            }
          </span>
        </div>
      ),
    },
    {
      key: 'module',
      label: 'Module',
      render: (log) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
        <span className="text-sm font-mono text-gray-600">
          {log.ip || 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (log) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openDetailsModal(log)}
          icon={<Eye className="h-4 w-4" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Show access denied if user doesn't have permission
  if (!canViewAuditLogs) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">Monitor system activities and user actions</p>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access audit logs. This feature requires admin or auditor role.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            icon={<Settings className="h-5 w-5" />}
            className={autoRefresh ? 'bg-blue-50 text-blue-600' : ''}
          >
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            icon={<RefreshCw className="h-5 w-5" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            icon={<Download className="h-5 w-5" />}
          >
            Export
          </Button>
          {hasRole(['admin']) && (
            <Button
              variant="destructive"
              onClick={() => setShowCleanupModal(true)}
              icon={<Trash2 className="h-5 w-5" />}
            >
              Cleanup
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleResetFilters}
            icon={<RefreshCw className="h-5 w-5" />}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActions || 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers || 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Modules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalModules || 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Today's Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayActions || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={handleSearch}
              icon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <div>
            <Select
              value={selectedModule}
              onChange={(e) => handleFilterChange('module', e.target.value)}
              placeholder="All Modules"
            >
              <option value="">All Modules</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={selectedAction}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="All Actions"
            >
              <option value="">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              icon={<RefreshCw className="h-4 w-4" />}
              fullWidth
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <Table
          data={auditLogs}
          columns={columns}
          loading={auditLoading}
          error={auditError}
          pagination={{
            current: currentPage,
            total: pagination.totalPages || 0,
            pageSize: pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLog(null);
        }}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <AuditLogDetails log={selectedLog} />
        )}
      </Modal>

      {/* Cleanup Modal */}
      <Modal
        isOpen={showCleanupModal}
        onClose={() => setShowCleanupModal(false)}
        title="Cleanup Old Audit Logs"
      >
        <AuditCleanupForm
          onSubmit={handleCleanup}
          onCancel={() => setShowCleanupModal(false)}
          loading={cleanupMutation.isPending}
        />
      </Modal>
    </div>
  );
};

// Audit Log Details Component
const AuditLogDetails = ({ log }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Timestamp</label>
          <p className="text-sm text-gray-900">
            {format(parseISO(log.createdAt), 'PPpp')}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">IP Address</label>
          <p className="text-sm text-gray-900 font-mono">{log.ip || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User</label>
          <p className="text-sm text-gray-900">
            {log.user?.firstName && log.user?.lastName 
              ? `${log.user.firstName} ${log.user.lastName}`
              : log.user?.email || 'System'
            }
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <p className="text-sm text-gray-900 font-mono">{log.userId || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Module</label>
          <p className="text-sm text-gray-900">{log.module}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Action</label>
          <p className="text-sm text-gray-900">{log.action}</p>
        </div>
      </div>

      {log.details && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="text-sm text-gray-900 whitespace-pre-wrap">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Audit Cleanup Form Component
const AuditCleanupForm = ({ onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      daysToKeep: 90
    }
  });

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Audit Log Cleanup</h4>
            <p className="text-sm text-red-700 mt-1">
              This will permanently remove audit logs older than the specified number of days. 
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Keep logs for (days)"
          type="number"
          min="1"
          max="365"
          {...register('daysToKeep', { 
            required: 'Please specify number of days',
            min: { value: 1, message: 'Must keep at least 1 day' },
            max: { value: 365, message: 'Cannot keep more than 365 days' }
          })}
          error={errors.daysToKeep?.message}
          helperText="Audit logs older than this will be permanently deleted"
        />

        <div className="bg-gray-50 p-3 rounded-md">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Cleanup Summary</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Logs older than specified days will be removed</li>
            <li>• This action cannot be undone</li>
            <li>• Consider backing up important logs first</li>
            <li>• Estimated cleanup time: 2-5 minutes</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            loading={loading}
          >
            Cleanup Logs
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuditLogs;
