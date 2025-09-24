import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { userAPI, roleAPI, auditAPI, healthAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  Users,
  Shield,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subDays } from 'date-fns';

/**
 * Dashboard Page
 * Main dashboard with overview statistics and recent activity
 */

const Dashboard = () => {
  const { user, hasRole } = useAuth();

  // Fetch real data from APIs
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => userAPI.getUsers({ limit: 1 }),
    enabled: hasRole(['admin', 'manager', 'hr']),
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['dashboard-roles'],
    queryFn: () => roleAPI.getRoles({ limit: 1 }),
    enabled: hasRole(['admin', 'manager']),
  });

  const { data: auditStatsData, isLoading: auditStatsLoading } = useQuery({
    queryKey: ['dashboard-audit-stats'],
    queryFn: () => auditAPI.getAuditStats({
      dateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      dateTo: format(new Date(), 'yyyy-MM-dd'),
    }),
    enabled: hasRole(['admin', 'auditor']),
  });

  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: healthAPI.getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false, // Don't retry on 404 errors
    enabled: false, // Disable by default since health endpoint might not exist
  });

  // Calculate stats from real data
  const totalUsers = usersData?.data?.pagination?.total || usersData?.pagination?.total || 0;
  const totalRoles = rolesData?.data?.pagination?.total || rolesData?.pagination?.total || 0;
  const totalAuditEvents = auditStatsData?.data?.totalActions || 0;
  const todayAuditEvents = auditStatsData?.data?.todayActions || 0;
  const activeUsers = auditStatsData?.data?.activeUsers || 0;

  const stats = [
    {
      name: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: '+12%', // This would need historical data to calculate
      changeType: 'positive',
      icon: Users,
      loading: usersLoading,
    },
    {
      name: 'Active Users',
      value: activeUsers.toLocaleString(),
      change: '+5%',
      changeType: 'positive',
      icon: Activity,
      loading: auditStatsLoading,
    },
    {
      name: 'Total Roles',
      value: totalRoles.toLocaleString(),
      change: '0%',
      changeType: 'neutral',
      icon: Shield,
      loading: rolesLoading,
    },
    {
      name: 'Today\'s Events',
      value: todayAuditEvents.toLocaleString(),
      change: '+8%',
      changeType: 'positive',
      icon: FileText,
      loading: auditStatsLoading,
    },
  ];

  // Fetch recent audit logs for activity feed
  const { data: recentAuditData, isLoading: recentAuditLoading } = useQuery({
    queryKey: ['dashboard-recent-audit'],
    queryFn: () => auditAPI.getAuditLogs({ limit: 5 }),
    enabled: hasRole(['admin', 'auditor']),
  });

  // Helper functions for activity display
  const getActivityIcon = (action) => {
    const iconMap = {
      'login': CheckCircle,
      'logout': CheckCircle,
      'create': Users,
      'update': Users,
      'delete': AlertTriangle,
      'register': Users,
      'password_reset': Shield,
      'mfa_enable': Shield,
      'mfa_disable': Shield,
    };
    return iconMap[action.toLowerCase()] || Activity;
  };

  const getActivityColor = (action) => {
    const colorMap = {
      'login': 'text-green-500',
      'logout': 'text-gray-500',
      'create': 'text-blue-500',
      'update': 'text-blue-500',
      'delete': 'text-red-500',
      'register': 'text-green-500',
      'password_reset': 'text-yellow-500',
      'mfa_enable': 'text-purple-500',
      'mfa_disable': 'text-orange-500',
    };
    return colorMap[action.toLowerCase()] || 'text-gray-500';
  };

  const recentActivity = Array.isArray(recentAuditData?.data?.data) 
    ? recentAuditData.data.data.map((log, index) => ({
        id: log.id || index,
        type: log.action,
        message: `${log.user?.firstName || log.user?.email || 'System'} ${log.action}${log.module ? ` in ${log.module}` : ''}`,
        time: format(new Date(log.createdAt), 'MMM dd, HH:mm'),
        icon: getActivityIcon(log.action),
        color: getActivityColor(log.action),
      }))
    : [];

  const quickActions = [
    {
      name: 'Add User',
      description: 'Create a new user account',
      href: '/users/new',
      icon: Users,
      roles: ['admin', 'manager', 'hr'],
    },
    {
      name: 'Manage Roles',
      description: 'Configure user roles and permissions',
      href: '/roles',
      icon: Shield,
      roles: ['admin', 'manager'],
    },
    {
      name: 'View Audit Logs',
      description: 'Review system activity and security events',
      href: '/audit',
      icon: FileText,
      roles: ['admin', 'auditor'],
    },
    {
      name: 'System Settings',
      description: 'Configure system preferences',
      href: '/settings',
      icon: Activity,
      roles: ['admin'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your ERP system today.
        </p>
      </div>

      {/* Role Information */}
      <Card>
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-500 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Role & Permissions</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Current Role:</strong> <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{user?.role?.name || 'No Role'}</span>
              </p>
              <p className="text-sm text-gray-600">
                <strong>Available Features:</strong>
              </p>
              <ul className="text-sm text-gray-600 ml-4 space-y-1">
                <li>• Dashboard - View system overview</li>
                <li>• Profile - Manage your account settings</li>
                {user?.role?.name === 'admin' && (
                  <>
                    <li>• User Management - Manage all users</li>
                    <li>• Role Management - Manage roles and permissions</li>
                    <li>• Audit Logs - View system activity logs</li>
                  </>
                )}
                {user?.role?.name === 'manager' && (
                  <>
                    <li>• User Management - Manage users</li>
                    <li>• Role Management - Manage roles</li>
                  </>
                )}
                {user?.role?.name === 'hr' && (
                  <>
                    <li>• User Management - Manage users</li>
                  </>
                )}
                {user?.role?.name === 'auditor' && (
                  <>
                    <li>• Audit Logs - View system activity logs</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  {stat.loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change} from last month
                      </p>
                    </>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
            <Card.Description>
              Latest system events and user actions
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Content>
          <Card.Footer>
            <button className="text-sm text-blue-600 hover:text-blue-500">
              View all activity
            </button>
          </Card.Footer>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>
              Common tasks and shortcuts
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{action.name}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>System Status</Card.Title>
              <Card.Description>
                Current system health and performance metrics
              </Card.Description>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                healthLoading ? 'bg-gray-100' : 
                healthError ? 'bg-yellow-100' :
                healthData?.data?.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {healthLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                ) : healthError ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                ) : healthData?.data?.status === 'healthy' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900">System Health</h3>
              <p className="text-sm text-gray-500">
                {healthLoading ? 'Checking...' : 
                 healthError ? 'Health endpoint not available' :
                 healthData?.data?.status === 'healthy' ? 'All systems operational' : 'Issues detected'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Performance</h3>
              <p className="text-sm text-gray-500">
                Response time: {healthError ? 'N/A' : healthData?.data?.responseTime || 'N/A'}ms
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
              <p className="text-sm text-gray-500">
                {auditStatsData?.data?.securityAlerts || 0} active alerts
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;
