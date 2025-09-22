import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { CheckCircle, XCircle, Save } from 'lucide-react';

const ProfileTab = ({ user, onSubmit, onResendVerification, loading, resendLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    }
  });

  const onLocalSubmit = (data) => {
    onSubmit({ firstName: data.firstName.trim(), lastName: data.lastName.trim() });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onLocalSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
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

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <Input
                label="Email Address"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
                className="flex-1"
              />
              <div className="ml-4 flex items-center">
                {user?.emailVerified ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 mr-1 text-red-500" />
                    <span className="text-sm text-red-500 mr-2">Unverified</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onResendVerification}
                      loading={resendLoading}
                    >
                      Verify
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900">{user?.role?.name || 'No Role'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                user?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Login</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm') : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={loading} icon={<Save className="h-5 w-5" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileTab;


