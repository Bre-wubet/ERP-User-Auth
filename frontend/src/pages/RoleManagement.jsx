import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Filter,
  RefreshCw,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Activity,
  Settings,
  Eye,
  BarChart3,
  UserCheck,
  MoreHorizontal
} from 'lucide-react';
import { roleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import RoleAssignmentModal from '../components/roles/RoleAssignmentModal';
import ScopesModal from '../components/roles/ScopesModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Role Management Page
 * Comprehensive role management with CRUD operations and user assignment
 */
const RoleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRoleStatsModal, setShowRoleStatsModal] = useState(false);
  const [showScopesModal, setShowScopesModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  // Check if user has permission to manage roles
  const canManageRoles = hasRole(['admin', 'manager']);

  // Fetch roles with filters (only if user has permission)
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['roles', currentPage, pageSize, searchQuery],
    queryFn: () => roleAPI.getRoles({
      page: currentPage,
      limit: pageSize,
      search: searchQuery
    }),
    enabled: canManageRoles, // Only fetch if user has permission
    keepPreviousData: true,
  });


  // Fetch role statistics (only if user has permission)
  const { data: roleStatsData } = useQuery({
    queryKey: ['role-stats'],
    queryFn: roleAPI.getRoleStats,
    enabled: canManageRoles,
  });


  // Extract roles from the nested data structure
  const roles = Array.isArray(rolesData?.data?.data) 
    ? rolesData.data.data 
    : Array.isArray(rolesData?.data) 
    ? rolesData.data 
    : Array.isArray(rolesData?.data?.roles) 
    ? rolesData.data.roles 
    : Array.isArray(rolesData?.data?.items) 
    ? rolesData.data.items 
    : Array.isArray(rolesData?.data?.results) 
    ? rolesData.data.results 
    : Array.isArray(rolesData?.roles) 
    ? rolesData.roles 
    : [];
  const pagination = rolesData?.data?.pagination || {};
  const roleStats = roleStatsData?.data || {};

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: roleAPI.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setShowCreateModal(false);
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, roleData }) => roleAPI.updateRole(roleId, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setShowEditModal(false);
      setSelectedRole(null);
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: roleAPI.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    },
  });


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateRole = (data) => {
    createRoleMutation.mutate(data);
  };

  const handleEditRole = (data) => {
    updateRoleMutation.mutate({ roleId: selectedRole.id, roleData: data });
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(roleId);
    }
  };


  const openEditModal = (role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const openAssignModal = (role) => {
    setSelectedRole(role);
    setShowAssignModal(true);
  };

  const openRoleStatsModal = (role) => {
    setSelectedRole(role);
    setShowRoleStatsModal(true);
  };

  const openScopesModal = () => {
    setShowScopesModal(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Role Name',
      render: (role) => (
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <span className="font-medium text-gray-900">
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </span>
            {role.scope && (
              <div className="text-xs text-gray-500">
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
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
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
            <Users className={`h-4 w-4 mr-1 ${userCount > 0 ? 'text-green-500' : 'text-gray-400'}`} />
            <span className={`font-medium ${userCount > 0 ? 'text-green-700' : 'text-gray-500'}`}>
              {userCount}
            </span>
            {userCount > 0 && (
              <span className="ml-1 text-xs text-green-600">Active</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (role) => format(new Date(role.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (role) => (
        <div className="text-sm text-gray-600">
          {format(new Date(role.updatedAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (role) => (
        <div className="flex items-center space-x-1">
          {/* Edit Role */}
          <button
            onClick={() => openEditModal(role)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit Role"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          {/* View Statistics */}
          <button
            onClick={() => openRoleStatsModal(role)}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            title="View Statistics"
          >
            <Activity className="h-4 w-4" />
          </button>
          
          {/* View Users (only if role has users) */}
          {role._count?.users > 0 && (
            <button
              onClick={() => {
                // TODO: Implement view users functionality
                toast.info(`Viewing users for ${role.name} role`);
              }}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              title={`View Users (${role._count.users})`}
            >
              <Users className="h-4 w-4" />
            </button>
          )}
          
          {/* Assign Role */}
          <button
            onClick={() => openAssignModal(role)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Assign Role to User"
          >
            <UserPlus className="h-4 w-4" />
          </button>
          
          {/* Delete Role */}
          <button
            onClick={() => handleDeleteRole(role.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete Role"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Show access denied if user doesn't have permission
  if (!canManageRoles) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600">Manage roles, permissions, and user assignments</p>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access role management. This feature requires admin or manager role.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage roles, permissions, and user assignments</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={openScopesModal}
            icon={<Shield className="h-5 w-5" />}
          >
            View Scopes
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="h-5 w-5" />}
          >
            Create Role
          </Button>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.reduce((total, role) => total + (role._count?.users || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Roles with Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.filter(role => (role._count?.users || 0) > 0).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unique Scopes</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(roles.map(role => role.scope).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={handleSearch}
              icon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Role Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Role Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-900">
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (role._count?.users || 0) > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(role._count?.users || 0)} users
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {role.scope ? `Scope: ${role.scope}` : 'Global scope'}
                </div>
                <div className="text-xs text-gray-500">
                  Created: {format(new Date(role.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Roles Table */}
      <Card>
        <Table
          data={roles}
          columns={columns}
          loading={rolesLoading}
          error={rolesError}
          pagination={{
            current: currentPage,
            total: pagination.totalPages || 0,
            pageSize: pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </Card>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Role"
      >
        <CreateRoleForm
          onSubmit={handleCreateRole}
          onCancel={() => setShowCreateModal(false)}
          loading={createRoleMutation.isPending}
        />
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
        }}
        title="Edit Role"
      >
        {selectedRole && (
          <EditRoleForm
            role={selectedRole}
            onSubmit={handleEditRole}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedRole(null);
            }}
            loading={updateRoleMutation.isPending}
          />
        )}
      </Modal>

      {/* Assign Role Modal */}
      <RoleAssignmentModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedRole(null);
        }}
        selectedRole={selectedRole}
        onSuccess={() => {
          // Additional success handling if needed
          console.log('Role assigned successfully');
        }}
      />

      {/* Role Statistics Modal */}
      <Modal
        isOpen={showRoleStatsModal}
        onClose={() => {
          setShowRoleStatsModal(false);
          setSelectedRole(null);
        }}
        title={`Role Statistics - ${selectedRole?.name}`}
        size="lg"
      >
        {selectedRole && (
          <RoleStatsDisplay role={selectedRole} />
        )}
      </Modal>

      {/* Available Scopes Modal */}
      <ScopesModal
        isOpen={showScopesModal}
        onClose={() => setShowScopesModal(false)}
      />
    </div>
  );
};

// Create Role Form Component
const CreateRoleForm = ({ onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Role Name"
        placeholder="e.g., Manager, HR Specialist"
        {...register('name', { 
          required: 'Role name is required',
          minLength: { value: 2, message: 'Role name must be at least 2 characters' }
        })}
        error={errors.name?.message}
      />

      <Input
        label="Scope"
        placeholder="e.g., management, hr, finance (optional)"
        {...register('scope')}
        error={errors.scope?.message}
        helperText="Optional scope to limit role access to specific modules"
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Role
        </Button>
      </div>
    </form>
  );
};

// Edit Role Form Component
const EditRoleForm = ({ role, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: role.name,
      scope: role.scope || '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Role Name"
        {...register('name', { 
          required: 'Role name is required',
          minLength: { value: 2, message: 'Role name must be at least 2 characters' }
        })}
        error={errors.name?.message}
      />

      <Input
        label="Scope"
        {...register('scope')}
        error={errors.scope?.message}
        helperText="Optional scope to limit role access to specific modules"
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Update Role
        </Button>
      </div>
    </form>
  );
};


// Role Statistics Display Component
const RoleStatsDisplay = ({ role }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{role._aggr_count_users || 0}</div>
          <div className="text-sm text-blue-800">Assigned Users</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{role.scope ? 'Scoped' : 'Global'}</div>
          <div className="text-sm text-green-800">Scope Type</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {format(new Date(role.createdAt), 'MMM yyyy')}
          </div>
          <div className="text-sm text-purple-800">Created</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {role.isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="text-sm text-orange-800">Status</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Role Details</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Role Name:</span>
            <span className="text-sm font-medium text-gray-900">{role.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Scope:</span>
            <span className="text-sm font-medium text-gray-900">{role.scope || 'Global'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Created:</span>
            <span className="text-sm font-medium text-gray-900">
              {format(new Date(role.createdAt), 'PPpp')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Last Updated:</span>
            <span className="text-sm font-medium text-gray-900">
              {role.updatedAt ? format(new Date(role.updatedAt), 'PPpp') : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {role.description && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Description</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{role.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};


export default RoleManagement;
