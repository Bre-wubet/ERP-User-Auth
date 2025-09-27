import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Shield, ArrowLeft } from 'lucide-react';
import { MFATokenInput, MFAHelpText } from './MFASharedComponents';

/**
 * MFA Form Component
 * Handles multi-factor authentication verification
 */
const MFAForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  
  const credentials = location.state?.credentials;
  
  // Debug authentication state
  console.log('MFAForm - isAuthenticated:', isAuthenticated);
  console.log('MFAForm - user:', user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  useEffect(() => {
    // Only redirect if we're expecting credentials but don't have them
    // Allow direct MFA access from login page
    if (location.state?.expectCredentials && (!credentials?.email || !credentials?.password)) {
      navigate('/login');
    }
  }, [credentials, navigate, location.state]);

  // Check if this is direct MFA access (no credentials)
  const isDirectAccess = !credentials?.email || !credentials?.password;

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      console.log('MFAForm onSubmit called with data:', data);
      console.log('credentials:', credentials);
      
      const token = (data.token || '').toString().trim().toUpperCase();
      console.log('extracted token:', token);
      
      if (credentials?.email && credentials?.password) {
        // Login with MFA token using AuthContext
        console.log('Attempting login with MFA token...');
        const loginData = { ...credentials, mfaToken: token };
        console.log('Login data:', { ...loginData, password: '[REDACTED]' });
        
        const result = await login(loginData);
        console.log('Login result:', result);
        
        if (result.success) {
          console.log('Login successful, redirecting to dashboard');
          // Small delay to ensure auth state is updated
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
        } else {
          console.log('Login failed or requires additional MFA');
          setError('root', {
            type: 'manual',
            message: 'Login failed. Please try again.',
          });
        }
      } else {
        // Direct MFA verification - redirect to login with a message
        console.log('No credentials available, showing error message');
        setError('root', {
          type: 'manual',
          message: 'Please log in first, then you will be prompted for your MFA code.',
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      console.error('Error response:', error.response);
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
    <div className="min-h-screen flex items-center justify-center bg-forest-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-forest-600">
            <Shield className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-forest-900">Two-Factor Authentication</h2>
          <p className="mt-2 text-sm text-sage-600">
            {isDirectAccess 
              ? 'Please log in first to access your account with MFA.'
              : useBackupCode
                ? 'Enter one of your 8-character backup codes.'
                : 'Enter the 6-digit code from your authenticator app.'
            }
          </p>
        </div>

        <Card className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {!isDirectAccess && (
              <>
                <div>
                  <MFATokenInput
                    label={useBackupCode ? 'Backup Code' : 'Authentication Code'}
                    placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                    useBackupCode={useBackupCode}
                    register={register}
                    error={errors.token?.message}
                  />
                </div>

                <MFAHelpText useBackupCode={useBackupCode} />
              </>
            )}

            {isDirectAccess && (
              <div className="bg-forest-50 border border-forest-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-forest-800 mb-2">How to use MFA</h3>
                <ul className="text-sm text-forest-700 space-y-1">
                  <li>• First, log in with your email and password</li>
                  <li>• If MFA is enabled, you'll be prompted for your authentication code</li>
                  <li>• Enter the 6-digit code from your authenticator app</li>
                  <li>• Or use a backup code if you can't access your authenticator</li>
                </ul>
              </div>
            )}

            {!isDirectAccess && (
              <>
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
                    className="font-medium text-forest-600 hover:text-forest-500"
                  >
                    {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code'}
                  </button>
                </div>
              </>
            )}

            {isDirectAccess && (
              <div>
                <Button
                  onClick={handleBackToLogin}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Go to Login
                </Button>
              </div>
            )}
          </form>
        </Card>

        <div className="text-center">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center text-sm font-medium text-sage-600 hover:text-sage-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-sage-600">
            Having trouble?{' '}
            <a
              href="/support"
              className="font-medium text-forest-600 hover:text-forest-500"
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