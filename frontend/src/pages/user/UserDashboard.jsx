// ============================================================
// SIMONIK - User Dashboard
// File: src/pages/user/UserDashboard.jsx
// Deskripsi: Landing page user dengan 2 tombol besar
// ============================================================

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Header */}
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

      {/* Dua Tombol Besar */}
      <div style={styles.menuGrid}>
        {/* Tombol Buat Laporan */}
        <button
          onClick={() => navigate('/user/report-type')}
          style={styles.menuCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0b3d6b';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(11, 61, 107, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e5e5';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
        >
          <div style={styles.menuIcon}>📝</div>
          <h2 style={styles.menuTitle}>Buat Laporan Baru</h2>
          <p style={styles.menuDesc}>
            Laporkan masalah infrastruktur di sekitar Anda
          </p>
        </button>

        {/* Tombol Laporan Saya */}
        <button
          onClick={() => navigate('/user/my-reports')}
          style={styles.menuCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0b3d6b';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(11, 61, 107, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e5e5';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
        >
          <div style={styles.menuIcon}>📋</div>
          <h2 style={styles.menuTitle}>Laporan Saya</h2>
          <p style={styles.menuDesc}>
            Lihat daftar dan status laporan Anda
          </p>
        </button>
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
    marginBottom: '40px',
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
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  menuCard: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    fontFamily: 'inherit',
  },
  menuIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  menuTitle: {
    margin: '0 0 8px',
    color: '#0b3d6b',
    fontSize: '18px',
    fontWeight: 700,
  },
  menuDesc: {
    margin: 0,
    color: '#666',
    fontSize: '13px',
    lineHeight: 1.5,
  },
};