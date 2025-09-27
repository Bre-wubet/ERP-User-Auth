import React from 'react';
import { Edit, Trash2, UserCheck, UserX, Activity, Smartphone } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Table from '../ui/Table';
import { format } from 'date-fns';

/**
 * User Table Component
 * Displays users in a table with actions
 */
const UserTable = ({ 
  users = [], 
  loading = false, 
  error = null,
  pagination = {},
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewStats,
  onViewSessions,
  canManageUsers = false
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-forest-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-forest-700">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium text-forest-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-sage-600">
              ID: {user.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <div>
          <div className="font-medium text-forest-900">{user.email}</div>
          {user.emailVerified && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Verified
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest-100 text-forest-800">
          {user.role?.name || 'No Role'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.isActive 
            ? 'bg-moss-100 text-moss-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (user) => (
        <div className="text-sm">
          {user.lastLogin ? (
            <div>
              <div className="text-forest-900">{format(new Date(user.lastLogin), 'MMM dd, yyyy')}</div>
              <div className="text-sage-600">{format(new Date(user.lastLogin), 'HH:mm')}</div>
            </div>
          ) : (
            <span className="text-sage-500">Never</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (user) => (
        <div className="text-sm text-sage-600">
          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(user)}
            className="p-2 hover:bg-forest-50 hover:text-forest-700 hover:border-forest-300 transition-colors duration-200"
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewStats(user)}
            className="p-2 hover:bg-forest-50 hover:text-forest-700 hover:border-forest-300 transition-colors duration-200"
            title="View Statistics"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewSessions(user)}
            className="p-2 hover:bg-forest-50 hover:text-forest-700 hover:border-forest-300 transition-colors duration-200"
            title="View Sessions"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={user.isActive ? "outline" : "primary"}
            onClick={() => onToggleStatus(user)}
            className={`p-2 transition-colors duration-200 ${
              user.isActive 
                ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-300' 
                : 'hover:bg-moss-50 hover:text-moss-700'
            }`}
            title={user.isActive ? 'Deactivate User' : 'Activate User'}
          >
            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(user.id)}
            className="p-2 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors duration-200"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (!canManageUsers) {
    return (
      <Card>
        <div className="text-center py-8 text-sage-500">
          Loading user data...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table
        data={users}
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

export default UserTable;
