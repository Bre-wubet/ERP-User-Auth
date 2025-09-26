import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { UserPlus, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { userAPI, roleAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

/**
 * Role Assignment Modal Component
 * Handles assigning roles to users with improved UX and error handling
 */

const RoleAssignmentModal = ({ 
  isOpen, 
  onClose, 
  selectedRole, 
  onSuccess 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Check permissions
  const canViewUsers = hasRole(['admin', 'manager', 'hr']);
  const canAssignRoles = hasRole(['admin', 'manager']);

  // Fetch users for assignment
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['users-for-assignment', searchQuery],
    queryFn: () => userAPI.getUsers({ 
      limit: 100, 
      search: searchQuery 
    }),
    enabled: canViewUsers && isOpen,
    select: (data) => {
      const users = Array.isArray(data?.data?.data) ? data.data.data : [];
      // Filter users who don't already have this role
      return users.filter(user => 
        !user.roleId || user.roleId !== selectedRole?.id
      );
    }
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) => roleAPI.assignRoleToUser(userId, roleId),
    onSuccess: (data, variables) => {
      toast.success(`Role assigned successfully!`);
      queryClient.invalidateQueries(['users-for-assignment']);
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['users']);
      
      // Reset form
      reset();
      setSelectedUserId('');
      
      // Call success callback
      if (onSuccess) {
        onSuccess(data, variables);
      }
      
      // Close modal
      onClose();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to assign role';
      toast.error(errorMessage);
    }
  });

  const handleClose = () => {
    reset();
    setSelectedUserId('');
    setSearchQuery('');
    onClose();
  };

  const onSubmit = (data) => {
    if (!selectedRole?.id) {
      toast.error('No role selected');
      return;
    }

    assignRoleMutation.mutate({
      userId: data.userId,
      roleId: selectedRole.id
    });
  };

  const availableUsers = usersData || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Assign Role: ${selectedRole?.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Role Information */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">
                {selectedRole?.name}
              </h3>
              {selectedRole?.scope && (
                <p className="text-sm text-blue-700">
                  Scope: {selectedRole.scope}
                </p>
              )}
              <p className="text-xs text-blue-600 mt-1">
                Available users: {availableUsers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Permission Check */}
        {!canViewUsers ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Permission Required
                </p>
                <p className="text-xs text-red-600 mt-1">
                  You need admin, manager, or HR role to view users for assignment.
                </p>
              </div>
            </div>
          </div>
        ) : !canAssignRoles ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Limited Access
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  You can view users but need admin or manager role to assign roles.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* User Search */}
        {canViewUsers && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* User Selection Form */}
        {canViewUsers && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              
              {usersError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Error Loading Users
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {usersError.message || 'Failed to load users'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : usersLoading ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600">Loading users...</span>
                  </div>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {searchQuery ? 'No users found matching your search' : 'No users available'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {searchQuery 
                          ? 'Try a different search term' 
                          : 'All users already have this role assigned'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('userId', { required: 'Please select a user' })}
                        value={user.id}
                        checked={selectedUserId === user.id}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="text-right">
                            {user.roleId && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Current: {user.role?.name || 'Unknown'}
                              </span>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {user.isActive ? (
                                <span className="text-green-600">Active</span>
                              ) : (
                                <span className="text-red-600">Inactive</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              {errors.userId && (
                <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.userId.message}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={assignRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={assignRoleMutation.isPending}
                disabled={availableUsers.length === 0 || !canAssignRoles}
                className="flex items-center space-x-2"
              >
                {assignRoleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Assign Role</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default RoleAssignmentModal;
