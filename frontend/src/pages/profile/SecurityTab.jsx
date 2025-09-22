import React, { useState } from 'react';
import { Smartphone, Key, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const ChangePasswordForm = ({ onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const newPassword = watch('newPassword');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Current Password" type={showCurrentPassword ? 'text' : 'password'}
        {...register('currentPassword', { required: 'Current password is required' })}
        error={errors.currentPassword?.message}
        icon={<button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="text-gray-400 hover:text-gray-600">👁</button>}
      />
      <Input label="New Password" type={showNewPassword ? 'text' : 'password'}
        {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
        error={errors.newPassword?.message}
        icon={<button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-gray-400 hover:text-gray-600">👁</button>}
      />
      <Input label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'}
        {...register('confirmPassword', { required: 'Please confirm your new password', validate: (v) => v === newPassword || 'Passwords do not match' })}
        error={errors.confirmPassword?.message}
        icon={<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600">👁</button>}
      />
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Change Password</Button>
      </div>
    </form>
  );
};

const SecurityTab = ({
  user,
  onChangePassword,
  onSetupMFA,
  onEnableMFA,
  onDisableMFA,
  changePasswordLoading,
  setupMFALoading,
  enableMFALoading,
  disableMFALoading,
  mfaSecret,
  qrCodeUrl,
  showQRCode,
  setShowQRCode,
  showMFAModal,
  setShowMFAModal
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Key className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
          Use at least 12 characters with upper, lower, number and special characters. Avoid common words.
        </div>
        <div className="mt-4 flex items-center space-x-3">
          <Link to="/forgot-password" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">Forgot password</Link>
          <Link to="/reset-password" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">Have a token? Reset here</Link>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">{user?.mfaSecret ? 'MFA is enabled for your account' : 'Add an extra layer of security to your account'}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {user?.mfaSecret ? (
              <>
                <Button variant="destructive" onClick={onDisableMFA} loading={disableMFALoading}>Disable MFA</Button>
                <Link to="/mfa" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">Open MFA Screen</Link>
              </>
            ) : (
              <>
                <Button onClick={() => { onSetupMFA(); setShowMFAModal(true); }} loading={setupMFALoading}>Setup MFA</Button>
                <Link to="/mfa" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">I already have MFA</Link>
              </>
            )}
          </div>
        </div>
      </Card>

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

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <ChangePasswordForm onSubmit={onChangePassword} onCancel={() => setShowPasswordModal(false)} loading={changePasswordLoading} />
      </Modal>
    </div>
  );
};

export default SecurityTab;


