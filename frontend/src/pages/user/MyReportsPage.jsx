// ============================================================
// SIMONIK - My Reports Page
// File: src/pages/user/MyReportsPage.jsx
// Deskripsi: List laporan milik user
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import ReportCard from '../../components/ReportCard';

export default function MyReportsPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
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
    navigate(`/user/report/${reportId}`);
  }

  return (
    <div style={styles.container}>
      {/* Back link */}
      <Link
        to="/user/dashboard"
        style={styles.backLink}
        onMouseEnter={(e) => (e.target.style.color = '#1a5490')}
        onMouseLeave={(e) => (e.target.style.color = '#0b3d6b')}
      >
        ← Kembali ke Dashboard
      </Link>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Laporan Saya</h1>
          <p style={styles.subtitle}>
            Daftar laporan yang pernah Anda kirim
          </p>
        </div>
        <button
          onClick={fetchReports}
          style={styles.refreshBtn}
          onMouseEnter={(e) => (e.target.style.color = '#1a5490')}
          onMouseLeave={(e) => (e.target.style.color = '#0b3d6b')}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.stateBox}>
          <p style={styles.stateText}>Memuat laporan...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={styles.errorBox}>
          <p style={styles.errorText}>⚠️ {error}</p>
          <button onClick={fetchReports} style={styles.retryBtn}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reports.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyTitle}>Belum ada laporan</p>
          <p style={styles.emptyText}>
            Klik tombol "Buat Laporan Baru" di dashboard untuk mulai melapor.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && reports.length > 0 && (
        <div>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => handleReportClick(report.id)}
            />
          ))}
        </div>
      )}
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
  backLink: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#0b3d6b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    gap: '16px',
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
  refreshBtn: {
    padding: '8px 14px',
    background: 'transparent',
    color: '#0b3d6b',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
    flexShrink: 0,
  },
  stateBox: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#888',
  },
  stateText: {
    fontSize: '14px',
    fontStyle: 'italic',
  },
  errorBox: {
    padding: '16px 20px',
    background: '#fff5f5',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    textAlign: 'center',
  },
  errorText: {
    margin: '0 0 12px',
    color: '#c0392b',
    fontSize: '14px',
  },
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
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  emptyTitle: {
    margin: '0 0 4px',
    color: '#333',
    fontSize: '16px',
    fontWeight: 600,
  },
  emptyText: {
    margin: 0,
    color: '#888',
    fontSize: '13px',
  },
};