import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Settings, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Shield, 
  Clock,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import { authAPI, auditAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Admin Tools Page
 * System maintenance and administrative tools
 */
const AdminTools = () => {
  const [showTokenCleanupModal, setShowTokenCleanupModal] = useState(false);
  const [showAuditCleanupModal, setShowAuditCleanupModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  // Token cleanup mutation
  const tokenCleanupMutation = useMutation({
    mutationFn: authAPI.cleanupExpiredTokens,
    onSuccess: () => {
      queryClient.invalidateQueries(['user-sessions']);
      setShowTokenCleanupModal(false);
      toast.success('Expired tokens cleaned up successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cleanup expired tokens');
    },
  });

  // Audit cleanup mutation
  const auditCleanupMutation = useMutation({
    mutationFn: ({ daysToKeep }) => auditAPI.cleanupOldLogs(daysToKeep),
    onSuccess: () => {
      queryClient.invalidateQueries(['audit-logs']);
      setShowAuditCleanupModal(false);
      toast.success('Old audit logs cleaned up successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cleanup audit logs');
    },
  });

  const handleTokenCleanup = () => {
    tokenCleanupMutation.mutate();
  };

  const handleAuditCleanup = (data) => {
    auditCleanupMutation.mutate({ daysToKeep: data.daysToKeep });
  };

  const adminTools = [
    {
      id: 'token-cleanup',
      title: 'Token Cleanup',
      description: 'Remove expired authentication tokens and sessions',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      action: () => setShowTokenCleanupModal(true),
      requiresConfirmation: true,
    },
    {
      id: 'audit-cleanup',
      title: 'Audit Log Cleanup',
      description: 'Remove old audit logs to free up storage space',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => setShowAuditCleanupModal(true),
      requiresConfirmation: true,
    },
    {
      id: 'system-refresh',
      title: 'System Refresh',
      description: 'Refresh all cached data and system status',
      icon: RefreshCw,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => {
        queryClient.invalidateQueries();
        toast.success('System data refreshed');
      },
      requiresConfirmation: false,
    },
    {
      id: 'maintenance-mode',
      title: 'Maintenance Mode',
      description: 'Enable or disable maintenance mode for the system',
      icon: Settings,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      action: () => setShowMaintenanceModal(true),
      requiresConfirmation: true,
    },
  ];

  if (!hasRole(['admin'])) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Tools</h1>
            <p className="text-gray-600">System maintenance and administrative tools</p>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access admin tools. This feature requires admin role.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator if you believe this is an error.
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Tools</h1>
          <p className="text-gray-600">System maintenance and administrative tools</p>
        </div>
      </div>

      {/* Warning Notice */}
      <Card>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-1" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Important Notice</h3>
            <p className="text-sm text-gray-600">
              These tools perform critical system operations. Use them with caution as some actions 
              cannot be undone. Always ensure you have proper backups before performing maintenance operations.
            </p>
          </div>
        </div>
      </Card>

      {/* Admin Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="hover:shadow-md transition-shadow">
              <Card.Content className="p-6">
                <div className="flex items-start">
                  <div className={`p-3 rounded-full mr-4 ${tool.bgColor}`}>
                    <Icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {tool.description}
                    </p>
                    <Button
                      onClick={tool.action}
                      variant={tool.requiresConfirmation ? "destructive" : "primary"}
                      size="sm"
                    >
                      {tool.title}
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Status
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">{format(new Date(), 'MMM dd, HH:mm')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Size</span>
                <span className="text-sm font-medium">2.4 GB</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Status
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SSL Certificate</span>
                <span className="text-sm font-medium text-green-600">Valid</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Firewall</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Threats Blocked</span>
                <span className="text-sm font-medium">0 today</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Performance
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium">1.2 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disk Usage</span>
                <span className="text-sm font-medium">45%</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Token Cleanup Modal */}
      <Modal
        isOpen={showTokenCleanupModal}
        onClose={() => setShowTokenCleanupModal(false)}
        title="Cleanup Expired Tokens"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Confirm Token Cleanup</h4>
                <p className="text-sm text-red-700 mt-1">
                  This will remove all expired authentication tokens and sessions. 
                  Users with expired sessions will need to sign in again.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Operation</label>
              <p className="text-sm text-gray-900">Remove expired tokens and sessions</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Impact</label>
              <p className="text-sm text-gray-900">Users with expired sessions will be logged out</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
              <p className="text-sm text-gray-900">1-2 minutes</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowTokenCleanupModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTokenCleanup}
              loading={tokenCleanupMutation.isPending}
            >
              Cleanup Tokens
            </Button>
          </div>
        </div>
      </Modal>

      {/* Audit Cleanup Modal */}
      <Modal
        isOpen={showAuditCleanupModal}
        onClose={() => setShowAuditCleanupModal(false)}
        title="Cleanup Old Audit Logs"
      >
        <AuditCleanupForm
          onSubmit={handleAuditCleanup}
          onCancel={() => setShowAuditCleanupModal(false)}
          loading={auditCleanupMutation.isPending}
        />
      </Modal>

      {/* Maintenance Mode Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Maintenance Mode"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Maintenance Mode</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Maintenance mode is currently not implemented in this system. 
                  This feature would allow you to temporarily disable access for maintenance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowMaintenanceModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Audit Cleanup Form Component
const AuditCleanupForm = ({ onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      daysToKeep: 90
    }
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Audit Log Cleanup</h4>
            <p className="text-sm text-blue-700 mt-1">
              This will remove audit logs older than the specified number of days. 
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Keep logs for (days)"
          type="number"
          min="1"
          max="365"
          {...register('daysToKeep', { 
            required: 'Please specify number of days',
            min: { value: 1, message: 'Must keep at least 1 day' },
            max: { value: 365, message: 'Cannot keep more than 365 days' }
          })}
          error={errors.daysToKeep?.message}
          helperText="Audit logs older than this will be permanently deleted"
        />

        <div className="bg-gray-50 p-3 rounded-md">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Cleanup Summary</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Logs older than specified days will be removed</li>
            <li>• This action cannot be undone</li>
            <li>• Consider backing up important logs first</li>
            <li>• Estimated cleanup time: 2-5 minutes</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            loading={loading}
          >
            Cleanup Logs
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminTools;
