import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, authAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Smartphone } from 'lucide-react';
import { format } from 'date-fns';

const SessionsTab = ({ userId }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: () => userAPI.getUserSessions(userId),
    enabled: !!userId,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId) => userAPI.revokeSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries(['user-sessions', userId])
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => authAPI.logoutAll(),
    onSuccess: () => queryClient.invalidateQueries(['user-sessions', userId])
  });

  const sessions = data?.data || [];

  return (
    <Card>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
        <p className="text-sm text-gray-500 mb-6">Manage your active sessions across different devices and browsers</p>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">Total: {sessions.length}</div>
          <Button variant="destructive" size="sm" onClick={() => revokeAllMutation.mutate()} loading={revokeAllMutation.isPending} disabled={sessions.length === 0}>Revoke All Sessions</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.userAgent || 'Unknown Device'}</p>
                      <p className="text-sm text-gray-500">IP: {session.ip || 'Unknown'} • Created: {format(new Date(session.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                      <p className="text-sm text-gray-500">Expires: {format(new Date(session.expiresAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${new Date(session.expiresAt) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{new Date(session.expiresAt) > new Date() ? 'Active' : 'Expired'}</span>
                    <Button size="sm" variant="destructive" onClick={() => revokeSessionMutation.mutate(session.id)} loading={revokeSessionMutation.isPending}>Revoke</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SessionsTab;


