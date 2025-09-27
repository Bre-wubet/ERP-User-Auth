import React from 'react';
import { Search, Filter } from 'lucide-react';
import Input from '../ui/Input';
import Card from '../ui/Card';

/**
 * Role Filters Component
 * Handles search filtering for roles
 */
const RoleFilters = ({ 
  searchQuery, 
  onSearchChange 
}) => {
  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={onSearchChange}
            icon={<Search className="h-5 w-5 text-sage-400" />}
          />
        </div>
        <div className="flex items-end">
          <div className="text-sm text-sage-600">
            {searchQuery && `Searching for: "${searchQuery}"`}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RoleFilters;
