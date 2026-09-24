// ============================================================
// SIMONIK - App Routes
// File: src/routes/AppRoutes.jsx
// Deskripsi: Definisi routing aplikasi
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import UserDashboard from '../pages/user/UserDashboard';
import CreateReportPage from '../pages/user/CreateReportPage';
import PetugasDashboard from '../pages/petugas/PetugasDashboard';

// ============================================================
// Komponen untuk proteksi route (harus login)
// ============================================================
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
        Memuat...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ============================================================
// Routing Utama
// ============================================================
export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* User */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/create-report"
          element={
            <ProtectedRoute allowedRole="user">
              <CreateReportPage />
            </ProtectedRoute>
          }
        />

        {/* Petugas */}
        <Route
          path="/petugas/dashboard"
          element={
            <ProtectedRoute allowedRole="petugas">
              <PetugasDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect default berdasarkan role */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.role === 'petugas'
                    ? '/petugas/dashboard'
                    : '/user/dashboard'
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback: route tidak dikenal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}