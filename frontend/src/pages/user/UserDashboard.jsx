// ============================================================
// SIMONIK - User Dashboard
// File: src/pages/user/UserDashboard.jsx
// ============================================================

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard User</h1>
          <p style={styles.subtitle}>
            Selamat datang, <strong>{user?.name}</strong>
          </p>
        </div>
        <button
          onClick={logout}
          style={styles.logoutBtn}
          onMouseEnter={(e) => (e.target.style.background = '#fff5f5')}
          onMouseLeave={(e) => (e.target.style.background = '#fff')}
        >
          Logout
        </button>
      </div>

      <div style={styles.actions}>
        <Link
          to="/user/create-report"
          style={styles.primaryBtn}
          onMouseEnter={(e) => {
            e.target.style.background = '#1a5490';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(11, 61, 107, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#0b3d6b';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          + Buat Laporan Baru
        </Link>
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>Informasi Akun</h3>
        <p style={styles.infoRow}>
          <span style={styles.infoLabel}>Nama:</span> {user?.name}
        </p>
        <p style={styles.infoRow}>
          <span style={styles.infoLabel}>Email:</span> {user?.email}
        </p>
        <p style={styles.infoRow}>
          <span style={styles.infoLabel}>Role:</span> {user?.role}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    color: '#0b3d6b',
    fontSize: '24px',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#666',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#fff',
    color: '#c0392b',
    border: '1px solid #c0392b',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background 0.2s ease',
  },
  actions: {
    marginBottom: '24px',
  },
  primaryBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#0b3d6b',
    color: '#fff',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
  },
  infoCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  infoTitle: {
    margin: '0 0 12px',
    color: '#0b3d6b',
    fontSize: '16px',
  },
  infoRow: {
    margin: '6px 0',
    fontSize: '14px',
    color: '#333',
  },
  infoLabel: {
    display: 'inline-block',
    width: '80px',
    color: '#666',
  },
};