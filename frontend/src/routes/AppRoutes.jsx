// ============================================================
// SIMONIK - App Routes
// File: src/routes/AppRoutes.jsx
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import UserDashboard from '../pages/user/UserDashboard';
import PetugasDashboard from '../pages/petugas/PetugasDashboard';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/petugas/dashboard"
          element={
            <ProtectedRoute allowedRole="petugas">
              <PetugasDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={user.role === 'petugas' ? '/petugas/dashboard' : '/user/dashboard'}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}