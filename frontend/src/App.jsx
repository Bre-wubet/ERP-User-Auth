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
              
                      {/* Protected Routes */}
                      <Route
                        path="/dashboard"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <Dashboard />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/users"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <UserManagement />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/roles"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <RoleManagement />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/audit-logs"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <AuditLogs />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/profile"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <ProfileSettings />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/session-management"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <SessionManagement />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/system-health"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <SystemHealth />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/admin-tools"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <AdminTools />
                                </main>
                              </div>
                            </div>
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/mfa-management"
                        element={
                          <PrivateRoute>
                            <div className="flex h-screen">
                              <Sidebar
                                isCollapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                              />
                              <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar onMenuToggle={toggleSidebar} />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                                  <MFAManagement />
                                </main>
                              </div>
                            </div>
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