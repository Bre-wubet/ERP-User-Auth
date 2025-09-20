import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Authentication Context
 * Manages authentication state and provides auth methods throughout the app
 */

// Initial state
const initialState = {
  user: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  isAuthenticated: false,
  isLoading: true,
  requiresMFA: false,
  mfaUserId: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKENS: 'SET_TOKENS',
  REQUIRE_MFA: 'REQUIRE_MFA',
  CLEAR_MFA: 'CLEAR_MFA',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        requiresMFA: false,
        mfaUserId: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        requiresMFA: false,
        mfaUserId: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
        isAuthenticated: false,
        isLoading: false,
        requiresMFA: false,
        mfaUserId: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
        isAuthenticated: false,
        isLoading: false,
        requiresMFA: false,
        mfaUserId: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case AUTH_ACTIONS.SET_TOKENS:
      return {
        ...state,
        tokens: action.payload,
      };

    case AUTH_ACTIONS.REQUIRE_MFA:
      return {
        ...state,
        requiresMFA: true,
        mfaUserId: action.payload.userId,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_MFA:
      return {
        ...state,
        requiresMFA: false,
        mfaUserId: null,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('user');

        if (accessToken && refreshToken && userData) {
          const user = JSON.parse(userData);
          
          // Verify token is still valid by getting profile
          try {
            const response = await authAPI.getProfile();
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.data.data,
                tokens: { accessToken, refreshToken },
              },
            });
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await authAPI.login(credentials);
      const { user, tokens, requiresMFA, userId } = response.data.data;

      if (requiresMFA) {
        dispatch({
          type: AUTH_ACTIONS.REQUIRE_MFA,
          payload: { userId },
        });
        return { requiresMFA: true, userId };
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, tokens },
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      throw error;
    }
  };

  // Complete MFA login
  const completeMFALogin = async (mfaToken, userId) => {
    try {
      const response = await authAPI.login({
        ...credentials,
        mfaToken,
      });
      const { user, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, tokens },
      });

      dispatch({ type: AUTH_ACTIONS.CLEAR_MFA });
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await authAPI.register(userData);
      const { user, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, tokens },
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await authAPI.logout(sessionId);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Logout all sessions
  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out from all sessions');
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedUser,
      });

      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Setup MFA
  const setupMFA = async () => {
    try {
      const response = await authAPI.setupMFA();
      return response.data.data;
    } catch (error) {
      throw error;
    }
  };

  // Enable MFA
  const enableMFA = async (mfaData) => {
    try {
      await authAPI.enableMFA(mfaData);
      toast.success('MFA enabled successfully');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Disable MFA
  const disableMFA = async (token) => {
    try {
      await authAPI.disableMFA(token);
      toast.success('MFA disabled successfully');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Check if user has role
  const hasRole = (requiredRoles) => {
    if (!state.user?.role) return false;
    const userRole = state.user.role.name;
    return Array.isArray(requiredRoles) 
      ? requiredRoles.includes(userRole)
      : userRole === requiredRoles;
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user?.role) return false;
    
    // Define permission matrix based on roles
    const permissions = {
      admin: ['*'], // Admin has all permissions
      manager: ['read:*', 'create:user', 'update:user', 'read:audit'],
      hr: ['read:user', 'create:user', 'update:user'],
      user: ['read:own', 'update:own']
    };

    const userRole = state.user.role.name;
    const userPermissions = permissions[userRole] || [];
    
    // Check if user has permission
    return userPermissions.includes('*') || 
           userPermissions.includes(`${permission}:*`) ||
           userPermissions.includes(permission);
  };

  // Context value
  const value = {
    // State
    user: state.user,
    tokens: state.tokens,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    requiresMFA: state.requiresMFA,
    mfaUserId: state.mfaUserId,

    // Actions
    login,
    completeMFALogin,
    register,
    logout,
    logoutAll,
    updateProfile,
    changePassword,
    setupMFA,
    enableMFA,
    disableMFA,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
