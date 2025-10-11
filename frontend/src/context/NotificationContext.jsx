import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Notification Context
 * Manages notification state and provides notification methods throughout the app
 */

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastChecked: null,
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    systemUpdates: true,
    userActivity: false,
  },
};

// Action types
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  SET_LAST_CHECKED: 'SET_LAST_CHECKED',
};

// Reducer function
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      const notifications = action.payload;
      const unreadCount = notifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications,
        unreadCount,
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = { ...action.payload, id: Date.now(), read: false };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      const filteredUnreadCount = filteredNotifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredUnreadCount,
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    case NOTIFICATION_ACTIONS.SET_LAST_CHECKED:
      return {
        ...state,
        lastChecked: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const queryClient = useQueryClient();

  // Fetch notifications from audit logs
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => auditAPI.getAuditLogs({ 
      limit: 50, 
      sortBy: 'createdAt', 
      sortOrder: 'desc',
      action: ['login', 'logout', 'password_change', 'mfa_enable', 'mfa_disable', 'user_create', 'user_update']
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Process audit logs into notifications
  useEffect(() => {
    if (auditData?.data?.data) {
      const notifications = auditData.data.data.map(log => ({
        id: log.id,
        title: getNotificationTitle(log.action),
        message: getNotificationMessage(log),
        type: getNotificationType(log.action),
        timestamp: log.createdAt,
        read: false,
        action: log.action,
        userId: log.userId,
        metadata: {
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          module: log.module,
        },
      }));

      dispatch({
        type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
        payload: notifications,
      });

      dispatch({
        type: NOTIFICATION_ACTIONS.SET_LAST_CHECKED,
        payload: new Date().toISOString(),
      });
    }
  }, [auditData]);

  // Helper functions for notification processing
  const getNotificationTitle = (action) => {
    const titles = {
      login: 'User Login',
      logout: 'User Logout',
      password_change: 'Password Changed',
      mfa_enable: 'MFA Enabled',
      mfa_disable: 'MFA Disabled',
      user_create: 'New User Created',
      user_update: 'User Updated',
      failed_login: 'Failed Login Attempt',
      suspicious_activity: 'Suspicious Activity',
    };
    return titles[action] || 'System Activity';
  };

  const getNotificationMessage = (log) => {
    const baseMessage = `${log.user?.firstName || 'User'} ${log.user?.lastName || ''}`;
    
    switch (log.action) {
      case 'login':
        return `${baseMessage} logged in from ${log.ipAddress}`;
      case 'logout':
        return `${baseMessage} logged out`;
      case 'password_change':
        return `${baseMessage} changed their password`;
      case 'mfa_enable':
        return `${baseMessage} enabled MFA`;
      case 'mfa_disable':
        return `${baseMessage} disabled MFA`;
      case 'user_create':
        return `New user ${baseMessage} was created`;
      case 'user_update':
        return `User ${baseMessage} was updated`;
      case 'failed_login':
        return `Failed login attempt for ${log.email || 'unknown user'}`;
      default:
        return `${baseMessage} performed ${log.action}`;
    }
  };

  const getNotificationType = (action) => {
    const types = {
      login: 'info',
      logout: 'info',
      password_change: 'warning',
      mfa_enable: 'success',
      mfa_disable: 'warning',
      user_create: 'info',
      user_update: 'info',
      failed_login: 'error',
      suspicious_activity: 'error',
    };
    return types[action] || 'info';
  };

  // Add notification manually
  const addNotification = useCallback((notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification,
    });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.MARK_AS_READ,
      payload: notificationId,
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    dispatch({
      type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ,
    });
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: notificationId,
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({
      type: NOTIFICATION_ACTIONS.CLEAR_ALL,
    });
  }, []);

  // Update preferences
  const updatePreferences = useCallback((preferences) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_PREFERENCES,
      payload: preferences,
    });
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return state.notifications.filter(notification => notification.type === type);
  }, [state.notifications]);

  // Get recent notifications
  const getRecentNotifications = useCallback((limit = 10) => {
    return state.notifications.slice(0, limit);
  }, [state.notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(notification => !notification.read);
  }, [state.notifications]);

  // Check if user should receive notification based on preferences
  const shouldReceiveNotification = useCallback((notification) => {
    const { preferences } = state;
    
    switch (notification.type) {
      case 'error':
      case 'warning':
        return preferences.securityAlerts;
      case 'success':
        return preferences.systemUpdates;
      case 'info':
        return preferences.userActivity;
      default:
        return true;
    }
  }, [state.preferences]);

  // Context value
  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading || auditLoading,
    lastChecked: state.lastChecked,
    preferences: state.preferences,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updatePreferences,
    getNotificationsByType,
    getRecentNotifications,
    getUnreadNotifications,
    shouldReceiveNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
