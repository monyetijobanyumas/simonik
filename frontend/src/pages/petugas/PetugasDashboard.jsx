// ============================================================
// SIMONIK - Petugas Dashboard
// File: src/pages/petugas/PetugasDashboard.jsx
// Deskripsi: Dashboard petugas - summary cards + list
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

const STATUS_INFO = {
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6' },
  SELESAI: { label: 'Selesai', color: '#27ae60' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b' },
};

export default function PetugasDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

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

  // Filter list sesuai summary card aktif
  const filteredReports =
    activeFilter === 'ALL'
      ? reports
      : reports.filter((r) => r.status === activeFilter);

  function countByStatus(status) {
    if (status === 'ALL') return reports.length;
    return reports.filter((r) => r.status === status).length;
  }

  function handleSummaryClick(status) {
    // Klik card yang sama = toggle off (kembali ke ALL)
    if (activeFilter === status && status !== 'ALL') {
      setActiveFilter('ALL');
    } else {
      setActiveFilter(status);
    }
    // Scroll ke list
    setTimeout(() => {
      const el = document.getElementById('laporan-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  const userScopes = user?.scopes || [];

  const summaryData = [
    {
      key: 'ALL',
      label: 'Total Laporan',
      count: reports.length,
      color: '#0b3d6b',
    },
    ...Object.entries(STATUS_INFO).map(([key, info]) => ({
      key,
      label: info.label,
      count: countByStatus(key),
      color: info.color,
    })),
  ];

  // Label untuk header list
  const activeLabel =
    activeFilter === 'ALL'
      ? 'Semua Laporan'
      : STATUS_INFO[activeFilter]?.label || activeFilter;

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

      {/* Summary Cards (sekaligus filter) */}
      <div style={styles.summaryGrid}>
        {summaryData.map((item) => {
          const isActive = activeFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleSummaryClick(item.key)}
              style={{
                ...styles.summaryCard,
                borderColor: isActive ? item.color : '#e5e5e5',
                background: isActive ? `${item.color}0d` : '#fff',
                boxShadow: isActive
                  ? `0 4px 12px ${item.color}33`
                  : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div
                style={{
                  ...styles.summaryLabel,
                  color: item.color,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  ...styles.summaryValue,
                  color: item.color,
                }}
              >
                {item.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info filter aktif */}
      {activeFilter !== 'ALL' && (
        <div style={styles.filterInfo}>
          <span style={styles.filterInfoText}>
            Menampilkan laporan dengan status:{' '}
            <strong style={{ color: STATUS_INFO[activeFilter]?.color }}>
              {STATUS_INFO[activeFilter]?.label}
            </strong>
          </span>
          <button
            onClick={() => setActiveFilter('ALL')}
            style={styles.clearFilterBtn}
            onMouseEnter={(e) => (e.target.style.background = '#f0f0f0')}
            onMouseLeave={(e) => (e.target.style.background = '#fff')}
          >
            ✗ Hapus filter
          </button>
        </div>
      )}

      {/* Section List */}
      <div style={styles.section} id="laporan-section">
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {activeLabel}
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
              {activeFilter === 'ALL'
                ? 'Belum ada laporan di scope Anda'
                : `Tidak ada laporan dengan status ${
                    STATUS_INFO[activeFilter]?.label
                  }`}
            </p>
            <p style={styles.emptyText}>
              {activeFilter === 'ALL'
                ? 'Laporan dari user akan muncul di sini sesuai scope Anda.'
                : 'Coba pilih status lain atau hapus filter.'}
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  summaryCard: {
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '8px',
    padding: '14px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition:
      'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  summaryLabel: {
    fontSize: '10px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 700,
    marginBottom: '6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: 800,
    lineHeight: 1,
  },
  filterInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#f0f7ff',
    border: '1px solid #cce0f5',
    borderRadius: '8px',
    marginBottom: '20px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterInfoText: {
    fontSize: '13px',
    color: '#333',
  },
  clearFilterBtn: {
    padding: '6px 12px',
    background: '#fff',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'background 0.2s ease',
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