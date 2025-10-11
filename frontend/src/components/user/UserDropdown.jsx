import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Clock, 
  Smartphone,
  ChevronRight,
  X,
  CheckCircle,
  AlertTriangle,
  Key,
  Bell,
  Activity,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Enhanced User Dropdown Component
 * Displays user profile with quick actions and navigation
 */
const UserDropdown = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [showQuickActions, setShowQuickActions] = useState(false);
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

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'profile':
        handleNavigation('/profile');
        break;
      case 'security':
        handleNavigation('/profile?tab=security');
        break;
      case 'sessions':
        handleNavigation('/profile?tab=sessions');
        break;
      case 'mfa':
        handleNavigation('/mfa-management');
        break;
      case 'settings':
        handleNavigation('/profile');
        break;
      default:
        break;
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  // Get security status
  const getSecurityStatus = () => {
    const issues = [];
    if (!user?.emailVerified) issues.push('Email not verified');
    if (!user?.mfaEnabled) issues.push('MFA not enabled');
    
    return {
      hasIssues: issues.length > 0,
      issues,
      status: issues.length === 0 ? 'secure' : issues.length === 1 ? 'warning' : 'critical'
    };
  };

  const securityStatus = getSecurityStatus();

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'secure':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(securityStatus.status)}`}>
                  {getStatusIcon(securityStatus.status)}
                  <span className="ml-1">
                    {securityStatus.status === 'secure' ? 'Secure' : 
                     securityStatus.status === 'warning' ? 'Needs Attention' : 'Security Issues'}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Security Status */}
        {securityStatus.hasIssues && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800">Security Recommendations</h4>
                <ul className="mt-1 text-xs text-yellow-700">
                  {securityStatus.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="text-xs text-blue-600 hover:text-blue-500"
          >
            {showQuickActions ? 'Hide' : 'Show All'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickAction('profile')}
            className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </button>
          <button
            onClick={() => handleQuickAction('security')}
            className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </button>
          <button
            onClick={() => handleQuickAction('sessions')}
            className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Sessions
          </button>
          <button
            onClick={() => handleQuickAction('mfa')}
            className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Key className="h-4 w-4 mr-2" />
            MFA
          </button>
        </div>

        {showQuickActions && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickAction('settings')}
              className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
            <button
              onClick={() => handleNavigation('/audit-logs')}
              className="flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </button>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Role</span>
            <span className="font-medium text-gray-900">{user?.role?.name || 'No Role'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Login</span>
            <span className="font-medium text-gray-900">
              {user?.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-1">
        <button
          onClick={() => handleNavigation('/profile')}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <User className="h-4 w-4 mr-3" />
          <span>View Profile</span>
          <ChevronRight className="h-4 w-4 ml-auto" />
        </button>
        
        <button
          onClick={() => handleNavigation('/profile?tab=security')}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Shield className="h-4 w-4 mr-3" />
          <span>Security Settings</span>
          <ChevronRight className="h-4 w-4 ml-auto" />
        </button>

        <button
          onClick={() => handleNavigation('/profile?tab=sessions')}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Smartphone className="h-4 w-4 mr-3" />
          <span>Active Sessions</span>
          <ChevronRight className="h-4 w-4 ml-auto" />
        </button>

        {hasRole(['admin', 'manager']) && (
          <button
            onClick={() => handleNavigation('/admin-tools')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-4 w-4 mr-3" />
            <span>Admin Tools</span>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </button>
        )}

        <div className="border-t border-gray-100 my-1" />
        
        <button
          onClick={() => handleNavigation('/help')}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <HelpCircle className="h-4 w-4 mr-3" />
          <span>Help & Support</span>
          <ChevronRight className="h-4 w-4 ml-auto" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
