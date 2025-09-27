import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';

/**
 * Login Form Component
 * Handles user authentication with email/password and MFA support
 */

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const emailValue = undefined; // placeholder to preserve structure
  const passwordValue = undefined; // placeholder to preserve structure

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const result = await login(data);
      
      if (result.requiresMFA) {
        // Redirect to MFA page
        navigate('/mfa', { state: { credentials: { email: data.email, password: data.password } } });
      } else {
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-forest-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-sage-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-forest-600 hover:text-forest-500"
            >
              create a new account
            </Link>
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
                label="Email address"
                type="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                icon={<Mail className="h-5 w-5 text-sage-400" />}
              />
            </div>

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sage-400 hover:text-sage-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-forest-600 focus:ring-forest-500 border-sage-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-forest-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-forest-600 hover:text-forest-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sage-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-sage-500">Or</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/mfa"
                className="w-full flex justify-center items-center px-4 py-2 border border-forest-300 rounded-md shadow-sm bg-white text-sm font-medium text-forest-700 hover:bg-forest-50 hover:text-forest-800 transition-colors duration-200"
              >
                <Shield className="h-4 w-4 mr-2" />
                Access with Multi-Factor Authentication
              </Link>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-sage-600">
            Need help?{' '}
            <Link
              to="/support"
              className="font-medium text-forest-600 hover:text-forest-500"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
