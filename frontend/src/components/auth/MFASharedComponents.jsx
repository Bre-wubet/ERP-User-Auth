import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { 
  Shield, 
  Copy, 
  AlertTriangle, 
  Download,
  CheckCircle,
  XCircle,
  Key,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Shared MFA Components
 * Reusable components for MFA functionality across the application
 */

// MFA Token Input Component
export const MFATokenInput = ({ 
  label = "Authentication Code", 
  placeholder = "000000", 
  useBackupCode = false,
  error,
  register,
  className = "",
  ...props 
}) => {
  return (
    <Input
      label={label}
      type="text"
      placeholder={placeholder}
      error={error}
      maxLength={useBackupCode ? 8 : 6}
      className={`text-center text-2xl tracking-widest ${className}`}
      {...register('token', {
        required: useBackupCode ? 'Backup code is required' : 'Authentication code is required',
        validate: (value) => {
          if (!value) return false;
          const v = value.toString().trim().toUpperCase();
          if (useBackupCode) return /^[A-F0-9]{8}$/.test(v) || 'Backup code must be 8 hex characters';
          return /^\d{6}$/.test(v) || 'Please enter a 6-digit code';
        }
      })}
      {...props}
    />
  );
};

// MFA Setup Form Component
export const MFASetupForm = ({ 
  mfaSecret, 
  qrCodeUrl, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-lg font-medium text-forest-900 mb-4">Scan QR Code</h4>
        <p className="text-sm text-sage-600 mb-4">
          Use your authenticator app to scan this QR code, then enter the 6-digit code below.
        </p>
        
        {qrCodeUrl && (
          <div className="flex justify-center mb-6">
            <img src={qrCodeUrl} alt="MFA QR Code" className="border border-sage-200 rounded" />
          </div>
        )}

        <div className="bg-sage-50 p-4 rounded-md mb-6">
          <p className="text-sm text-sage-600 mb-2">Manual Entry Key:</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-forest-900 bg-white p-2 rounded border flex-1 mr-2">
              {mfaSecret}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(mfaSecret)}
              icon={<Copy className="h-4 w-4" />}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => {
        console.log('MFASetupForm onSubmit called with data:', data);
        console.log('mfaSecret prop:', mfaSecret);
        onSubmit(data);
      })} className="space-y-4">
        <MFATokenInput
          label="Enter 6-digit code from your app"
          placeholder="123456"
          register={register}
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
        
        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Secret: {mfaSecret ? mfaSecret.substring(0, 10) + '...' : 'No secret'}</p>
          <p>QR URL: {qrCodeUrl ? 'Generated' : 'Not generated'}</p>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={() => {
              const testData = { token: '123456' };
              console.log('Testing with dummy token:', testData);
              onSubmit(testData);
            }}
            className="mt-2"
          >
            Test with Dummy Token
          </Button>
        </div>
      </form>
    </div>
  );
};

// Backup Codes Display Component
export const BackupCodesDisplay = ({ 
  codes = [], 
  onDownload, 
  onClose,
  userEmail = "user" 
}) => {
  const downloadBackupCodes = () => {
    const content = `MFA Backup Codes for ${userEmail}\n\nGenerated: ${format(new Date(), 'PPpp')}\n\n${codes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nImportant: Store these codes in a safe place. Each code can only be used once.`;
    
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
    if (onDownload) onDownload();
  };

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
          <div key={index} className="font-mono text-sm p-3 bg-sage-50 border border-sage-200 rounded text-forest-900 text-center">
            {code}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={downloadBackupCodes}
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
export const DisableMFAForm = ({ 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
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
        <MFATokenInput
          label="Enter 6-digit code from your authenticator app"
          placeholder="123456"
          register={register}
          error={errors.token?.message}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Disable MFA
          </Button>
        </div>
      </form>
    </div>
  );
};

// MFA Status Card Component
export const MFAStatusCard = ({ 
  isEnabled, 
  onSetup, 
  onDisable, 
  onViewBackupCodes,
  setupLoading = false,
  disableLoading = false 
}) => {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${
              isEnabled ? 'bg-moss-100' : 'bg-red-100'
            }`}>
              {isEnabled ? (
                <CheckCircle className="h-6 w-6 text-moss-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-forest-900">
                {isEnabled ? 'MFA Enabled' : 'MFA Disabled'}
              </h3>
              <p className="text-sm text-sage-600">
                {isEnabled 
                  ? 'Your account is protected with multi-factor authentication'
                  : 'Your account is not protected with multi-factor authentication'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEnabled ? (
              <Button
                variant="danger"
                onClick={onDisable}
                icon={<XCircle className="h-4 w-4" />}
                loading={disableLoading}
              >
                Disable MFA
              </Button>
            ) : (
              <Button
                onClick={onSetup}
                icon={<Shield className="h-4 w-4" />}
                loading={setupLoading}
              >
                Enable MFA
              </Button>
            )}
          </div>
        </div>
        
        {isEnabled && (
          <div className="bg-moss-50 border border-moss-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-moss-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-moss-800 mb-2">Security Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-moss-700">Authenticator App:</span>
                    <span className="ml-2 text-moss-600">✓ Active</span>
                  </div>
                  <div>
                    <span className="font-medium text-moss-700">Backup Codes:</span>
                    <span className="ml-2 text-moss-600">✓ Available</span>
                  </div>
                  <div>
                    <span className="font-medium text-moss-700">Last Updated:</span>
                    <span className="ml-2 text-moss-600">Today</span>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewBackupCodes}
                    icon={<Key className="h-4 w-4" />}
                  >
                    View Backup Codes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/mfa-management', '_blank')}
                    icon={<Settings className="h-4 w-4" />}
                  >
                    Manage Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// MFA Information Card Component
export const MFAInfoCard = ({ 
  title, 
  icon: Icon, 
  children 
}) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center">
          <Icon className="h-5 w-5 mr-2" />
          {title}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {children}
      </Card.Content>
    </Card>
  );
};

// MFA Help Text Component
export const MFAHelpText = ({ 
  useBackupCode = false 
}) => {
  if (useBackupCode) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-amber-800 mb-2">Using a backup code</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Backup codes can be used if you lose access to your authenticator.</li>
          <li>• Each backup code can be used once.</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-forest-50 border border-forest-200 rounded-md p-4">
      <h3 className="text-sm font-medium text-forest-800 mb-2">How to get your code</h3>
      <ul className="text-sm text-forest-700 space-y-1">
        <li>• Open your authenticator app (Google Authenticator, Authy, etc.)</li>
        <li>• Find the code for "ERP Security System"</li>
        <li>• Enter the 6-digit code above</li>
      </ul>
    </div>
  );
};
