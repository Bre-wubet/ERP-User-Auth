import React from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

/**
 * Role Form Component
 * Reusable form for creating and editing roles
 */
const RoleForm = ({ 
  role = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  title = 'Create Role'
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: role ? {
      name: role.name,
      description: role.description || '',
      scope: role.scope || ''
    } : {
      name: '',
      description: '',
      scope: ''
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Card>
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 rounded-full bg-forest-100 flex items-center justify-center mr-3">
          <Shield className="h-5 w-5 text-forest-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-forest-900">{title}</h3>
          <p className="text-sm text-sage-600">
            {role ? 'Update role information' : 'Create a new role for your organization'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <Input
            label="Role Name"
            placeholder="Enter role name (e.g., manager, hr, auditor)"
            error={errors.name?.message}
            required
            {...register('name', {
              required: 'Role name is required',
              minLength: {
                value: 2,
                message: 'Role name must be at least 2 characters'
              },
              maxLength: {
                value: 50,
                message: 'Role name must be less than 50 characters'
              },
              pattern: {
                value: /^[a-zA-Z0-9_-]+$/,
                message: 'Role name can only contain letters, numbers, hyphens, and underscores'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="Description"
            placeholder="Enter role description (optional)"
            error={errors.description?.message}
            {...register('description', {
              maxLength: {
                value: 200,
                message: 'Description must be less than 200 characters'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="Scope"
            placeholder="Enter scope (optional, e.g., department, project)"
            error={errors.scope?.message}
            {...register('scope', {
              maxLength: {
                value: 100,
                message: 'Scope must be less than 100 characters'
              }
            })}
          />
          <p className="text-xs text-sage-500 mt-1">
            Scope helps organize roles by department, project, or other criteria
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RoleForm;
