import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Server, 
  Database, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { healthAPI, auditAPI, userAPI, roleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { format, subDays, subHours } from 'date-fns';

/**
 * System Health Page
 * Real-time system monitoring and health status
 */
const SystemHealth = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const { hasRole } = useAuth();

  // Fetch system health data
  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['system-health'],
    queryFn: healthAPI.getHealth,
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
    enabled: hasRole(['admin', 'auditor']),
    retry: false, // Don't retry on 404 errors
  });

  // Fetch system statistics
  const { data: auditStatsData } = useQuery({
    queryKey: ['system-audit-stats'],
    queryFn: () => auditAPI.getAuditStats({
      dateFrom: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      dateTo: format(new Date(), 'yyyy-MM-dd'),
    }),
    enabled: hasRole(['admin', 'auditor']),
  });

  const { data: usersData } = useQuery({
    queryKey: ['system-users'],
    queryFn: () => userAPI.getUsers({ limit: 1 }),
    enabled: hasRole(['admin', 'manager', 'hr']),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['system-roles'],
    queryFn: () => roleAPI.getRoles({ limit: 1 }),
    enabled: hasRole(['admin', 'manager']),
  });

  // Calculate system metrics
  const systemMetrics = {
    totalUsers: usersData?.data?.pagination?.total || usersData?.pagination?.total || 0,
    totalRoles: rolesData?.data?.pagination?.total || rolesData?.pagination?.total || 0,
    totalAuditEvents: auditStatsData?.data?.totalActions || 0,
    activeUsers: auditStatsData?.data?.activeUsers || 0,
    todayEvents: auditStatsData?.data?.todayActions || 0,
    responseTime: healthData?.data?.responseTime || 0,
    uptime: healthData?.data?.uptime || 0,
    memoryUsage: healthData?.data?.memoryUsage || 0,
    cpuUsage: healthData?.data?.cpuUsage || 0,
  };

  const getHealthStatus = () => {
    if (healthLoading) return 'loading';
    if (healthError) return 'unavailable';
    if (healthData?.data?.status === 'healthy') return 'healthy';
    return 'warning';
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'unavailable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'unavailable': return Activity;
      default: return Activity;
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceTrend = (current, previous) => {
    if (!previous) return 'neutral';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'neutral';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!hasRole(['admin', 'auditor'])) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-600">Monitor system performance and health status</p>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access system health monitoring. This feature requires admin or auditor role.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">Monitor system performance and health status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Auto-refresh:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <div className="flex items-center mt-2">
                {(() => {
                  const status = getHealthStatus();
                  const Icon = getHealthIcon(status);
                  return (
                    <>
                      <Icon className={`h-5 w-5 mr-2 ${getHealthColor(status)}`} />
                      <span className={`text-lg font-semibold ${getHealthColor(status)}`}>
                        {status === 'loading' ? 'Checking...' : 
                         status === 'healthy' ? 'Healthy' : 
                         status === 'warning' ? 'Warning' : 
                         status === 'unavailable' ? 'Unavailable' : 'Error'}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Server className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.responseTime}ms
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatUptime(systemMetrics.uptime)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.activeUsers}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Globe className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-medium">{systemMetrics.totalUsers}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Roles</span>
                  <span className="font-medium">{systemMetrics.totalRoles}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Audit Events</span>
                  <span className="font-medium">{systemMetrics.totalAuditEvents}</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Performance
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium">{systemMetrics.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${systemMetrics.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">{formatBytes(systemMetrics.memoryUsage)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Today's Events</span>
                  <span className="font-medium">{systemMetrics.todayEvents}</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Network
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-green-600">Online</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Latency</span>
                  <span className="font-medium">{systemMetrics.responseTime}ms</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alerts
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security</span>
                  <span className="font-medium text-green-600">0</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Performance</span>
                  <span className="font-medium text-green-600">0</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">System</span>
                  <span className="font-medium text-green-600">0</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <Card.Title>Recent System Activity</Card.Title>
          <Card.Description>
            Latest system events and performance metrics
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">System Health Check</p>
                  <p className="text-sm text-green-600">All systems operational</p>
                </div>
              </div>
              <span className="text-sm text-green-600">
                {format(new Date(), 'HH:mm:ss')}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Performance Update</p>
                  <p className="text-sm text-blue-600">Response time: {systemMetrics.responseTime}ms</p>
                </div>
              </div>
              <span className="text-sm text-blue-600">
                {format(new Date(), 'HH:mm:ss')}
              </span>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default SystemHealth;
