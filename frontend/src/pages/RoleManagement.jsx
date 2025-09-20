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
  UserMinus
} from 'lucide-react';
import { roleAPI, userAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
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
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch roles with filters
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['roles', currentPage, pageSize, searchQuery],
    queryFn: () => roleAPI.getRoles({
      page: currentPage,
      limit: pageSize,
      search: searchQuery
    }),
    keepPreviousData: true,
  });

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: () => userAPI.getUsers({ limit: 100 }),
  });

  const roles = rolesData?.data || [];
  const pagination = rolesData?.pagination || {};
  const users = usersData?.data || [];

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

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) => roleAPI.assignRoleToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['users']);
      setShowAssignModal(false);
      setSelectedRole(null);
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign role');
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

  const handleAssignRole = (data) => {
    assignRoleMutation.mutate({ userId: data.userId, roleId: selectedRole.id });
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const openAssignModal = (role) => {
    setSelectedRole(role);
    setShowAssignModal(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Role Name',
      render: (role) => (
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          <span className="font-medium">{role.name}</span>
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
      render: (role) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-1" />
          <span>{role._aggr_count_users || 0}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (role) => format(new Date(role.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (role) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(role)}
            icon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => openAssignModal(role)}
            icon={<UserPlus className="h-4 w-4" />}
          >
            Assign
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteRole(role.id)}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage roles, permissions, and user assignments</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-5 w-5" />}
        >
          Create Role
        </Button>
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
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedRole(null);
        }}
        title={`Assign Role: ${selectedRole?.name}`}
      >
        {selectedRole && (
          <AssignRoleForm
            role={selectedRole}
            users={users}
            onSubmit={handleAssignRole}
            onCancel={() => {
              setShowAssignModal(false);
              setSelectedRole(null);
            }}
            loading={assignRoleMutation.isPending}
          />
        )}
      </Modal>
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

// Assign Role Form Component
const AssignRoleForm = ({ role, users, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Filter users who don't already have this role
  const availableUsers = users.filter(user => user.roleId !== role.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Role:</strong> {role.name}
          {role.scope && <span> ({role.scope})</span>}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <select
          {...register('userId', { required: 'Please select a user' })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a user...</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="text-sm text-red-600 mt-1">{errors.userId.message}</p>
        )}
        {availableUsers.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            All users already have this role assigned.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          loading={loading}
          disabled={availableUsers.length === 0}
        >
          Assign Role
        </Button>
      </div>
    </form>
  );
};

export default RoleManagement;
