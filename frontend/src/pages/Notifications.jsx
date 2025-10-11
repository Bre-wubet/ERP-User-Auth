import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../context/NotificationContext';
import { auditAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Settings,
  Trash2,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  User,
  Shield,
  FileText
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import NotificationPreferences from '../components/notifications/NotificationPreferences';

/**
 * Notifications Page
 * Comprehensive notification management and viewing
 */
const Notifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    preferences,
    updatePreferences,
  } = useNotifications();

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const queryClient = useQueryClient();

  // Get filtered and searched notifications
  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply type filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'security':
        filtered = filtered.filter(n => n.type === 'error' || n.type === 'warning');
        break;
      case 'system':
        filtered = filtered.filter(n => n.type === 'info' || n.type === 'success');
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  // Get notification icon
  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  // Get notification badge color
  const getNotificationBadgeColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'markRead':
        selectedNotifications.forEach(id => markAsRead(id));
        break;
      case 'remove':
        selectedNotifications.forEach(id => removeNotification(id));
        break;
      default:
        break;
    }
    setSelectedNotifications([]);
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'security', label: 'Security', count: getNotificationsByType('error').length + getNotificationsByType('warning').length },
    { value: 'system', label: 'System', count: getNotificationsByType('info').length + getNotificationsByType('success').length },
  ];

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    security: getNotificationsByType('error').length + getNotificationsByType('warning').length,
    system: getNotificationsByType('info').length + getNotificationsByType('success').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage your notifications and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowPreferences(true)}
            icon={<Settings className="h-4 w-4" />}
          >
            Preferences
          </Button>
          <Button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            icon={<Check className="h-4 w-4" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Security</p>
              <p className="text-2xl font-bold text-gray-900">{stats.security}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System</p>
              <p className="text-2xl font-bold text-gray-900">{stats.system}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === option.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      filter === option.value ? 'bg-gray-100' : 'bg-gray-200'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('markRead')}
                icon={<Check className="h-4 w-4" />}
              >
                Mark Read
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('remove')}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <div className="p-4">
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications found</p>
              <p className="text-xs">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center p-2 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Select All</span>
              </div>

              {/* Notifications */}
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50/30 border-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectNotification(notification.id);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs text-gray-400 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getNotificationBadgeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            {notification.metadata?.ipAddress && (
                              <span className="text-xs text-gray-400 flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {notification.metadata.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Notification Preferences Modal */}
      <NotificationPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
};

export default Notifications;
