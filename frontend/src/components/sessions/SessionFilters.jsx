import React from 'react';
import { RefreshCw, Filter, Search } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * Session Filters Component
 * Handles filtering and search for sessions
 */
const SessionFilters = ({ 
  searchQuery,
  selectedStatus,
  selectedDevice,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  onRefresh,
  loading = false
}) => {
  return (
    <Card>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search sessions by device name or location..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Status"
              value={selectedStatus}
              onChange={(e) => onFilterChange('status', e.target.value)}
              icon={<Filter className="h-4 w-4" />}
            >
              <option value="">All Sessions</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </Select>
          </div>

          <div>
            <Select
              label="Device Type"
              value={selectedDevice}
              onChange={(e) => onFilterChange('device', e.target.value)}
              icon={<Filter className="h-4 w-4" />}
            >
              <option value="">All Devices</option>
              <option value="mobile">Mobile Devices</option>
              <option value="desktop">Desktop/Laptop</option>
            </Select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-sage-200">
          <div className="text-sm text-sage-600">
            {searchQuery && `Searching for: "${searchQuery}"`}
            {(selectedStatus || selectedDevice) && (
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

export default SessionFilters;
