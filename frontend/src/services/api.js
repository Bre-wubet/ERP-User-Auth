import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * API service for ERP Authentication System
 * Handles all HTTP requests to the backend
 */

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No access token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('401 Unauthorized error for:', originalRequest.url, 'Retrying with refresh token...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Refresh token
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  
  // Logout
  logout: (sessionId) => api.post('/auth/logout', { sessionId }),
  
  // Logout all sessions
  logoutAll: () => api.post('/auth/logout-all'),
  
  // Change password
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  
  // Initiate password reset
  initiatePasswordReset: (email) => api.post('/auth/password-reset/initiate', { email }),
  
  // Complete password reset
  completePasswordReset: (resetData) => api.post('/auth/password-reset/complete', resetData),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Setup MFA
  setupMFA: () => api.post('/auth/mfa/setup'),
  
  // Enable MFA
  enableMFA: (mfaData) => api.post('/auth/mfa/enable', mfaData),
  
  // Disable MFA
  disableMFA: (token) => api.post('/auth/mfa/disable', { token }),
  
  // Verify email
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  
  // Resend email verification
  resendEmailVerification: () => api.post('/auth/resend-verification'),
  
  // Cleanup expired tokens (admin)
  cleanupExpiredTokens: () => api.post('/auth/cleanup-tokens'),
};

// User management API endpoints
export const userAPI = {
  // Get all users with pagination and filters
  getUsers: (params = {}) => api.get('/users', { params }),
  
  // Search users
  searchUsers: (query, params = {}) => api.get('/users/search', { 
    params: { q: query, ...params } 
  }),
  
  // Get user by ID
  getUserById: (userId) => api.get(`/users/${userId}`),
  
  // Create new user
  createUser: (userData) => api.post('/users', userData),
  
  // Update user
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  
  // Delete user
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  
  // Activate user
  activateUser: (userId) => api.patch(`/users/${userId}/activate`),
  
  // Deactivate user
  deactivateUser: (userId) => api.patch(`/users/${userId}/deactivate`),
  
  // Get user sessions
  getUserSessions: (userId) => api.get(`/users/${userId}/sessions`),
  
  // Revoke session
  revokeSession: (sessionId) => api.delete(`/users/sessions/${sessionId}`),
  
  // Revoke all user sessions
  revokeAllSessions: (userId) => api.delete(`/users/${userId}/sessions`),
  
  // Get user statistics
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
};

// Role management API endpoints
export const roleAPI = {
  // Get all roles with pagination and filters
  getRoles: (params = {}) => api.get('/roles', { params }),
  
  // Get public roles (for registration)
  getPublicRoles: (params = {}) => api.get('/roles/public', { params }),
  
  // Search roles
  searchRoles: (query, params = {}) => api.get('/roles/search', { 
    params: { q: query, ...params } 
  }),
  
  // Get available scopes
  getAvailableScopes: () => api.get('/roles/scopes'),
  
  // Get role statistics
  getRoleStats: () => api.get('/roles/stats'),
  
  // Get role by ID
  getRoleById: (roleId) => api.get(`/roles/${roleId}`),
  
  // Create new role
  createRole: (roleData) => api.post('/roles', roleData),
  
  // Update role
  updateRole: (roleId, roleData) => api.put(`/roles/${roleId}`, roleData),
  
  // Delete role
  deleteRole: (roleId) => api.delete(`/roles/${roleId}`),
  
  // Assign role to user
  assignRoleToUser: (userId, roleId) => api.post('/roles/assign', { userId, roleId }),
  
  // Remove role from user
  removeRoleFromUser: (userId, defaultRoleId) => api.post('/roles/remove', { userId, defaultRoleId }),
  
  // Check if user has specific role
  checkUserRole: (userId, roleName) => api.get(`/roles/check/${userId}/${roleName}`),
  
  // Check if user has role in specific scope
  checkUserRoleScope: (userId, scope) => api.get(`/roles/check-scope/${userId}/${scope}`),
};

// Audit API endpoints
export const auditAPI = {
  // Get audit logs with pagination and filters
  getAuditLogs: (params = {}) => api.get('/audit', { params }),
  
  // Search audit logs
  searchAuditLogs: (query, params = {}) => api.get('/audit/search', { 
    params: { q: query, ...params } 
  }),
  
  // Get audit log by ID
  getAuditLogById: (auditLogId) => api.get(`/audit/${auditLogId}`),
  
  // Get user audit logs
  getUserAuditLogs: (userId, params = {}) => api.get(`/audit/user/${userId}`, { params }),
  
  // Get module audit logs
  getModuleAuditLogs: (module, params = {}) => api.get(`/audit/module/${module}`, { params }),
  
  // Get audit statistics
  getAuditStats: (params = {}) => api.get('/audit/stats', { params }),
  
  // Get available modules
  getAvailableModules: () => api.get('/audit/modules'),
  
  // Get available actions
  getAvailableActions: () => api.get('/audit/actions'),
  
  // Export audit logs
  exportAuditLogs: (params = {}) => api.get('/audit/export', { 
    params,
    responseType: 'blob' // For file downloads
  }),
  
  // Clean up old audit logs
  cleanupOldLogs: (daysToKeep) => api.post('/audit/cleanup', { daysToKeep }),
};

// Health check API
export const healthAPI = {
  // Get server health status
  getHealth: () => api.get('/health'),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  // Format API response
  formatResponse: (response) => {
    return response.data;
  },
  
  // Check if user has permission
  hasPermission: (userRole, requiredRoles) => {
    if (!userRole || !requiredRoles) return false;
    return requiredRoles.includes(userRole);
  },
  
  // Format date for API
  formatDate: (date) => {
    return new Date(date).toISOString();
  },
  
  // Parse API date
  parseDate: (dateString) => {
    return new Date(dateString);
  },
};

export default api;
