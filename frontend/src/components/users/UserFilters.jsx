import React from 'react';
import { Search, Filter } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';

/**
 * User Filters Component
 * Handles search and role filtering for users
 */
const UserFilters = ({ 
  searchQuery, 
  onSearchChange, 
  selectedRole, 
  onRoleChange, 
  roles = [] 
}) => {
  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={onSearchChange}
            icon={<Search className="h-5 w-5 text-sage-400" />}
          />
        </div>
        <div>
          <Select
            value={selectedRole}
            onChange={onRoleChange}
            icon={<Filter className="h-5 w-5 text-sage-400" />}
          >
            <option value="">All Roles</option>
            {Array.isArray(roles) && roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end">
          <div className="text-sm text-sage-600">
            {searchQuery && `Searching for: "${searchQuery}"`}
            {selectedRole && ` • Filtered by: ${roles.find(r => r.id === selectedRole)?.name || 'Role'}`}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserFilters;
