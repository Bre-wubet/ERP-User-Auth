import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Shield, ArrowLeft } from 'lucide-react';

/**
 * MFA Form Component
 * Handles multi-factor authentication verification
 */
const MFAForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const credentials = location.state?.credentials;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  useEffect(() => {
    if (!credentials?.email || !credentials?.password) {
      navigate('/login');
    }
  }, [credentials, navigate]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const token = (data.mfaToken || '').toString().trim().toUpperCase();
      await authAPI.login({ ...credentials, mfaToken: token });
      window.location.href = '/dashboard';
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Invalid code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-600">
            <Shield className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Two-Factor Authentication</h2>
          <p className="mt-2 text-sm text-gray-600">
            {useBackupCode
              ? 'Enter one of your 8-character backup codes.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        <Card className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <div>
              <Input
                label={useBackupCode ? 'Backup Code' : 'Authentication Code'}
                type="text"
                placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                error={errors.mfaToken?.message}
                {...register('mfaToken', {
                  required: useBackupCode ? 'Backup code is required' : 'Authentication code is required',
                  validate: (value) => {
                    if (!value) return false;
                    const v = value.toString().trim().toUpperCase();
                    if (useBackupCode) return /^[A-F0-9]{8}$/.test(v) || 'Backup code must be 8 hex characters';
                    return /^\d{6}$/.test(v) || 'Please enter a 6-digit code';
                  }
                })}
                maxLength={useBackupCode ? 8 : 6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {useBackupCode ? (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-amber-800 mb-2">Using a backup code</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Backup codes can be used if you lose access to your authenticator.</li>
                  <li>• Each backup code can be used once.</li>
                </ul>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">How to get your code</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>• Find the code for "ERP Security System"</li>
                  <li>• Enter the 6-digit code above</li>
                </ul>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setUseBackupCode(!useBackupCode)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code'}
              </button>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <a
              href="/support"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MFAForm;