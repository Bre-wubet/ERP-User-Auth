import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { CheckCircle, XCircle, Save, Shield, AlertTriangle, Clock, Smartphone } from 'lucide-react';

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

        {/* Security Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Status</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full mr-3 ${
                  user?.emailVerified ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {user?.emailVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Email Verification</div>
                  <div className={`text-xs ${
                    user?.emailVerified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {user?.emailVerified ? 'Verified' : 'Unverified'}
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full mr-3 ${
                  user?.mfaEnabled ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {user?.mfaEnabled ? (
                    <Shield className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Multi-Factor Auth</div>
                  <div className={`text-xs ${
                    user?.mfaEnabled ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {user?.mfaEnabled ? 'Enabled' : 'Not Enabled'}
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="p-2 rounded-full mr-3 bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Password Age</div>
                  <div className="text-xs text-blue-600">
                    {user?.passwordChangedAt 
                      ? `${Math.floor((new Date() - new Date(user.passwordChangedAt)) / (1000 * 60 * 60 * 24))} days`
                      : 'Unknown'
                    }
                  </div>
                </div>
              </div>
            </div>

            {!user?.emailVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Email Verification Required</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please verify your email address to ensure account security and receive important notifications.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!user?.mfaEnabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <Shield className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Enable Multi-Factor Authentication</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Add an extra layer of security to your account by enabling MFA. This helps protect your account from unauthorized access.
                    </p>
                  </div>
                </div>
              </div>
            )}
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


