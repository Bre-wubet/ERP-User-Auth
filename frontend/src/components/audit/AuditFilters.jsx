import React from 'react';
import { Search, Filter, RefreshCw, Calendar, User, Activity } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * Audit Filters Component
 * Handles filtering and search for audit logs
 */
const AuditFilters = ({ 
  searchQuery,
  selectedModule,
  selectedAction,
  selectedUser,
  dateFrom,
  dateTo,
  modules = [],
  actions = [],
  users = [],
  onSearchChange,
  onFilterChange,
  onResetFilters,
  onRefresh,
  loading = false
}) => {
  // Ensure modules and actions are arrays
  const safeModules = Array.isArray(modules) ? modules : [];
  const safeActions = Array.isArray(actions) ? actions : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // Show loading state if no data is available
  const isLoadingData = safeModules.length === 0 && safeActions.length === 0 && !loading;

  return (
    <Card>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search audit logs..."
              value={searchQuery}
              onChange={onSearchChange}
              icon={<Search className="h-5 w-5 text-sage-400" />}
            />
          </div>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Select
              label="Module"
              value={selectedModule}
              onChange={(e) => onFilterChange('module', e.target.value)}
              icon={<Activity className="h-4 w-4" />}
            >
              <option value="">All Modules</option>
              {safeModules.map(module => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Select
              label="Action"
              value={selectedAction}
              onChange={(e) => onFilterChange('action', e.target.value)}
              icon={<Filter className="h-4 w-4" />}
            >
              <option value="">All Actions</option>
              {safeActions.map(action => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Select
              label="User"
              value={selectedUser}
              onChange={(e) => onFilterChange('user', e.target.value)}
              icon={<User className="h-4 w-4" />}
            >
              <option value="">All Users</option>
              {safeUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>

          <div>
            <Input
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-sage-200">
          <div className="text-sm text-sage-600">
            {isLoadingData && (
              <span className="text-forest-600">Loading filter options...</span>
            )}
            {!isLoadingData && searchQuery && `Searching for: "${searchQuery}"`}
            {!isLoadingData && (selectedModule || selectedAction || selectedUser || dateFrom || dateTo) && (
              <span className="ml-2">• Filters applied</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            disabled={loading}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AuditFilters;
