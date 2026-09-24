// ============================================================
// SIMONIK - Petugas Dashboard
// File: src/pages/petugas/PetugasDashboard.jsx
// Deskripsi: Dashboard petugas - laporan per-scope + tombol peta + statistik
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import ReportCard from '../../components/ReportCard';

const SCOPE_INFO = {
  jalan: { label: 'Jalan', icon: '🛣️' },
  lampu: { label: 'Lampu Penerangan', icon: '💡' },
  drainase: { label: 'Drainase', icon: '🚰' },
};

const TABS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'DIAJUKAN', label: 'Diajukan' },
  { key: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { key: 'DIPROSES', label: 'Diproses' },
  { key: 'SELESAI', label: 'Selesai' },
  { key: 'DITOLAK', label: 'Ditolak' },
];

export default function PetugasDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports');
      setReports(response.data.data.reports);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan.');
    } finally {
      setLoading(false);
    }
  }

  function handleReportClick(reportId) {
    navigate(`/petugas/report/${reportId}`);
  }

  const filteredReports =
    activeTab === 'ALL'
      ? reports
      : reports.filter((r) => r.status === activeTab);

  function countByStatus(status) {
    if (status === 'ALL') return reports.length;
    return reports.filter((r) => r.status === status).length;
  }

  const userScopes = user?.scopes || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard Petugas</h1>
          <p style={styles.subtitle}>
            Selamat datang, <strong>{user?.name}</strong>
          </p>
          <div style={styles.scopeBadges}>
            {userScopes.map((scope) => {
              const info = SCOPE_INFO[scope] || { label: scope, icon: '📍' };
              return (
                <span key={scope} style={styles.scopeBadge}>
                  {info.icon} {info.label}
                </span>
              );
            })}
          </div>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate('/petugas/map')}
            style={styles.actionBtn}
            onMouseEnter={(e) => {
              e.target.style.background = '#0b3d6b';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#0b3d6b';
            }}
          >
            🗺️ Peta Laporan
          </button>
          <button
            onClick={() => navigate('/petugas/statistik')}
            style={styles.actionBtn}
            onMouseEnter={(e) => {
              e.target.style.background = '#0b3d6b';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#0b3d6b';
            }}
          >
            📊 Statistik
          </button>
          <button
            onClick={logout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => (e.target.style.background = '#fff5f5')}
            onMouseLeave={(e) => (e.target.style.background = '#fff')}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Filter */}
      <div style={styles.tabsWrapper}>
        {TABS.map((tab) => {
          const count = countByStatus(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.target.style.background = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.target.style.background = 'transparent';
              }}
            >
              {tab.label}
              <span
                style={{
                  ...styles.tabBadge,
                  ...(isActive ? styles.tabBadgeActive : {}),
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section List */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            Laporan{' '}
            {activeTab !== 'ALL'
              ? TABS.find((t) => t.key === activeTab).label
              : ''}
            {!loading && filteredReports.length > 0 && (
              <span style={styles.countBadge}>{filteredReports.length}</span>
            )}
          </h2>
          <button
            onClick={fetchReports}
            style={styles.refreshBtn}
            onMouseEnter={(e) => (e.target.style.color = '#1a5490')}
            onMouseLeave={(e) => (e.target.style.color = '#0b3d6b')}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div style={styles.stateBox}>
            <p style={styles.stateText}>Memuat laporan...</p>
          </div>
        )}

        {error && !loading && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>⚠️ {error}</p>
            <button onClick={fetchReports} style={styles.retryBtn}>
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && filteredReports.length === 0 && (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyTitle}>
              {activeTab === 'ALL'
                ? 'Belum ada laporan di scope Anda'
                : `Tidak ada laporan dengan status ${
                    TABS.find((t) => t.key === activeTab)?.label
                  }`}
            </p>
            <p style={styles.emptyText}>
              {activeTab === 'ALL'
                ? 'Laporan dari user akan muncul di sini sesuai scope Anda.'
                : 'Coba pilih tab lain.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredReports.length > 0 && (
          <div>
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => handleReportClick(report.id)}
              />
            ))}
          </div>
        )}
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
    alignItems: 'flex-start',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: { margin: 0, color: '#0b3d6b', fontSize: '24px' },
  subtitle: { margin: '4px 0 8px', color: '#666', fontSize: '14px' },
  scopeBadges: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  scopeBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    background: '#eaf4fb',
    color: '#0b3d6b',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '8px 14px',
    background: '#fff',
    color: '#0b3d6b',
    border: '1px solid #0b3d6b',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background 0.2s ease, color 0.2s ease',
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
  tabsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e5e5',
    paddingBottom: '12px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'transparent',
    color: '#666',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background 0.2s ease, color 0.2s ease',
  },
  tabActive: { background: '#0b3d6b', color: '#fff' },
  tabBadge: {
    display: 'inline-block',
    padding: '1px 7px',
    background: '#f0f0f0',
    color: '#666',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 700,
  },
  tabBadgeActive: {
    background: 'rgba(255,255,255,0.25)',
    color: '#fff',
  },
  section: { marginTop: '8px' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    margin: 0,
    color: '#0b3d6b',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  countBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    background: '#eaf4fb',
    color: '#0b3d6b',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
  },
  refreshBtn: {
    padding: '6px 12px',
    background: 'transparent',
    color: '#0b3d6b',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
  },
  stateBox: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#888',
  },
  stateText: { fontSize: '14px', fontStyle: 'italic' },
  errorBox: {
    padding: '16px 20px',
    background: '#fff5f5',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    textAlign: 'center',
  },
  errorText: { margin: '0 0 12px', color: '#c0392b', fontSize: '14px' },
  retryBtn: {
    padding: '8px 16px',
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  emptyBox: {
    padding: '40px 20px',
    textAlign: 'center',
    background: '#fff',
    borderRadius: '8px',
    border: '1px dashed #ccc',
  },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: {
    margin: '0 0 4px',
    color: '#333',
    fontSize: '16px',
    fontWeight: 600,
  },
  emptyText: { margin: 0, color: '#888', fontSize: '13px' },
};