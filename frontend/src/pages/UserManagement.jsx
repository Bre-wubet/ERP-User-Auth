import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle } from 'lucide-react';
import { userAPI, roleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import UserFilters from '../components/users/UserFilters';
import UserTable from '../components/users/UserTable';
import UserForm from '../components/users/UserForm';
import UserStatsModal from '../components/users/UserStatsModal';
import UserSessionsModal from '../components/users/UserSessionsModal';
import toast from 'react-hot-toast';

/**
 * User Management Page (Refactored)
 * Comprehensive user management with modular components
 */
const UserManagement = () => {
  // State management
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
  const { hasRole } = useAuth();

  // Permission check
  const canManageUsers = hasRole(['admin', 'manager', 'hr']);

  // Data fetching
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users', currentPage, pageSize, searchQuery, selectedRole],
    queryFn: () => userAPI.getUsers({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      roleId: selectedRole || undefined
    }),
    enabled: canManageUsers,
    keepPreviousData: true,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleAPI.getRoles({ limit: 100 }),
    enabled: canManageUsers,
  });

  // Data processing
  const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : 
               Array.isArray(usersData?.data) ? usersData.data : [];
  const pagination = usersData?.data?.pagination || usersData?.pagination || {};
  const roles = Array.isArray(rolesData?.data?.data) ? rolesData.data.data : 
               Array.isArray(rolesData?.data) ? rolesData.data : [];

  // Mutations
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

  // Event handlers
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

  // Access denied view
  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-forest-900">User Management</h1>
            <p className="text-sage-600">Manage users, roles, and permissions</p>
          </div>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-forest-900 mb-2">Access Denied</h3>
            <p className="text-sage-600 mb-4">
              You don't have permission to access user management. This feature requires admin, manager, or HR role.
            </p>
            <p className="text-sm text-sage-500">
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
          <h1 className="text-2xl font-bold text-forest-900">User Management</h1>
          <p className="text-sage-600">Manage users, roles, and permissions</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-5 w-5" />}
        >
          Add User
        </Button>
      </div>

      {/* Filters */}
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        selectedRole={selectedRole}
        onRoleChange={handleRoleFilter}
        roles={roles}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        loading={usersLoading}
        error={usersError}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onEdit={openEditModal}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        onViewStats={openUserStatsModal}
        onViewSessions={openUserSessionsModal}
        canManageUsers={canManageUsers}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="lg"
      >
        <UserForm
          roles={roles}
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          loading={createUserMutation.isPending}
          mode="create"
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
        size="lg"
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            roles={roles}
            onSubmit={handleEditUser}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            loading={updateUserMutation.isPending}
            mode="edit"
          />
        )}
      </Modal>

      {/* User Statistics Modal */}
      <UserStatsModal
        isOpen={showUserStatsModal}
        onClose={() => {
          setShowUserStatsModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* User Sessions Modal */}
      <UserSessionsModal
        isOpen={showUserSessionsModal}
        onClose={() => {
          setShowUserSessionsModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;