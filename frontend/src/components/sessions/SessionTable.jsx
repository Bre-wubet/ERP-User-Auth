import React from 'react';
import { 
  Smartphone, 
  Monitor, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Clock,
  Calendar
} from 'lucide-react';
import Card from '../ui/Card';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Session Table Component
 * Displays sessions in a table with actions
 */
const SessionTable = ({ 
  sessions = [], 
  loading = false, 
  error = null,
  onViewDetails,
  onRevokeSession,
  currentSessionId = null
}) => {
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
        const isCurrentSession = session.id === currentSessionId;
        
        return (
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full ${isCurrentSession ? 'bg-forest-100' : 'bg-sage-100'} flex items-center justify-center mr-3`}>
              <DeviceIcon className={`h-5 w-5 ${isCurrentSession ? 'text-forest-600' : 'text-sage-400'}`} />
            </div>
            <div>
              <div className="font-medium text-forest-900 flex items-center">
                {session.deviceName || 'Unknown Device'}
                {isCurrentSession && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-forest-100 text-forest-800">
                    Current
                  </span>
                )}
              </div>
              <div className="text-sm text-sage-600">
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
          <MapPin className="h-4 w-4 text-sage-400 mr-2" />
          <div>
            <div className="text-sm text-forest-900">
              {session.location || 'Unknown Location'}
            </div>
            <div className="text-xs text-sage-500 font-mono">
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
            ? 'bg-moss-100 text-moss-800' 
            : 'bg-sage-100 text-sage-800'
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
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-sage-400 mr-2" />
          <div className="text-sm">
            <div className="text-forest-900">
              {session.lastActivityAt ? format(new Date(session.lastActivityAt), 'MMM dd, HH:mm') : 'Never'}
            </div>
            <div className="text-sage-500">
              {session.lastActivityAt ? formatDistanceToNow(new Date(session.lastActivityAt), { addSuffix: true }) : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (session) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-sage-400 mr-2" />
          <div className="text-sm">
            <div className="text-forest-900">
              {format(new Date(session.createdAt), 'MMM dd, HH:mm')}
            </div>
            <div className="text-sage-500">
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </div>
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
            onClick={() => onViewDetails(session)}
            icon={<Eye className="h-4 w-4" />}
          >
            Details
          </Button>
          {session.isActive && session.id !== currentSessionId && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onRevokeSession(session)}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Revoke
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Table
        data={sessions}
        columns={columns}
        loading={loading}
        error={error}
      />
    </Card>
  );
};

export default SessionTable;
