import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
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
} from 'lucide-react';

/**
 * Dashboard Page
 * Main dashboard with overview statistics and recent activity
 */

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Sessions',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'Security Alerts',
      value: '3',
      change: '-2',
      changeType: 'negative',
      icon: AlertTriangle,
    },
    {
      name: 'Audit Events',
      value: '2,456',
      change: '+8%',
      changeType: 'positive',
      icon: FileText,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'user_login',
      message: 'John Doe logged in',
      time: '2 minutes ago',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      id: 2,
      type: 'user_created',
      message: 'New user Jane Smith was created',
      time: '15 minutes ago',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      id: 3,
      type: 'role_assigned',
      message: 'Role "Manager" assigned to Mike Johnson',
      time: '1 hour ago',
      icon: Shield,
      color: 'text-purple-500',
    },
    {
      id: 4,
      type: 'security_alert',
      message: 'Multiple failed login attempts detected',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
  ];

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
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
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
          <Card.Title>System Status</Card.Title>
          <Card.Description>
            Current system health and performance metrics
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">System Health</h3>
              <p className="text-sm text-gray-500">All systems operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Performance</h3>
              <p className="text-sm text-gray-500">Response time: 45ms</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
              <p className="text-sm text-gray-500">3 active alerts</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;
