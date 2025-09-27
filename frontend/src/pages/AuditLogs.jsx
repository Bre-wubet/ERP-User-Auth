import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Download,
  RefreshCw,
  Settings,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { auditAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AuditFilters from '../components/audit/AuditFilters';
import AuditTable from '../components/audit/AuditTable';
import AuditStatsCards from '../components/audit/AuditStatsCards';
import AuditDetailsModal from '../components/audit/AuditDetailsModal';
import AuditCleanupModal from '../components/audit/AuditCleanupModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Audit Logs Page - Refactored
 * Comprehensive audit logging with modular components
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
    enabled: canViewAuditLogs,
    keepPreviousData: true,
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch available modules (only if user has permission)
  const { data: modulesData, error: modulesError } = useQuery({
    queryKey: ['audit-modules'],
    queryFn: auditAPI.getAvailableModules,
    enabled: canViewAuditLogs,
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch available actions (only if user has permission)
  const { data: actionsData, error: actionsError } = useQuery({
    queryKey: ['audit-actions'],
    queryFn: auditAPI.getAvailableActions,
    enabled: canViewAuditLogs,
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch audit statistics (only if user has permission)
  const { data: statsData } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditAPI.getAuditStats({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    enabled: canViewAuditLogs,
  });

  const auditLogs = Array.isArray(auditData?.data?.data) ? auditData.data.data : Array.isArray(auditData?.data) ? auditData.data : [];
  const pagination = auditData?.data?.pagination || auditData?.pagination || {};
  
  // More robust data parsing for modules and actions with fallbacks
  const modules = Array.isArray(modulesData?.data?.data) ? modulesData.data.data : 
                 Array.isArray(modulesData?.data) ? modulesData.data : 
                 Array.isArray(modulesData) ? modulesData : 
                 ['audit', 'authentication', 'user_management', 'role_management']; // Fallback data
                 
  const actions = Array.isArray(actionsData?.data?.data) ? actionsData.data.data : 
                 Array.isArray(actionsData?.data) ? actionsData.data : 
                 Array.isArray(actionsData) ? actionsData : 
                 ['login', 'logout', 'register', 'create', 'update', 'delete', 'view']; // Fallback data
                 
  const stats = statsData?.data?.data || statsData?.data || {};

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

  // Event handlers
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Show access denied if user doesn't have permission
  if (!canViewAuditLogs) {
    return (
      <div className="min-h-screen bg-sage-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-4 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-forest-900 mb-4">Access Denied</h1>
            <p className="text-sage-600 mb-6">
              You don't have permission to view audit logs. Contact your administrator for access.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-6">
      <div className="max-w-7xl mx-auto sm:px-4 lg:px-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-forest-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-forest-900">Audit Logs</h1>
                <p className="text-sage-600 mt-1">
                  Monitor system activities and user actions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-forest-50 border-forest-300' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCleanupModal(true)}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Cleanup
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                icon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <AuditStatsCards stats={stats} />

        {/* Filters */}
        <AuditFilters
          searchQuery={searchQuery}
          selectedModule={selectedModule}
          selectedAction={selectedAction}
          selectedUser={selectedUser}
          dateFrom={dateFrom}
          dateTo={dateTo}
          modules={modules}
          actions={actions}
          users={[]} // TODO: Add users list if needed
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onRefresh={handleRefresh}
          loading={auditLoading}
        />

        {/* Audit Table */}
        <div className="mt-6">
          <AuditTable
            auditLogs={auditLogs}
            loading={auditLoading}
            error={auditError}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onViewDetails={openDetailsModal}
            canViewAuditLogs={canViewAuditLogs}
          />
        </div>

        {/* Modals */}
        <AuditDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLog(null);
          }}
          auditLog={selectedLog}
        />

        <AuditCleanupModal
          isOpen={showCleanupModal}
          onClose={() => setShowCleanupModal(false)}
          onSubmit={handleCleanup}
          loading={cleanupMutation.isPending}
        />
      </div>
    </div>
  );
};

export default AuditLogs;