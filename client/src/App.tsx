import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPM from './pages/DashboardPM';
import DashboardDesigner from './pages/DashboardDesigner';
import DashboardDeveloper from './pages/DashboardDeveloper';
import ClientList from './pages/ClientList';
import ClientDetails from './pages/ClientDetails';
import TeamPage from './pages/TeamPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route that checks authentication and role
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'PM') return <Navigate to="/dashboard" replace />;
    if (user.role === 'DESIGNER') return <Navigate to="/designer" replace />;
    if (user.role === 'DEVELOPER') return <Navigate to="/developer" replace />;
    if (user.role === 'BOTH') return <Navigate to="/designer" replace />;
  }

  return <>{children}</>;
};

// Redirect to appropriate dashboard based on role
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'PM') return <Navigate to="/dashboard" replace />;
  if (user.role === 'DESIGNER') return <Navigate to="/designer" replace />;
  if (user.role === 'DEVELOPER') return <Navigate to="/developer" replace />;
  if (user.role === 'BOTH') return <Navigate to="/designer" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardRedirect />} />

            {/* PM Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['PM']}>
                <DashboardPM />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute allowedRoles={['PM']}>
                <ClientList />
              </ProtectedRoute>
            } />
            <Route path="/clients/:id" element={
              <ProtectedRoute allowedRoles={['PM']}>
                <ClientDetails />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute allowedRoles={['PM']}>
                <TeamPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['PM']}>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Designer Routes */}
            <Route path="/designer" element={
              <ProtectedRoute allowedRoles={['DESIGNER', 'BOTH']}>
                <DashboardDesigner />
              </ProtectedRoute>
            } />

            {/* Developer Routes */}
            <Route path="/developer" element={
              <ProtectedRoute allowedRoles={['DEVELOPER', 'BOTH']}>
                <DashboardDeveloper />
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/history" element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
