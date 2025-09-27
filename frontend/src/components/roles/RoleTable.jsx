import React from 'react';
import { Shield, Edit, Trash2, Users, Activity, UserPlus } from 'lucide-react';
import Card from '../ui/Card';
import Table from '../ui/Table';
import { format } from 'date-fns';

/**
 * Role Table Component
 * Displays roles in a table with actions
 */
const RoleTable = ({ 
  roles = [], 
  loading = false, 
  error = null,
  pagination = {},
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onAssign,
  onViewStats,
  onViewUsers,
  canManageRoles = false
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Role Name',
      render: (role) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-forest-100 flex items-center justify-center mr-3">
            <Shield className="h-4 w-4 text-forest-600" />
          </div>
          <div>
            <div className="font-medium text-forest-900">
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </div>
            {role.scope && (
              <div className="text-xs text-sage-600">
                Scope: {role.scope}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'scope',
      label: 'Scope',
      render: (role) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          role.scope 
            ? 'bg-moss-100 text-moss-800' 
            : 'bg-sage-100 text-sage-800'
        }`}>
          {role.scope || 'Global'}
        </span>
      ),
    },
    {
      key: 'userCount',
      label: 'Users',
      render: (role) => {
        const userCount = role._count?.users || 0;
        return (
          <div className="flex items-center">
            <Users className={`h-4 w-4 mr-1 ${userCount > 0 ? 'text-moss-500' : 'text-sage-400'}`} />
            <span className={`font-medium ${userCount > 0 ? 'text-moss-700' : 'text-sage-500'}`}>
              {userCount}
            </span>
            {userCount > 0 && (
              <span className="ml-1 text-xs text-moss-600">Active</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (role) => (
        <div className="text-sm text-sage-600">
          {format(new Date(role.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (role) => (
        <div className="text-sm text-sage-600">
          {format(new Date(role.updatedAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (role) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(role)}
            className="p-2 text-sage-600 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors duration-200"
            title="Edit Role"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onViewStats(role)}
            className="p-2 text-sage-600 hover:text-moss-600 hover:bg-moss-50 rounded-lg transition-colors duration-200"
            title="View Statistics"
          >
            <Activity className="h-4 w-4" />
          </button>
          
          {role._count?.users > 0 && (
            <button
              onClick={() => onViewUsers(role)}
              className="p-2 text-sage-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              title={`View Users (${role._count.users})`}
            >
              <Users className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => onAssign(role)}
            className="p-2 text-sage-600 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors duration-200"
            title="Assign Role to User"
          >
            <UserPlus className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(role.id)}
            className="p-2 text-sage-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete Role"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (!canManageRoles) {
    return (
      <Card>
        <div className="text-center py-8 text-sage-500">
          Loading role data...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table
        data={roles}
        columns={columns}
        loading={loading}
        error={error}
        pagination={{
          current: pagination.currentPage || 1,
          total: pagination.totalPages || 0,
          pageSize: pagination.pageSize || 10,
          onPageChange,
          onPageSizeChange,
        }}
      />
    </Card>
  );
};

export default RoleTable;
