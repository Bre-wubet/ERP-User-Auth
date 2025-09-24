import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import { Eye, EyeOff, Mail, Lock, User, UserCheck, Shield } from 'lucide-react';
import { roleAPI } from '../../services/api';

/**
 * Register Form Component
 * Handles user registration with validation
 */

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm();

  const password = watch('password');

  // Fetch available roles
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['public-roles'],
    queryFn: async () => {
      try {
        const res = await roleAPI.getPublicRoles({ limit: 100 });
        const response = res.data;
        // console.log('API Response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const roles = Array.isArray(rolesData?.data?.data) ? rolesData.data.data : Array.isArray(rolesData?.data) ? rolesData.data : [];
  
  // Debug: Log the data structure
  // console.log('Roles data:', rolesData);
  // console.log('Roles array:', roles);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      navigate('/dashboard');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our ERP system with the appropriate role for your responsibilities
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                  error={errors.firstName?.message}
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
              </div>
              <div>
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  error={errors.lastName?.message}
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  icon={<UserCheck className="h-5 w-5 text-gray-400" />}
                />
              </div>
            </div>

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
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Select
                label="Role"
                placeholder="Select your role"
                error={errors.roleId?.message}
                helperText={rolesLoading ? "Loading available roles..." : rolesError ? "Error loading roles" : "Choose the role that best fits your responsibilities"}
                {...register('roleId', {
                  required: 'Please select a role',
                })}
                icon={<Shield className="h-5 w-5 text-gray-400" />}
                disabled={rolesLoading || rolesError}
              >
                {rolesLoading ? (
                  <option value="" disabled>Loading roles...</option>
                ) : rolesError ? (
                  <option value="" disabled>Error loading roles</option>
                ) : roles.length === 0 ? (
                  <option value="" disabled>No roles available - Contact administrator</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      {role.scope && ` (${role.scope})`}
                    </option>
                  ))
                )}
              </Select>
              
              {/* Role descriptions */}
              {!rolesLoading && !rolesError && roles.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Role Descriptions:</h4>
                  <div className="space-y-1 text-xs text-blue-800">
                    {roles.slice(0, 3).map((role) => (
                      <div key={role.id} className="flex justify-between">
                        <span className="font-medium capitalize">{role.name}:</span>
                        <span className="text-blue-700">
                          {role.scope ? `${role.scope} access` : 'General access'}
                        </span>
                      </div>
                    ))}
                    {roles.length > 3 && (
                      <div className="text-blue-700 italic">
                        +{roles.length - 3} more roles available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                error={errors.password?.message}
                helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character',
                  },
                })}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
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

            <div>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('terms', {
                  required: 'You must accept the terms and conditions',
                })}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading || rolesLoading}
                disabled={isLoading || rolesLoading || rolesError || roles.length === 0}
              >
                {isLoading ? 'Creating account...' : rolesLoading ? 'Loading roles...' : roles.length === 0 ? 'No roles available' : 'Create account'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
