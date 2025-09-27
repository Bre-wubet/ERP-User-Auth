import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

/**
 * User Form Component
 * Reusable form for creating and editing users
 */
const UserForm = ({ 
  user = null, 
  roles = [], 
  onSubmit, 
  onCancel, 
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: user ? {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      roleId: user.role?.id || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
    } : {}
  });

  const isEditMode = mode === 'edit';

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

      {!isEditMode && (
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
      )}

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

      {isEditMode && (
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 text-forest-600 focus:ring-forest-500 border-sage-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-forest-700">
            Active user
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
