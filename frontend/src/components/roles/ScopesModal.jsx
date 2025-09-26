import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Tag,
  Users,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { roleAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

/**
 * Scopes Management Modal Component
 * Comprehensive scope management with CRUD operations and role assignment
 */

const ScopesModal = ({ 
  isOpen, 
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingScope, setEditingScope] = useState(null);
  
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Check permissions
  const canManageScopes = hasRole(['admin', 'manager']);

  // Fetch available scopes
  const { 
    data: scopesData, 
    isLoading: scopesLoading, 
    error: scopesError 
  } = useQuery({
    queryKey: ['available-scopes'],
    queryFn: roleAPI.getAvailableScopes,
    enabled: isOpen,
  });

  // Fetch roles with scopes for statistics
  const { data: rolesData } = useQuery({
    queryKey: ['roles-for-scopes'],
    queryFn: () => roleAPI.getRoles({ limit: 100 }),
    enabled: isOpen,
  });

  // Create scope mutation
  const createScopeMutation = useMutation({
    mutationFn: (scopeData) => roleAPI.createScope(scopeData),
    onSuccess: () => {
      toast.success('Scope created successfully!');
      queryClient.invalidateQueries(['available-scopes']);
      queryClient.invalidateQueries(['roles']);
      setShowCreateForm(false);
      reset();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to create scope';
      toast.error(errorMessage);
    }
  });

  // Update scope mutation
  const updateScopeMutation = useMutation({
    mutationFn: ({ scopeId, scopeData }) => roleAPI.updateScope(scopeId, scopeData),
    onSuccess: () => {
      toast.success('Scope updated successfully!');
      queryClient.invalidateQueries(['available-scopes']);
      queryClient.invalidateQueries(['roles']);
      setEditingScope(null);
      reset();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to update scope';
      toast.error(errorMessage);
    }
  });

  // Delete scope mutation
  const deleteScopeMutation = useMutation({
    mutationFn: (scopeId) => roleAPI.deleteScope(scopeId),
    onSuccess: () => {
      toast.success('Scope deleted successfully!');
      queryClient.invalidateQueries(['available-scopes']);
      queryClient.invalidateQueries(['roles']);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete scope';
      toast.error(errorMessage);
    }
  });

  const handleClose = () => {
    setSearchQuery('');
    setShowCreateForm(false);
    setEditingScope(null);
    reset();
    onClose();
  };

  const onSubmit = (data) => {
    if (editingScope) {
      updateScopeMutation.mutate({
        scopeId: editingScope.id,
        scopeData: data
      });
    } else {
      createScopeMutation.mutate(data);
    }
  };

  const handleDeleteScope = (scopeId) => {
    if (window.confirm('Are you sure you want to delete this scope? This action cannot be undone.')) {
      deleteScopeMutation.mutate(scopeId);
    }
  };

  const handleEditScope = (scope) => {
    setEditingScope(scope);
    setShowCreateForm(true);
  };

  const scopes = Array.isArray(scopesData?.data) ? scopesData.data : [];
  const roles = Array.isArray(rolesData?.data?.data) ? rolesData.data.data : [];

  // Filter scopes based on search
  const filteredScopes = scopes.filter(scope => 
    scope.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get scope statistics
  const getScopeStats = (scope) => {
    const rolesWithScope = roles.filter(role => role.scope === scope);
    const usersWithScope = rolesWithScope.reduce((total, role) => 
      total + (role._count?.users || 0), 0
    );
    return { roles: rolesWithScope.length, users: usersWithScope };
  };

  // Scope icons mapping
  const getScopeIcon = (scope) => {
    const iconMap = {
      'admin': Settings,
      'management': BarChart3,
      'hr': Users,
      'finance': CreditCard,
      'audit': FileText,
      'user': UserCheck,
      'default': Shield
    };
    return iconMap[scope] || iconMap.default;
  };

  // Scope descriptions
  const getScopeDescription = (scope) => {
    const descriptions = {
      'admin': 'Full system access and administrative privileges',
      'management': 'Management module access and reporting',
      'hr': 'Human resources module access and employee management',
      'finance': 'Finance module access and financial reporting',
      'audit': 'Audit and compliance access and reporting',
      'user': 'Basic user access and profile management'
    };
    return descriptions[scope] || 'Custom scope with specific permissions';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Scope Management"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Available Scopes</h3>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {scopes.length} scopes
            </span>
          </div>
          
          {canManageScopes && (
            <Button
              onClick={() => setShowCreateForm(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Scope
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search scopes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Permission Check */}
        {!canManageScopes && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  View Only Mode
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  You need admin or manager role to create, edit, or delete scopes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {editingScope ? 'Edit Scope' : 'Create New Scope'}
                </h4>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingScope(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeOff className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Scope Name"
                  placeholder="e.g., marketing, sales, support"
                  {...register('name', { 
                    required: 'Scope name is required',
                    minLength: { value: 2, message: 'Scope name must be at least 2 characters' }
                  })}
                  error={errors.name?.message}
                  defaultValue={editingScope?.name || ''}
                />
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingScope(null);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={createScopeMutation.isPending || updateScopeMutation.isPending}
                  >
                    {editingScope ? 'Update Scope' : 'Create Scope'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Scopes List */}
        {scopesError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Error Loading Scopes
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {scopesError.message || 'Failed to load scopes'}
                </p>
              </div>
            </div>
          </div>
        ) : scopesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading scopes...</span>
          </div>
        ) : filteredScopes.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No scopes found' : 'No scopes available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first scope to get started'
              }
            </p>
            {canManageScopes && !searchQuery && (
              <Button
                onClick={() => setShowCreateForm(true)}
                icon={<Plus className="h-4 w-4" />}
              >
                Create First Scope
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScopes.map((scope, index) => {
              const IconComponent = getScopeIcon(scope);
              const stats = getScopeStats(scope);
              
              return (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {scope}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {getScopeDescription(scope)}
                          </p>
                        </div>
                      </div>
                      
                      {canManageScopes && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditScope(scope)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                            title="Edit Scope"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteScope(scope)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            title="Delete Scope"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.roles}
                        </div>
                        <div className="text-xs text-gray-500">Roles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.users}
                        </div>
                        <div className="text-xs text-gray-500">Users</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Tag className="h-3 w-3" />
                        <span>Scope ID: {scope}</span>
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                        {stats.roles > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Scope Guidelines */}
        <Card>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Scope Usage Guidelines</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Best Practices</h5>
                <ul className="space-y-1">
                  <li>• Use scopes to limit access to specific modules</li>
                  <li>• Global roles have access to all modules</li>
                  <li>• Scoped roles are more secure for limited access</li>
                  <li>• Consider using scopes for department-specific roles</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Security Tips</h5>
                <ul className="space-y-1">
                  <li>• Regularly review scope assignments</li>
                  <li>• Use principle of least privilege</li>
                  <li>• Monitor scope usage and permissions</li>
                  <li>• Document scope purposes and limitations</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default ScopesModal;
