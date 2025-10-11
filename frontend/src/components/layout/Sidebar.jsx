import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  HelpCircle,
  Activity,
  Smartphone,
  Key,
} from 'lucide-react';

/**
 * Sidebar Component
 * Navigation sidebar with role-based menu items
 */

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user, logout, hasRole } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'hr', 'user'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['admin', 'manager', 'hr'],
    },
    {
      name: 'Roles',
      href: '/roles',
      icon: Shield,
      roles: ['admin', 'manager'],
    },
    {
      name: 'Audit Logs',
      href: '/audit-logs',
      icon: FileText,
      roles: ['admin', 'auditor'],
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['admin', 'manager', 'hr', 'user'],
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      name: 'MFA Management',
      href: '/mfa-management',
      icon: Key,
      roles: ['admin', 'manager', 'hr', 'user'],
    },
    {
      name: 'Session Management',
      href: '/session-management',
      icon: Smartphone,
      roles: ['admin', 'manager', 'hr', 'user'],
    },
    {
      name: 'System Health',
      href: '/system-health',
      icon: Activity,
      roles: ['admin'],
    },
    {
      name: 'Admin Tools',
      href: '/admin-tools',
      icon: Settings,
      roles: ['admin'],
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['admin', 'manager', 'hr', 'user'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => hasRole(item.roles));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={clsx(
      'bg-gray-900 text-white transition-all duration-300 flex flex-col sticky top-0 h-screen overflow-y-auto',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">
              ERP System
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-blue-400 truncate">
                {user?.role?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center px-3 py-2 rounded-lg transition-colors group relative',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={clsx('h-5 w-5', isCollapsed ? '' : 'mr-3')} />
              {!isCollapsed && (
                <span className="text-sm font-medium flex-1">{item.name}</span>
              )}
              
              {/* Badge for notifications */}
              {item.badge && item.badge > 0 && (
                <span className={clsx(
                  'inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full',
                  isCollapsed ? 'absolute -top-1 -right-1' : 'ml-2'
                )}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {/* Help */}
        <button
          onClick={() => navigate('/help')}
          className={clsx(
            'flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full',
            isCollapsed ? 'justify-center' : ''
          )}
          title={isCollapsed ? 'Help' : undefined}
        >
          <HelpCircle className={clsx('h-5 w-5', isCollapsed ? '' : 'mr-3')} />
          {!isCollapsed && (
            <span className="text-sm font-medium">Help</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full',
            isCollapsed ? 'justify-center' : ''
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={clsx('h-5 w-5', isCollapsed ? '' : 'mr-3')} />
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
