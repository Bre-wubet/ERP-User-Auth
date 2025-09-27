import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, Activity, Clock, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { roleAPI } from '../../services/api';

/**
 * Role Statistics Modal
 * Displays detailed statistics for a specific role
 */
const RoleStatsModal = ({ 
  isOpen, 
  onClose, 
  role 
}) => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['role-stats'],
    queryFn: () => roleAPI.getRoleStats(),
    enabled: isOpen,
    retry: false,
  });

  const stats = statsData?.data?.data || statsData?.data || {};
  
  // Get role-specific data from the role prop and general stats
  const roleStats = {
    totalUsers: role?._count?.users || 0,
    activeUsers: role?._count?.users || 0, // We'll assume all users with roles are active for now
    totalRoles: stats.totalRoles || 0,
    totalScopes: stats.totalScopes || 0
  };

  const StatCard = ({ title, value, icon: Icon, color = 'forest' }) => (
    <Card className="p-4">
      <div className="flex items-center">
        <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center mr-3`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <div className="text-sm font-medium text-sage-600">{title}</div>
          <div className={`text-2xl font-bold text-${color}-900`}>{value}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Role Statistics - ${role?.name}`}
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
              ? 'You don\'t have permission to view this role\'s statistics.'
              : 'Failed to load role statistics. Please try again.'
            }
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Role Info */}
          <Card className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-forest-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-forest-900">
                  {role?.name?.charAt(0).toUpperCase() + role?.name?.slice(1)}
                </h3>
                <p className="text-sage-600">
                  {role?.description || 'No description provided'}
                </p>
                {role?.scope && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-moss-100 text-moss-800 mt-2">
                    Scope: {role.scope}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Users with this Role"
              value={roleStats.totalUsers}
              icon={Users}
              color="forest"
            />
            <StatCard
              title="Total Roles in System"
              value={roleStats.totalRoles}
              icon={Activity}
              color="moss"
            />
            <StatCard
              title="Created"
              value={role?.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
              icon={Clock}
              color="sage"
            />
          </div>

          {/* Recent Activity */}
          {stats.recentActivity && stats.recentActivity.length > 0 && (
            <Card className="p-4">
              <h4 className="text-lg font-semibold text-forest-900 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-forest-500 rounded-full mr-3"></div>
                    <span className="text-sage-600">{activity}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RoleStatsModal;
