import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPreferences from './NotificationPreferences';
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
  Eye,
  EyeOff,
  Filter,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Enhanced Notification Dropdown Component
 * Displays notifications with filtering, actions, and real-time updates
 */
const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    getRecentNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Get filtered notifications
  const getFilteredNotifications = () => {
    const recentNotifications = getRecentNotifications(20);
    
    switch (filter) {
      case 'unread':
        return recentNotifications.filter(n => !n.read);
      case 'security':
        return recentNotifications.filter(n => n.type === 'error' || n.type === 'warning');
      case 'system':
        return recentNotifications.filter(n => n.type === 'info' || n.type === 'success');
      default:
        return recentNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  // Get notification icon
  const getNotificationIcon = (type) => {
    const iconClass = "h-4 w-4";
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

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'security', label: 'Security', count: getNotificationsByType('error').length + getNotificationsByType('warning').length },
    { value: 'system', label: 'System', count: getNotificationsByType('info').length + getNotificationsByType('success').length },
  ];

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowPreferences(true)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Notification Preferences"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-3 flex space-x-1 bg-gray-100 rounded-lg p-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
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

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
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
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getNotificationBadgeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        {notification.metadata?.ipAddress && (
                          <span className="text-xs text-gray-400">
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
                        onClick={(e) => handleRemoveNotification(e, notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            View all notifications
          </button>
          <div className="text-xs text-gray-500">
            {notifications.length} total
          </div>
        </div>
      </div>

      {/* Notification Preferences Modal */}
      <NotificationPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
};

export default NotificationDropdown;
