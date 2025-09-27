import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Smartphone, Monitor, Globe, Clock, Trash2 } from 'lucide-react';
import { userAPI } from '../../services/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { format } from 'date-fns';

/**
 * User Sessions Modal Component
 * Displays and manages user sessions
 */
const UserSessionsModal = ({ 
  isOpen, 
  onClose, 
  user 
}) => {
  const { data: sessionsData, isLoading, refetch } = useQuery({
    queryKey: ['user-sessions', user?.id],
    queryFn: () => userAPI.getUserSessions(user.id),
    enabled: !!user?.id && isOpen,
  });

  const sessions = Array.isArray(sessionsData?.data?.data) ? sessionsData.data.data : 
                  Array.isArray(sessionsData?.data) ? sessionsData.data : 
                  Array.isArray(sessionsData) ? sessionsData : [];

  const getDeviceIcon = (userAgent) => {
    if (userAgent?.includes('Mobile') || userAgent?.includes('Android') || userAgent?.includes('iPhone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getBrowserInfo = (userAgent) => {
    if (userAgent?.includes('Chrome')) return 'Chrome';
    if (userAgent?.includes('Firefox')) return 'Firefox';
    if (userAgent?.includes('Safari')) return 'Safari';
    if (userAgent?.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const handleRevokeSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      try {
        await userAPI.revokeUserSession(user.id, sessionId);
        refetch();
      } catch (error) {
        console.error('Failed to revoke session:', error);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`User Sessions - ${user?.firstName} ${user?.lastName}`}
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Smartphone className="h-12 w-12 text-sage-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-forest-900 mb-2">No Active Sessions</h3>
              <p className="text-sage-600">This user has no active sessions.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-forest-100 mr-3">
                        {getDeviceIcon(session.userAgent)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-forest-900">
                            {getBrowserInfo(session.userAgent)}
                          </h4>
                          {session.isCurrent && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-moss-100 text-moss-800">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-sage-600 mt-1">
                          <Globe className="h-3 w-3 mr-1" />
                          {session.ipAddress || 'Unknown IP'}
                        </div>
                        <div className="flex items-center text-xs text-sage-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(session.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.isActive 
                          ? 'bg-moss-100 text-moss-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {session.isActive ? 'Active' : 'Expired'}
                      </span>
                      {!session.isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeSession(session.id)}
                          className="p-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          title="Revoke Session"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-sage-200">
            <div className="text-sm text-sage-600">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
            </div>
            <Button variant="outline" onClick={refetch}>
              Refresh Sessions
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UserSessionsModal;
