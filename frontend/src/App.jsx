import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Pages
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MFAForm from './components/auth/MFAForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import EmailVerification from './components/auth/EmailVerification';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import AuditLogs from './pages/AuditLogs';
import ProfileSettings from './pages/ProfileSettings';
import SessionManagement from './pages/SessionManagement';
import SystemHealth from './pages/SystemHealth';
import AdminTools from './pages/AdminTools';
import MFAManagement from './pages/MFAManagement'; // MFAManagement

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Shared Layout for all protected pages
function ProtectedLayout({ children, sidebarCollapsed, toggleSidebar }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onMenuToggle={toggleSidebar} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Main App Component
 * Handles routing, authentication, and layout
 */
function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/mfa" element={<MFAForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route path="/activate-account" element={<EmailVerification />} />
              
              {/* Protected Routes using shared layout */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <Dashboard />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <UserManagement />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/roles"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <RoleManagement />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/audit-logs"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <AuditLogs />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <ProfileSettings />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/sessions"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <SessionManagement />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/session-management"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <SessionManagement />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/system-health"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <SystemHealth />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin-tools"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <AdminTools />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/mfa-management"
                element={
                  <PrivateRoute>
                    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}>
                      <MFAManagement />
                    </ProtectedLayout>
                  </PrivateRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;