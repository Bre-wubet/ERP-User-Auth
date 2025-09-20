import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Shield, 
  Key, 
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { authAPI, userAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

/**
 * Profile and Settings Page
 * Comprehensive user profile management and security settings
 */
const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: authAPI.getProfile,
  });

  // Fetch user sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => userAPI.getUserSessions(profileData?.data?.id),
    enabled: !!profileData?.data?.id,
  });

  const user = profileData?.data;
  const sessions = sessionsData?.data || [];

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: () => {
      setShowPasswordModal(false);
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  // Setup MFA mutation
  const setupMFAMutation = useMutation({
    mutationFn: authAPI.setupMFA,
    onSuccess: (response) => {
      const { secret, qrCodeUrl } = response.data;
      setMfaSecret(secret);
      setQrCodeUrl(qrCodeUrl);
      setShowQRCode(true);
      toast.success('MFA setup initiated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to setup MFA');
    },
  });

  // Enable MFA mutation
  const enableMFAMutation = useMutation({
    mutationFn: authAPI.enableMFA,
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      setShowMFAModal(false);
      setShowQRCode(false);
      toast.success('MFA enabled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to enable MFA');
    },
  });

  // Disable MFA mutation
  const disableMFAMutation = useMutation({
    mutationFn: authAPI.disableMFA,
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('MFA disabled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disable MFA');
    },
  });

  const handleUpdateProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleChangePassword = (data) => {
    changePasswordMutation.mutate(data);
  };

  const handleSetupMFA = () => {
    setupMFAMutation.mutate();
  };

  const handleEnableMFA = (data) => {
    enableMFAMutation.mutate(data);
  };

  const handleDisableMFA = () => {
    if (window.confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      disableMFAMutation.mutate({ token: '' });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'sessions', label: 'Sessions', icon: Smartphone },
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600">Manage your profile information and security settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <ProfileTab user={user} onSubmit={handleUpdateProfile} loading={updateProfileMutation.isPending} />
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <SecurityTab 
          user={user}
          onChangePassword={handleChangePassword}
          onSetupMFA={handleSetupMFA}
          onEnableMFA={handleEnableMFA}
          onDisableMFA={handleDisableMFA}
          changePasswordLoading={changePasswordMutation.isPending}
          setupMFALoading={setupMFAMutation.isPending}
          enableMFALoading={enableMFAMutation.isPending}
          disableMFALoading={disableMFAMutation.isPending}
        />
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <SessionsTab sessions={sessions} />
      )}

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <ChangePasswordForm
          onSubmit={handleChangePassword}
          onCancel={() => setShowPasswordModal(false)}
          loading={changePasswordMutation.isPending}
        />
      </Modal>

      {/* MFA Setup Modal */}
      <Modal
        isOpen={showMFAModal}
        onClose={() => {
          setShowMFAModal(false);
          setShowQRCode(false);
        }}
        title="Setup Two-Factor Authentication"
        size="lg"
      >
        <MFASetupForm
          mfaSecret={mfaSecret}
          qrCodeUrl={qrCodeUrl}
          showQRCode={showQRCode}
          onSubmit={handleEnableMFA}
          onCancel={() => {
            setShowMFAModal(false);
            setShowQRCode(false);
          }}
          loading={enableMFAMutation.isPending}
        />
      </Modal>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ user, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    }
  });

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            />
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

// Security Tab Component
const SecurityTab = ({ 
  user, 
  onChangePassword, 
  onSetupMFA, 
  onEnableMFA, 
  onDisableMFA,
  changePasswordLoading,
  setupMFALoading,
  enableMFALoading,
  disableMFALoading
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Key className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* MFA Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">
                {user?.mfaSecret 
                  ? 'MFA is enabled for your account' 
                  : 'Add an extra layer of security to your account'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {user?.mfaSecret ? (
              <Button
                variant="destructive"
                onClick={onDisableMFA}
                loading={disableMFALoading}
              >
                Disable MFA
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onSetupMFA();
                  setShowMFAModal(true);
                }}
                loading={setupMFALoading}
              >
                Setup MFA
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Security Recommendations</h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• Use a strong, unique password</li>
              <li>• Enable two-factor authentication</li>
              <li>• Regularly review your active sessions</li>
              <li>• Log out from shared or public devices</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Sessions Tab Component
const SessionsTab = ({ sessions }) => {
  const [showPassword, setShowPassword] = useState({});

  const togglePasswordVisibility = (sessionId) => {
    setShowPassword(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  return (
    <Card>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
        <p className="text-sm text-gray-500 mb-6">
          Manage your active sessions across different devices and browsers
        </p>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.userAgent || 'Unknown Device'}
                      </p>
                      <p className="text-sm text-gray-500">
                        IP: {session.ip || 'Unknown'} • 
                        Created: {format(new Date(session.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires: {format(new Date(session.expiresAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      new Date(session.expiresAt) > new Date()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {new Date(session.expiresAt) > new Date() ? 'Active' : 'Expired'}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        // Implement revoke session
                        console.log('Revoke session:', session.id);
                      }}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// Change Password Form Component
const ChangePasswordForm = ({ onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPassword = watch('newPassword');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Current Password"
        type={showCurrentPassword ? 'text' : 'password'}
        {...register('currentPassword', { required: 'Current password is required' })}
        error={errors.currentPassword?.message}
        icon={
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
      />

      <Input
        label="New Password"
        type={showNewPassword ? 'text' : 'password'}
        {...register('newPassword', { 
          required: 'New password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' }
        })}
        error={errors.newPassword?.message}
        icon={
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
      />

      <Input
        label="Confirm New Password"
        type={showConfirmPassword ? 'text' : 'password'}
        {...register('confirmPassword', { 
          required: 'Please confirm your new password',
          validate: (value) => value === newPassword || 'Passwords do not match'
        })}
        error={errors.confirmPassword?.message}
        icon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Change Password
        </Button>
      </div>
    </form>
  );
};

// MFA Setup Form Component
const MFASetupForm = ({ mfaSecret, qrCodeUrl, showQRCode, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className="space-y-4">
      {showQRCode ? (
        <div className="text-center">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h4>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          
          {qrCodeUrl && (
            <div className="flex justify-center mb-4">
              <img src={qrCodeUrl} alt="MFA QR Code" className="border border-gray-200 rounded" />
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <p className="text-sm text-gray-600 mb-2">Manual Entry Key:</p>
            <p className="text-sm font-mono text-gray-900">{mfaSecret}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Enter 6-digit code from your app"
              placeholder="123456"
              {...register('token', { 
                required: 'Verification code is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Code must be 6 digits'
                }
              })}
              error={errors.token?.message}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Enable MFA
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center">
          <Smartphone className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Setup Two-Factor Authentication</h4>
          <p className="text-sm text-gray-600 mb-4">
            Two-factor authentication adds an extra layer of security to your account.
          </p>
          <Button onClick={onSubmit} loading={loading}>
            Start Setup
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
