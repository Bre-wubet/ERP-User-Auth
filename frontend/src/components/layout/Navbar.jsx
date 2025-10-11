import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import NotificationDropdown from '../notifications/NotificationDropdown';
import UserDropdown from '../user/UserDropdown';
import SearchDropdown from '../search/SearchDropdown';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Clock,
  ChevronDown,
} from 'lucide-react';

/**
 * Navbar Component
 * Top navigation bar with user menu and notifications
 */

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { unreadCount, addNotification } = useNotifications();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar-dropdown')) {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsNotificationsOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleNotificationToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Enhanced Search */}
              <div className="hidden lg:block ml-4">
                <div className="relative navbar-dropdown">
                  <button
                    onClick={handleSearchToggle}
                    className="flex items-center w-80 px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-500">Search users, roles, audit logs...</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
                  </button>
                  
                  <SearchDropdown
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Notifications */}
              <div className="relative navbar-dropdown">
                <button
                  onClick={handleNotificationToggle}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                <NotificationDropdown
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>

              {/* Enhanced User menu */}
              <div className="relative navbar-dropdown">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.role?.name}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                <UserDropdown
                  isOpen={isUserMenuOpen}
                  onClose={() => setIsUserMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* spacer for fixed navbar height */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
