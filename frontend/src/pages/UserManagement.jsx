import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Shield,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Activity,
  Smartphone
} from 'lucide-react';
import { userAPI, roleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * User Management Page
 * Comprehensive user management with CRUD operations
 */
const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserStatsModal, setShowUserStatsModal] = useState(false);
  const [showUserSessionsModal, setShowUserSessionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();
  const { hasRole, user } = useAuth();

  // Check if user has permission to manage users
  const canManageUsers = hasRole(['admin', 'manager', 'hr']);
  
  // Debug permission check
  console.log('Permission Debug:', {
    userRole: user?.role?.name,
    canManageUsers,
    hasRole: hasRole
  });

  // Fetch users with filters (only if user has permission)
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users', currentPage, pageSize, searchQuery, selectedRole],
    queryFn: () => userAPI.getUsers({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      roleId: selectedRole || undefined
    }),
    enabled: canManageUsers, // Only fetch if user has permission
    keepPreviousData: true,
  });

  // Fetch roles for filters and forms (only if user has permission)
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleAPI.getRoles({ limit: 100 }),
    enabled: canManageUsers, // Only fetch if user has permission
  });

  const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : Array.isArray(usersData?.data) ? usersData.data : [];
  const pagination = usersData?.data?.pagination || usersData?.pagination || {};
  const roles = Array.isArray(rolesData?.data?.data) ? rolesData.data.data : Array.isArray(rolesData?.data) ? rolesData.data : [];

  // Debug logging
  console.log('UserManagement Debug:', {
    usersData,
    users,
    usersLoading,
    usersError,
    canManageUsers
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: userAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowCreateModal(false);
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }) => userAPI.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  // Activate/Deactivate user mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => 
      isActive ? userAPI.activateUser(userId) : userAPI.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    },
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateUser = (data) => {
    createUserMutation.mutate(data);
  };

  const handleEditUser = (data) => {
    updateUserMutation.mutate({ userId: selectedUser.id, userData: data });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleToggleStatus = (user) => {
    toggleUserStatusMutation.mutate({ 
      userId: user.id, 
      isActive: !user.isActive 
    });
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openUserStatsModal = (user) => {
    setSelectedUser(user);
    setShowUserStatsModal(true);
  };

  const openUserSessionsModal = (user) => {
    setSelectedUser(user);
    setShowUserSessionsModal(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => `${user.firstName} ${user.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (user) => user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy') : 'Never',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (user) => format(new Date(user.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(user)}
            icon={<Edit className="h-4 w-4" />}
            title="Edit User"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openUserStatsModal(user)}
            icon={<Activity className="h-4 w-4" />}
            title="View Statistics"
          >
            Stats
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openUserSessionsModal(user)}
            icon={<Smartphone className="h-4 w-4" />}
            title="View Sessions"
          >
            Sessions
          </Button>
          <Button
            size="sm"
            variant={user.isActive ? "outline" : "primary"}
            onClick={() => handleToggleStatus(user)}
            icon={user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            title={user.isActive ? 'Deactivate User' : 'Activate User'}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteUser(user.id)}
            icon={<Trash2 className="h-4 w-4" />}
            title="Delete User"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Show access denied if user doesn't have permission
  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access user management. This feature requires admin, manager, or HR role.
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-5 w-5" />}
        >
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              icon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <div>
            <Select
              value={selectedRole}
              onChange={handleRoleFilter}
              placeholder="Filter by role"
            >
              <option value="">All Roles</option>
              {Array.isArray(roles) && roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('');
                setCurrentPage(1);
              }}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {canManageUsers ? (
          <Table
            data={users}
            columns={columns}
            loading={usersLoading}
            error={usersError}
            pagination={{
              current: currentPage,
              total: pagination.totalPages || 0,
              pageSize: pageSize,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
            }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Loading user data...
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <CreateUserForm
          roles={roles}
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          loading={createUserMutation.isPending}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        title="Edit User"
      >
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            roles={roles}
            onSubmit={handleEditUser}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            loading={updateUserMutation.isPending}
          />
        )}
      </Modal>

      {/* User Statistics Modal */}
      <Modal
        isOpen={showUserStatsModal}
        onClose={() => {
          setShowUserStatsModal(false);
          setSelectedUser(null);
        }}
        title={`User Statistics - ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        size="lg"
      >
        {selectedUser && (
          <UserStatsDisplay userId={selectedUser.id} />
        )}
      </Modal>

      {/* User Sessions Modal */}
      <Modal
        isOpen={showUserSessionsModal}
        onClose={() => {
          setShowUserSessionsModal(false);
          setSelectedUser(null);
        }}
        title={`User Sessions - ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        size="lg"
      >
        {selectedUser && (
          <UserSessionsDisplay userId={selectedUser.id} />
        )}
      </Modal>
    </div>
  );
};

// Create User Form Component
const CreateUserForm = ({ roles, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('firstName', { required: 'First name is required' })}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          {...register('lastName', { required: 'Last name is required' })}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        label="Email"
        type="email"
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={errors.email?.message}
      />

      <Input
        label="Password"
        type="password"
        {...register('password', { 
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
        })}
        error={errors.password?.message}
      />

      <Select
        label="Role"
        {...register('roleId', { required: 'Role is required' })}
        error={errors.roleId?.message}
      >
        <option value="">Select a role</option>
        {Array.isArray(roles) && roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </Select>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create User
        </Button>
      </div>
    </form>
  );
};

// Edit User Form Component
const EditUserForm = ({ user, roles, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      isActive: user.isActive,
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('firstName', { required: 'First name is required' })}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          {...register('lastName', { required: 'Last name is required' })}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        label="Email"
        type="email"
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={errors.email?.message}
      />

      <Select
        label="Role"
        {...register('roleId', { required: 'Role is required' })}
        error={errors.roleId?.message}
      >
        <option value="">Select a role</option>
        {Array.isArray(roles) && roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </Select>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Update User
        </Button>
      </div>
    </form>
  );
};

// User Statistics Display Component
const UserStatsDisplay = ({ userId }) => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => userAPI.getUserStats(userId),
  });

  const stats = statsData?.data || {};

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalLogins || 0}</div>
          <div className="text-sm text-blue-800">Total Logins</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.lastLoginDays || 0}</div>
          <div className="text-sm text-green-800">Days Since Last Login</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.activeSessions || 0}</div>
          <div className="text-sm text-purple-800">Active Sessions</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.failedLogins || 0}</div>
          <div className="text-sm text-orange-800">Failed Logins</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Login History</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">
            Last Login: {stats.lastLoginAt ? format(new Date(stats.lastLoginAt), 'PPpp') : 'Never'}
          </div>
          <div className="text-sm text-gray-600">
            Account Created: {stats.createdAt ? format(new Date(stats.createdAt), 'PPpp') : 'Unknown'}
          </div>
          <div className="text-sm text-gray-600">
            Email Verified: {stats.emailVerified ? 'Yes' : 'No'}
          </div>
          <div className="text-sm text-gray-600">
            MFA Enabled: {stats.mfaEnabled ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Sessions Display Component
const UserSessionsDisplay = ({ userId }) => {
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: () => userAPI.getUserSessions(userId),
  });

  const sessions = Array.isArray(sessionsData?.data?.data) ? sessionsData.data.data : Array.isArray(sessionsData?.data) ? sessionsData.data : [];

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Active Sessions</h4>
        <span className="text-sm text-gray-600">{sessions.length} sessions</span>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active sessions found
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {session.deviceName || 'Unknown Device'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.location || 'Unknown Location'} • {session.ip || 'Unknown IP'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-900">
                    {session.lastActivityAt 
                      ? format(new Date(session.lastActivityAt), 'MMM dd, HH:mm')
                      : 'Never'
                    }
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;
