import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, Shield, Smartphone, AlertTriangle } from 'lucide-react';
import { userAPI } from '../../services/api';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { format } from 'date-fns';

/**
 * User Statistics Modal Component
 * Displays detailed statistics for a specific user
 */
const UserStatsModal = ({ 
  isOpen, 
  onClose, 
  user 
}) => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => userAPI.getUserStats(user.id),
    enabled: !!user?.id && isOpen,
    retry: false, // Don't retry on 403 errors
  });

  const stats = statsData?.data?.data || statsData?.data || {};

  const StatCard = ({ title, value, icon: Icon, color = 'forest' }) => (
    <Card className="p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-${color}-100 mr-3`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-sage-600">{title}</p>
          <p className="text-lg font-semibold text-forest-900">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`User Statistics - ${user?.firstName} ${user?.lastName}`}
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-forest-900 mb-2">Unable to Load Statistics</h3>
          <p className="text-sage-600 mb-4">
            {error.response?.status === 403 
              ? 'You don\'t have permission to view this user\'s statistics.'
              : 'Failed to load user statistics. Please try again.'
            }
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Info */}
          <Card className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <span className="text-lg font-medium text-forest-700">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-forest-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sage-600">{user?.email}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  user?.isActive 
                    ? 'bg-moss-100 text-moss-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Logins"
              value={stats.totalLogins || 0}
              icon={Activity}
              color="forest"
            />
            <StatCard
              title="Last Login"
              value={stats.lastLogin ? format(new Date(stats.lastLogin), 'MMM dd, yyyy') : 'Never'}
              icon={Clock}
              color="sage"
            />
            <StatCard
              title="MFA Enabled"
              value={stats.mfaEnabled ? 'Yes' : 'No'}
              icon={Shield}
              color={stats.mfaEnabled ? 'moss' : 'red'}
            />
            <StatCard
              title="Active Sessions"
              value={stats.activeSessions || 0}
              icon={Smartphone}
              color="forest"
            />
            <StatCard
              title="Failed Attempts"
              value={stats.failedAttempts || 0}
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Account Age"
              value={user?.createdAt ? 
                Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days' : 
                'Unknown'
              }
              icon={Clock}
              color="sage"
            />
          </div>

          {/* Recent Activity */}
          {stats.recentActivity && stats.recentActivity.length > 0 && (
            <Card>
              <div className="p-4">
                <h4 className="text-lg font-medium text-forest-900 mb-4">Recent Activity</h4>
                <div className="space-y-2">
                  {stats.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-sage-200 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-forest-900">{activity.action}</p>
                        <p className="text-xs text-sage-600">{activity.details}</p>
                      </div>
                      <span className="text-xs text-sage-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </Modal>
  );
};

export default UserStatsModal;
