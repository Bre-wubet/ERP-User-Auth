import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';

/**
 * Email Verification Component
 * Handles email verification from the activation link
 */
const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: authAPI.verifyEmail,
    onSuccess: () => {
      setVerificationStatus('success');
    },
    onError: (error) => {
      setVerificationStatus('error');
      setErrorMessage(error.response?.data?.message || 'Verification failed');
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    } else {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided');
    }
  }, [token]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {verificationStatus === 'verifying' && (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  Verifying Email
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  Email Verified Successfully!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your email address has been verified. You can now access all features of your account.
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleGoToDashboard}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={handleGoToLogin}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  Verification Failed
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {errorMessage || 'There was an error verifying your email address.'}
                </p>
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleGoToLogin}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <p className="text-xs text-gray-500">
                    If you continue to have issues, please contact support.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
