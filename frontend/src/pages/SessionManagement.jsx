import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Smartphone, 
  RefreshCw, 
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { authAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SessionFilters from '../components/sessions/SessionFilters';
import SessionTable from '../components/sessions/SessionTable';
import SessionStatsCards from '../components/sessions/SessionStatsCards';
import SessionDetailsModal from '../components/sessions/SessionDetailsModal';
import SessionRevokeModal from '../components/sessions/SessionRevokeModal';
import toast from 'react-hot-toast';

/**
 * Session Management Page - Refactored
 * Comprehensive session management with modular components
 */
const SessionManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user sessions
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => userAPI.getUserSessions(user?.id),
    enabled: !!user?.id,
  });

  // Safely extract sessions array from possible nested response shapes
  const allSessions = Array.isArray(sessionsData?.data?.data)
    ? sessionsData.data.data
    : Array.isArray(sessionsData?.data)
    ? sessionsData.data
    : [];

  // Filter sessions based on search and filters
  const filteredSessions = useMemo(() => {
    let filtered = allSessions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        (session.deviceName?.toLowerCase().includes(query)) ||
        (session.location?.toLowerCase().includes(query)) ||
        (session.ip?.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (selectedStatus) {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(session => session.isActive);
      } else if (selectedStatus === 'inactive') {
        filtered = filtered.filter(session => !session.isActive);
      }
    }

    // Device type filter
    if (selectedDevice) {
      if (selectedDevice === 'mobile') {
        filtered = filtered.filter(session => 
          session.userAgent?.includes('Mobile') || 
          session.userAgent?.includes('Android') || 
          session.userAgent?.includes('iPhone')
        );
      } else if (selectedDevice === 'desktop') {
        filtered = filtered.filter(session => 
          !session.userAgent?.includes('Mobile') && 
          !session.userAgent?.includes('Android') && 
          !session.userAgent?.includes('iPhone')
        );
      }
    }

    return filtered;
  }, [allSessions, searchQuery, selectedStatus, selectedDevice]);

  // Revoke single session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId) => userAPI.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-sessions']);
      setShowRevokeModal(false);
      setSelectedSession(null);
      toast.success('Session revoked successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    },
  });

  // Revoke all sessions mutation
  const revokeAllSessionsMutation = useMutation({
    mutationFn: () => authAPI.logoutAll(),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-sessions']);
      toast.success('All sessions revoked successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to revoke all sessions');
    },
  });

  // Event handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setSelectedStatus(value);
        break;
      case 'device':
        setSelectedDevice(value);
        break;
      default:
        break;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedDevice('');
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['user-sessions']);
  };

  const handleRevokeSession = (session) => {
    setSelectedSession(session);
    setShowRevokeModal(true);
  };

  const confirmRevokeSession = (session) => {
    revokeSessionMutation.mutate(session.id);
  };

  const handleRevokeAllSessions = () => {
    if (window.confirm('Are you sure you want to revoke all sessions? You will be logged out from all devices.')) {
      revokeAllSessionsMutation.mutate();
    }
  };

  const openDetailsModal = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowRevokeModal(false);
    setShowDetailsModal(false);
    setSelectedSession(null);
  };

  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-sage-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-8">
      <div className="max-w-7xl mx-auto sm:px-3 lg:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <Smartphone className="h-6 w-6 text-forest-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-forest-900">Session Management</h1>
                <p className="text-sage-600 mt-1">
                  Manage your active sessions and device access
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh
              </Button>
              <Button
                variant="danger"
                onClick={handleRevokeAllSessions}
                icon={<Trash2 className="h-4 w-4" />}
                loading={revokeAllSessionsMutation.isPending}
              >
                Revoke All
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <SessionStatsCards 
          sessions={allSessions} 
          currentSessionId={user?.currentSessionId} 
        />

        {/* Security Notice */}
        <Card className="mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-forest-900 mb-2">Security Notice</h3>
              <p className="text-sm text-sage-600">
                Regularly review your active sessions. If you notice any suspicious activity or 
                unrecognized devices, revoke those sessions immediately. You can revoke individual 
                sessions or all sessions at once.
              </p>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <SessionFilters
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          selectedDevice={selectedDevice}
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onRefresh={handleRefresh}
          loading={sessionsLoading}
        />

        {/* Sessions Table */}
        <div className="mt-6">
          <SessionTable
            sessions={filteredSessions}
            loading={sessionsLoading}
            error={sessionsError}
            onViewDetails={openDetailsModal}
            onRevokeSession={handleRevokeSession}
            currentSessionId={user?.currentSessionId}
          />
        </div>

        {/* Modals */}
        <SessionDetailsModal
          isOpen={showDetailsModal}
          onClose={closeModals}
          session={selectedSession}
        />

        <SessionRevokeModal
          isOpen={showRevokeModal}
          onClose={closeModals}
          session={selectedSession}
          onConfirm={confirmRevokeSession}
          loading={revokeSessionMutation.isPending}
        />
      </div>
    </div>
  );
};

export default SessionManagement;