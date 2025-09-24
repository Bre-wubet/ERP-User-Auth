import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Smartphone, 
  Monitor, 
  Globe, 
  MapPin, 
  Clock, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { authAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Session Management Page
 * Comprehensive session management with device tracking and security controls
 */
const SessionManagement = () => {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user sessions
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => userAPI.getUserSessions(user?.id),
    enabled: !!user?.id,
  });

  // Safely extract sessions array from possible nested response shapes
  const sessions = Array.isArray(sessionsData?.data?.data)
    ? sessionsData.data.data
    : Array.isArray(sessionsData?.data)
    ? sessionsData.data
    : [];

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

  const handleRevokeSession = (session) => {
    setSelectedSession(session);
    setShowRevokeModal(true);
  };

  const confirmRevokeSession = () => {
    if (selectedSession) {
      revokeSessionMutation.mutate(selectedSession.id);
    }
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

  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const getDeviceInfo = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getOSInfo = (userAgent) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown OS';
  };

  const columns = [
    {
      key: 'device',
      label: 'Device',
      render: (session) => {
        const DeviceIcon = getDeviceIcon(session.userAgent || '');
        return (
          <div className="flex items-center">
            <DeviceIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900">
                {session.deviceName || 'Unknown Device'}
              </div>
              <div className="text-sm text-gray-500">
                {getOSInfo(session.userAgent || '')} • {getDeviceInfo(session.userAgent || '')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'location',
      label: 'Location',
      render: (session) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">
              {session.location || 'Unknown Location'}
            </div>
            <div className="text-xs text-gray-500">
              IP: {session.ip || 'Unknown'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (session) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          session.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {session.isActive ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      render: (session) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {session.lastActivityAt ? format(new Date(session.lastActivityAt), 'MMM dd, HH:mm') : 'Never'}
          </div>
          <div className="text-gray-500">
            {session.lastActivityAt ? formatDistanceToNow(new Date(session.lastActivityAt), { addSuffix: true }) : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (session) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {format(new Date(session.createdAt), 'MMM dd, HH:mm')}
          </div>
          <div className="text-gray-500">
            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (session) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDetailsModal(session)}
            icon={<Eye className="h-4 w-4" />}
          >
            Details
          </Button>
          {session.isActive && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRevokeSession(session)}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Revoke
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600">Manage your active sessions and device access</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries(['user-sessions'])}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevokeAllSessions}
            icon={<Trash2 className="h-4 w-4" />}
            loading={revokeAllSessionsMutation.isPending}
          >
            Revoke All
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Card>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-1" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Security Notice</h3>
            <p className="text-sm text-gray-600">
              Regularly review your active sessions. If you notice any suspicious activity or 
              unrecognized devices, revoke those sessions immediately. You can revoke individual 
              sessions or all sessions at once.
            </p>
          </div>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card>
        <Table
          data={sessions}
          columns={columns}
          loading={sessionsLoading}
          error={sessionsError}
        />
      </Card>

      {/* Revoke Session Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setSelectedSession(null);
        }}
        title="Revoke Session"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Confirm Session Revocation</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This will immediately log out the selected device. The user will need to 
                    sign in again to access their account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Device</label>
                <p className="text-sm text-gray-900">{selectedSession.deviceName || 'Unknown Device'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">{selectedSession.location || 'Unknown Location'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <p className="text-sm text-gray-900 font-mono">{selectedSession.ip || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                <p className="text-sm text-gray-900">
                  {selectedSession.lastActivityAt 
                    ? format(new Date(selectedSession.lastActivityAt), 'PPpp')
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedSession(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRevokeSession}
                loading={revokeSessionMutation.isPending}
              >
                Revoke Session
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Session Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedSession(null);
        }}
        title="Session Details"
        size="lg"
      >
        {selectedSession && (
          <SessionDetails session={selectedSession} />
        )}
      </Modal>
    </div>
  );
};

// Session Details Component
const SessionDetails = ({ session }) => {
  const [showUserAgent, setShowUserAgent] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Device Name</label>
          <p className="text-sm text-gray-900">{session.deviceName || 'Unknown Device'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            session.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {session.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
          <p className="text-sm text-gray-900 font-mono">{session.ip || 'Unknown'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <p className="text-sm text-gray-900">{session.location || 'Unknown Location'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
          <p className="text-sm text-gray-900">
            {format(new Date(session.createdAt), 'PPpp')}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Activity</label>
          <p className="text-sm text-gray-900">
            {session.lastActivityAt 
              ? format(new Date(session.lastActivityAt), 'PPpp')
              : 'Never'
            }
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">User Agent</label>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-900 font-mono">
              {showUserAgent ? session.userAgent : 'Click to reveal'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUserAgent(!showUserAgent)}
              icon={showUserAgent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            >
              {showUserAgent ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </div>

      {session.sessionData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Data</label>
          <div className="bg-gray-50 p-3 rounded-md">
            <pre className="text-sm text-gray-900 whitespace-pre-wrap">
              {JSON.stringify(session.sessionData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
