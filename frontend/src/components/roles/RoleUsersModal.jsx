import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, User, Mail, Calendar, Shield, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { userAPI } from '../../services/api';
import { format } from 'date-fns';

/**
 * Role Users Modal
 * Displays users assigned to a specific role
 */
const RoleUsersModal = ({ 
  isOpen, 
  onClose, 
  role 
}) => {
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['role-users', role?.id],
    queryFn: () => userAPI.getUsersByRole(role.id),
    enabled: !!role?.id && isOpen,
    retry: false,
  });

  const users = Array.isArray(usersData?.data?.data) 
    ? usersData.data.data 
    : Array.isArray(usersData?.data) 
    ? usersData.data 
    : [];

  const UserCard = ({ user }) => (
    <Card className="p-4">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-forest-100 flex items-center justify-center mr-3">
          <User className="h-5 w-5 text-forest-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-forest-900">
                {user.firstName} {user.lastName}
              </h4>
              <div className="flex items-center text-sm text-sage-600">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-sage-600">
                Joined: {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive 
                  ? 'bg-moss-100 text-moss-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Users with ${role?.name} Role`}
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-forest-900 mb-2">Unable to Load Users</h3>
          <p className="text-sage-600 mb-4">
            {error.response?.status === 403 
              ? 'You don\'t have permission to view users for this role.'
              : 'Failed to load users. Please try again.'
            }
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Role Info */}
          <Card className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-forest-100 flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-forest-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-forest-900">
                  {role?.name?.charAt(0).toUpperCase() + role?.name?.slice(1)} Role
                </h3>
                <p className="text-sage-600">
                  {users.length} user{users.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
            </div>
          </Card>

          {/* Users List */}
          {users.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-forest-900">Assigned Users</h4>
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-sage-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-forest-900 mb-2">No Users Assigned</h3>
              <p className="text-sage-600">
                This role doesn't have any users assigned to it yet.
              </p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RoleUsersModal;
