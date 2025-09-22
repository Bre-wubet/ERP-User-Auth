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
  AlertTriangle,
  Mail,
  CheckCircle,
  XCircle
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
  const [backupCodes, setBackupCodes] = useState([]);
  const enableMFAMutation = useMutation({
    mutationFn: authAPI.enableMFA,
    onSuccess: (res) => {
      queryClient.invalidateQueries(['user-profile']);
      setShowMFAModal(false);
      setShowQRCode(false);
      const codes = res?.data?.data?.backupCodes || [];
      if (codes.length) {
        setBackupCodes(codes);
        toast.success('MFA enabled. Save your backup codes.');
      } else {
        toast.success('MFA enabled successfully');
      }
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

  const handleSetupMFA = () => {
    setupMFAMutation.mutate();
  };

  const handleEnableMFA = (data) => {
    // Ensure we send both token and the secret returned from setup
    enableMFAMutation.mutate({ token: data.token, secret: mfaSecret });
  };

  const handleDisableMFA = () => {
    if (window.confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      disableMFAMutation.mutate({ token: '' });
    }
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
          onSetupMFA={handleSetupMFA}
          onEnableMFA={handleEnableMFA}
          onDisableMFA={handleDisableMFA}
          changePasswordLoading={changePasswordMutation.isPending}
          setupMFALoading={setupMFAMutation.isPending}
          enableMFALoading={enableMFAMutation.isPending}
          disableMFALoading={disableMFAMutation.isPending}
          mfaSecret={mfaSecret}
          qrCodeUrl={qrCodeUrl}
          showQRCode={showQRCode}
          setShowQRCode={setShowQRCode}
          showMFAModal={showMFAModal}
          setShowMFAModal={setShowMFAModal}
        />
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <SessionsTab userId={user?.id} />
      )}

      

      {/* Backup Codes Modal */}
      <Modal
        isOpen={backupCodes.length > 0}
        onClose={() => setBackupCodes([])}
        title="Your MFA Backup Codes"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Store these codes in a safe place. Each code can be used once if you lose access to your authenticator app.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code) => (
              <div key={code} className="font-mono text-sm p-2 bg-gray-50 border rounded text-gray-900">
                {code}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setBackupCodes([])}>I have saved these</Button>
          </div>
        </div>
      </Modal>
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
