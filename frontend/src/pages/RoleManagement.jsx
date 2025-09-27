import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Plus, 
  RefreshCw,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { roleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import RoleFilters from '../components/roles/RoleFilters';
import RoleTable from '../components/roles/RoleTable';
import RoleForm from '../components/roles/RoleForm';
import RoleStatsModal from '../components/roles/RoleStatsModal';
import RoleUsersModal from '../components/roles/RoleUsersModal';
import RoleAssignmentModal from '../components/roles/RoleAssignmentModal';
import ScopesModal from '../components/roles/ScopesModal';
import toast from 'react-hot-toast';

/**
 * Role Management Page - Refactored
 * Comprehensive role management with modular components
 */
const RoleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRoleStatsModal, setShowRoleStatsModal] = useState(false);
  const [showRoleUsersModal, setShowRoleUsersModal] = useState(false);
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
  const roleStats = roleStatsData?.data?.data || roleStatsData?.data || {};

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

  const openRoleUsersModal = (role) => {
    setSelectedRole(role);
    setShowRoleUsersModal(true);
  };

  const openScopesModal = () => {
    setShowScopesModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Show access denied if user doesn't have permission
  if (!canManageRoles) {
    return (
      <div className="min-h-screen bg-sage-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-4 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-forest-900 mb-4">Access Denied</h1>
            <p className="text-sage-600 mb-6">
              You don't have permission to manage roles. Contact your administrator for access.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-8">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-2">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-forest-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-forest-900">Role Management</h1>
                <p className="text-sage-600 mt-1">
                  Manage roles, permissions, and user assignments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries(['roles'])}
                disabled={rolesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${rolesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={openScopesModal}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Scopes
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {roleStats && Object.keys(roleStats).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-forest-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-sage-600">Total Roles</div>
                  <div className="text-2xl font-bold text-forest-900">
                    {roleStats.totalRoles || 0}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-moss-100 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-moss-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-sage-600">Active Roles</div>
                  <div className="text-2xl font-bold text-forest-900">
                    {roleStats.activeRoles || 0}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-sage-100 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-sage-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-sage-600">Assigned Users</div>
                  <div className="text-2xl font-bold text-forest-900">
                    {roleStats.activeUsers || 0}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-sage-600">Available Scopes</div>
                  <div className="text-2xl font-bold text-forest-900">
                    {roleStats.totalScopes || 0}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <RoleFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />

        {/* Roles Table */}
        <div className="mt-6">
          <RoleTable
            roles={roles}
            loading={rolesLoading}
            error={rolesError}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onEdit={openEditModal}
            onDelete={handleDeleteRole}
            onAssign={openAssignModal}
            onViewStats={openRoleStatsModal}
            onViewUsers={openRoleUsersModal}
            canManageRoles={canManageRoles}
          />
        </div>

        {/* Modals */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Role"
          size="md"
        >
          <RoleForm
            onSubmit={handleCreateRole}
            onCancel={() => setShowCreateModal(false)}
            loading={createRoleMutation.isPending}
          />
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          title="Edit Role"
          size="md"
        >
          <RoleForm
            role={selectedRole}
            onSubmit={handleEditRole}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedRole(null);
            }}
            loading={updateRoleMutation.isPending}
            title="Edit Role"
          />
        </Modal>

        <RoleStatsModal
          isOpen={showRoleStatsModal}
          onClose={() => {
            setShowRoleStatsModal(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
        />

        <RoleUsersModal
          isOpen={showRoleUsersModal}
          onClose={() => {
            setShowRoleUsersModal(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
        />

        <RoleAssignmentModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
        />

        <ScopesModal
          isOpen={showScopesModal}
          onClose={() => setShowScopesModal(false)}
        />
      </div>
    </div>
  );
};

export default RoleManagement;
