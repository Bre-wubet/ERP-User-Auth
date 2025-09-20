import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * MFA Form Component
 * Handles Multi-Factor Authentication verification
 */

const MFAForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const { completeMFALogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const userId = location.state?.userId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm();

  // Timer for token expiration
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Reset timer when component mounts
  useEffect(() => {
    setTimeRemaining(30);
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await completeMFALogin(data.mfaToken, userId);
      navigate('/dashboard');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Invalid MFA token. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    try {
      setIsResending(true);
      // Here you would call an API to resend the MFA token
      // For now, we'll just reset the timer
      setTimeRemaining(30);
      // You could show a success message here
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to resend token. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
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
                label="Authentication Code"
                type="text"
                placeholder="000000"
                maxLength="6"
                error={errors.mfaToken?.message}
                helperText="Enter the 6-digit code from your authenticator app"
                {...register('mfaToken', {
                  required: 'Authentication code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Please enter a valid 6-digit code',
                  },
                })}
                onChange={(e) => {
                  // Auto-format the input to only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('mfaToken', value);
                }}
              />
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600">
                Code expires in{' '}
                <span className={`font-medium ${timeRemaining < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {timeRemaining}s
                </span>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading || timeRemaining === 0}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResendToken}
                loading={isResending}
                disabled={isResending || isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Code
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Don't have access to your authenticator app?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              You can use one of your backup codes or contact your administrator for help.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/backup-codes')}
            >
              Use Backup Code
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <button
              onClick={() => navigate('/support')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MFAForm;
