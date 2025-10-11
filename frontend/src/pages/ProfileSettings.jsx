import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Key, 
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProfileTab from './profile/ProfileTab';
import SecurityTab from './profile/SecurityTab';
import SessionsTab from './profile/SessionsTab';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

/**
 * Profile and Settings Page
 * Comprehensive user profile management and security settings
 */
const ProfileSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const queryClient = useQueryClient();

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'security', 'sessions'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: authAPI.getProfile,
  });

  // Resolve user object safely from possible nested structures
  const user = profileData?.data?.data || profileData?.data;

  // Fetch user sessions (use resolved user id)
  const { data: sessionsData } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => userAPI.getUserSessions(user?.id),
    enabled: !!user?.id,
  });

  // Safely extract sessions array
  const sessions = Array.isArray(sessionsData?.data?.data)
    ? sessionsData.data.data
    : Array.isArray(sessionsData?.data)
    ? sessionsData.data
    : [];

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


  // Resend email verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: authAPI.resendEmailVerification,
    onSuccess: () => {
      toast.success('Verification email sent successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    },
  });

  // Revoke single session
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId) => userAPI.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-sessions']);
      toast.success('Session revoked');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    },
  });

  // Logout all sessions for current user
  const logoutAllSessionsMutation = useMutation({
    mutationFn: () => authAPI.logoutAll(),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-sessions']);
      toast.success('Logged out from all sessions');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to logout all sessions');
    },
  });

  const handleUpdateProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleChangePassword = (data) => {
    changePasswordMutation.mutate(data);
  };


  const handleResendVerification = () => {
    resendVerificationMutation.mutate();
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
                onClick={() => handleTabChange(tab.id)}
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
        <ProfileTab 
          user={user} 
          onSubmit={handleUpdateProfile} 
          onResendVerification={handleResendVerification}
          loading={updateProfileMutation.isPending}
          resendLoading={resendVerificationMutation.isPending}
        />
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <SecurityTab 
          user={user}
          onChangePassword={handleChangePassword}
          changePasswordLoading={changePasswordMutation.isPending}
        />
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <SessionsTab userId={user?.id} />
      )}

      

    </div>
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


export default ProfileSettings;
