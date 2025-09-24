import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff, 
  Download, 
  Copy, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  QrCode,
  Trash2
} from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * MFA Management Page
 * Comprehensive Multi-Factor Authentication management
 */
const MFAManagement = () => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user profile to get MFA status
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: authAPI.getProfile,
  });

  const userProfile = profileData?.data?.data || profileData?.data;
  const isMFAEnabled = userProfile?.mfaEnabled || false;

  // Setup MFA mutation
  const setupMFAMutation = useMutation({
    mutationFn: authAPI.setupMFA,
    onSuccess: (response) => {
      console.log('MFA Setup Response:', response);
      const mfaData = response.data?.data || response.data;
      console.log('MFA Data:', mfaData);
      const { secret, qrCodeUrl } = mfaData;
      setMfaSecret(secret);
      setQrCodeUrl(qrCodeUrl);
      setShowQRModal(true);
      toast.success('MFA setup initiated. Please scan the QR code.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to setup MFA');
    },
  });

  // Enable MFA mutation
  const enableMFAMutation = useMutation({
    mutationFn: authAPI.enableMFA,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['user-profile']);
      setShowQRModal(false);
      const codes = response?.data?.data?.backupCodes || [];
      if (codes.length > 0) {
        setBackupCodes(codes);
        setShowBackupCodesModal(true);
      }
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
      setShowDisableModal(false);
      toast.success('MFA disabled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disable MFA');
    },
  });

  const handleSetupMFA = () => {
    setupMFAMutation.mutate();
  };

  const handleEnableMFA = (data) => {
    enableMFAMutation.mutate({ token: data.token, secret: mfaSecret });
  };

  const handleDisableMFA = (data) => {
    disableMFAMutation.mutate({ token: data.token });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const content = `MFA Backup Codes for ${user?.email}\n\nGenerated: ${format(new Date(), 'PPpp')}\n\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nImportant: Store these codes in a safe place. Each code can only be used once.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mfa-backup-codes-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Backup codes downloaded');
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="text-gray-600">Manage your account security with MFA</p>
        </div>
        {!isMFAEnabled && (
          <Button
            onClick={handleSetupMFA}
            icon={<Shield className="h-5 w-5" />}
            loading={setupMFAMutation.isPending}
          >
            Setup MFA
          </Button>
        )}
      </div>

      {/* MFA Status Card */}
      <Card>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${
              isMFAEnabled ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isMFAEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {isMFAEnabled ? 'MFA Enabled' : 'MFA Disabled'}
              </h3>
              <p className="text-sm text-gray-600">
                {isMFAEnabled 
                  ? 'Your account is protected with multi-factor authentication'
                  : 'Your account is not protected with multi-factor authentication'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isMFAEnabled ? (
              <Button
                variant="destructive"
                onClick={() => setShowDisableModal(true)}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Disable MFA
              </Button>
            ) : (
              <Button
                onClick={handleSetupMFA}
                icon={<Shield className="h-4 w-4" />}
                loading={setupMFAMutation.isPending}
              >
                Enable MFA
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* MFA Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Authenticator Apps
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Supported Apps</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Google Authenticator</li>
                  <li>• Microsoft Authenticator</li>
                  <li>• Authy</li>
                  <li>• 1Password</li>
                  <li>• LastPass Authenticator</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How it works</h4>
                <p className="text-sm text-gray-600">
                  When you sign in, you'll be asked for a 6-digit code from your authenticator app. 
                  This adds an extra layer of security to your account.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Backup Codes
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What are backup codes?</h4>
                <p className="text-sm text-gray-600">
                  Backup codes are one-time use codes that can be used to access your account 
                  if you lose access to your authenticator app.
                </p>
              </div>
              {isMFAEnabled && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowBackupCodesModal(true)}
                    icon={<Key className="h-4 w-4" />}
                  >
                    View Backup Codes
                  </Button>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Security Tips */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Security Tips
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Keep your authenticator app updated</li>
                <li>• Store backup codes in a secure location</li>
                <li>• Don't share your backup codes with anyone</li>
                <li>• Use a different device for backup codes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">What to do if you lose access</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use your backup codes to sign in</li>
                <li>• Contact support if you've lost backup codes</li>
                <li>• Re-enable MFA after regaining access</li>
                <li>• Generate new backup codes</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Setup MFA - Scan QR Code"
        size="lg"
      >
        <MFASetupForm
          mfaSecret={mfaSecret}
          qrCodeUrl={qrCodeUrl}
          onSubmit={handleEnableMFA}
          onCancel={() => setShowQRModal(false)}
          loading={enableMFAMutation.isPending}
        />
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
        title="Your MFA Backup Codes"
        size="lg"
      >
        <BackupCodesDisplay
          codes={backupCodes}
          onDownload={downloadBackupCodes}
          onClose={() => setShowBackupCodesModal(false)}
        />
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title="Disable Multi-Factor Authentication"
      >
        <DisableMFAForm
          onSubmit={handleDisableMFA}
          onCancel={() => setShowDisableModal(false)}
          loading={disableMFAMutation.isPending}
        />
      </Modal>
    </div>
  );
};

// MFA Setup Form Component
const MFASetupForm = ({ mfaSecret, qrCodeUrl, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h4>
        <p className="text-sm text-gray-600 mb-4">
          Use your authenticator app to scan this QR code, then enter the 6-digit code below.
        </p>
        
        {qrCodeUrl && (
          <div className="flex justify-center mb-6">
            <img src={qrCodeUrl} alt="MFA QR Code" className="border border-gray-200 rounded" />
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-gray-600 mb-2">Manual Entry Key:</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-gray-900 bg-white p-2 rounded border flex-1 mr-2">
              {mfaSecret}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(mfaSecret)}
              icon={<Copy className="h-4 w-4" />}
            >
              Copy
            </Button>
          </div>
        </div>
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
  );
};

// Backup Codes Display Component
const BackupCodesDisplay = ({ codes, onDownload, onClose }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Important Security Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Store these codes in a safe place. Each code can only be used once. 
              If you lose these codes, you may not be able to access your account.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {codes.map((code, index) => (
          <div key={index} className="font-mono text-sm p-3 bg-gray-50 border rounded text-gray-900 text-center">
            {code}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onDownload}
          icon={<Download className="h-4 w-4" />}
        >
          Download Codes
        </Button>
        <Button onClick={onClose}>
          I have saved these codes
        </Button>
      </div>
    </div>
  );
};

// Disable MFA Form Component
const DisableMFAForm = ({ onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Security Warning</h4>
            <p className="text-sm text-red-700 mt-1">
              Disabling MFA will reduce your account security. You will no longer be required 
              to provide a second factor when signing in.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Enter 6-digit code from your authenticator app"
          placeholder="123456"
          {...register('token', { 
            required: 'Verification code is required to disable MFA',
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
          <Button type="submit" variant="destructive" loading={loading}>
            Disable MFA
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MFAManagement;
