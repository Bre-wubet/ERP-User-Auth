import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  User, 
  Shield, 
  FileText, 
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { userAPI, auditAPI, roleAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

/**
 * Enhanced Search Component
 * Provides global search functionality across users, roles, and audit logs
 */
const SearchDropdown = ({ isOpen, onClose, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
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

  // Search users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: () => userAPI.searchUsers(searchQuery, { limit: 5 }),
    enabled: !!searchQuery && (activeTab === 'all' || activeTab === 'users'),
  });

  // Search roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['search-roles', searchQuery],
    queryFn: () => roleAPI.searchRoles(searchQuery, { limit: 5 }),
    enabled: !!searchQuery && (activeTab === 'all' || activeTab === 'roles'),
  });

  // Search audit logs
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['search-audit', searchQuery],
    queryFn: () => auditAPI.searchAuditLogs(searchQuery, { limit: 5 }),
    enabled: !!searchQuery && (activeTab === 'all' || activeTab === 'audit'),
  });

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(!!query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleResultClick = (type, id, data) => {
    switch (type) {
      case 'user':
        navigate(`/users`);
        break;
      case 'role':
        navigate(`/roles`);
        break;
      case 'audit':
        navigate(`/audit-logs`);
        break;
      default:
        break;
    }
    onClose();
  };

  const getSearchIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'role':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'audit':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSearchResults = () => {
    const results = [];
    
    if (activeTab === 'all' || activeTab === 'users') {
      const users = usersData?.data?.data || [];
      results.push(...users.map(user => ({
        type: 'user',
        id: user.id,
        title: `${user.firstName} ${user.lastName}`,
        subtitle: user.email,
        description: user.role?.name || 'No Role',
        data: user,
      })));
    }

    if (activeTab === 'all' || activeTab === 'roles') {
      const roles = rolesData?.data?.data || [];
      results.push(...roles.map(role => ({
        type: 'role',
        id: role.id,
        title: role.name,
        subtitle: role.description,
        description: `${role.scopes?.length || 0} scopes`,
        data: role,
      })));
    }

    if (activeTab === 'all' || activeTab === 'audit') {
      const auditLogs = auditData?.data?.data || [];
      results.push(...auditLogs.map(log => ({
        type: 'audit',
        id: log.id,
        title: `${log.user?.firstName || 'Unknown'} ${log.user?.lastName || ''}`,
        subtitle: log.action,
        description: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }),
        data: log,
      })));
    }

    return results.slice(0, 10); // Limit to 10 results
  };

  const searchResults = getSearchResults();
  const isLoading = usersLoading || rolesLoading || auditLoading;

  const tabs = [
    { id: 'all', label: 'All', count: searchResults.length },
    { id: 'users', label: 'Users', count: usersData?.data?.data?.length || 0 },
    { id: 'roles', label: 'Roles', count: rolesData?.data?.data?.length || 0 },
    { id: 'audit', label: 'Audit', count: auditData?.data?.data?.length || 0 },
  ];

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50"
    >
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search users, roles, audit logs..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search Tabs */}
        {searchQuery && (
          <div className="mt-3 flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-gray-100' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Search className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No results found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          ) : (
            <div className="py-1">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.type, result.id, result.data)}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mr-3">
                    {getSearchIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {result.subtitle}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!searchQuery && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleResultClick('user', null, null)}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <User className="h-4 w-4 mr-3 text-blue-500" />
              <span>View All Users</span>
            </button>
            <button
              onClick={() => handleResultClick('role', null, null)}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Shield className="h-4 w-4 mr-3 text-green-500" />
              <span>View All Roles</span>
            </button>
            <button
              onClick={() => handleResultClick('audit', null, null)}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FileText className="h-4 w-4 mr-3 text-purple-500" />
              <span>View Audit Logs</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {searchQuery && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            Press Enter to search or click a result to navigate
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
