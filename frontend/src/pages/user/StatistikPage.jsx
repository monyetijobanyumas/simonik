// ============================================================
// SIMONIK - Statistik Page (User)
// File: src/pages/user/StatistikPage.jsx
// Deskripsi: Dashboard statistik laporan user
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import api from '../../api/axios';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const STATUS_INFO = {
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6' },
  SELESAI: { label: 'Selesai', color: '#27ae60' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b' },
};

const SCOPE_INFO = {
  jalan: { label: 'Jalan', color: '#0b3d6b' },
  lampu: { label: 'Lampu Penerangan', color: '#f39c12' },
  drainase: { label: 'Drainase', color: '#27ae60' },
};

export default function StatistikPage() {
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
      setError(err.response?.data?.message || 'Gagal memuat data statistik.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.stateBox}>
          <p style={styles.stateText}>Memuat statistik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Link to="/user/dashboard" style={styles.backLink}>
          ← Kembali ke Dashboard
        </Link>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>⚠️ {error}</p>
          <button onClick={fetchReports} style={styles.retryBtn}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ============ HITUNG DATA ============

  // 1. Count per status
  const statusCounts = {};
  Object.keys(STATUS_INFO).forEach((key) => {
    statusCounts[key] = reports.filter((r) => r.status === key).length;
  });

  // 2. Count per scope
  const scopeCounts = {};
  Object.keys(SCOPE_INFO).forEach((key) => {
    scopeCounts[key] = reports.filter((r) => r.scope === key).length;
  });

  // 3. Data 7 hari terakhir
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = reports.filter((r) => {
      const reportDate = new Date(r.created_at).toISOString().split('T')[0];
      return reportDate === dateStr;
    }).length;
    last7Days.push({
      label: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      count,
    });
  }

  // ============ DATA CHART ============

  const statusChartData = {
    labels: Object.values(STATUS_INFO).map((s) => s.label),
    datasets: [
      {
        data: Object.keys(STATUS_INFO).map((key) => statusCounts[key]),
        backgroundColor: Object.values(STATUS_INFO).map((s) => s.color),
        borderColor: '#fff',
        borderWidth: 3,
      },
    ],
  };

  const scopeChartData = {
    labels: Object.values(SCOPE_INFO).map((s) => s.label),
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: Object.keys(SCOPE_INFO).map((key) => scopeCounts[key]),
        backgroundColor: Object.values(SCOPE_INFO).map((s) => s.color),
        borderRadius: 6,
      },
    ],
  };

  const trendChartData = {
    labels: last7Days.map((d) => d.label),
    datasets: [
      {
        label: 'Laporan Masuk',
        data: last7Days.map((d) => d.count),
        borderColor: '#0b3d6b',
        backgroundColor: 'rgba(11, 61, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0b3d6b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 12,
          usePointStyle: true,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <Link
            to="/user/dashboard"
            style={styles.backLink}
            onMouseEnter={(e) => (e.target.style.color = '#1a5490')}
            onMouseLeave={(e) => (e.target.style.color = '#0b3d6b')}
          >
            ← Kembali ke Dashboard
          </Link>
          <h1 style={styles.title}>Statistik Laporan</h1>
          <p style={styles.subtitle}>
            Ringkasan data laporan Anda
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

      {/* Empty */}
      {reports.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📊</div>
          <p style={styles.emptyTitle}>Belum ada data</p>
          <p style={styles.emptyText}>
            Belum ada laporan untuk ditampilkan statistiknya.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Laporan</div>
              <div style={styles.summaryValue}>{reports.length}</div>
            </div>
            {Object.entries(STATUS_INFO).map(([key, info]) => (
              <div key={key} style={styles.summaryCard}>
                <div
                  style={{
                    ...styles.summaryLabel,
                    color: info.color,
                  }}
                >
                  {info.label}
                </div>
                <div
                  style={{
                    ...styles.summaryValue,
                    color: info.color,
                  }}
                >
                  {statusCounts[key]}
                </div>
              </div>
            ))}
          </div>

          {/* Chart 1: Status (Doughnut) */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Laporan per Status</h2>
            <div style={styles.chartWrapper}>
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </div>

          {/* Chart 2: Scope (Bar) */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Laporan per Jenis Infrastruktur</h2>
            <div style={styles.chartWrapper}>
              <Bar data={scopeChartData} options={barOptions} />
            </div>
          </div>

          {/* Chart 3: Trend 7 Hari (Line) */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Tren 7 Hari Terakhir</h2>
            <div style={styles.chartWrapper}>
              <Line data={trendChartData} options={lineOptions} />
            </div>
          </div>
        </>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '8px',
    color: '#0b3d6b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
  },
  title: { margin: 0, color: '#0b3d6b', fontSize: '24px' },
  subtitle: { margin: '4px 0 0', color: '#666', fontSize: '14px' },
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  summaryCard: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  summaryValue: {
    fontSize: '24px',
    color: '#0b3d6b',
    fontWeight: 800,
    lineHeight: 1,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    margin: '0 0 16px',
    color: '#0b3d6b',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  },
  chartWrapper: {
    position: 'relative',
    height: '280px',
  },
  stateBox: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#888',
  },
  stateText: { fontSize: '14px', fontStyle: 'italic' },
  errorBox: {
    padding: '20px',
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
    padding: '60px 20px',
    textAlign: 'center',
    background: '#fff',
    borderRadius: '8px',
    border: '1px dashed #ccc',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyTitle: {
    margin: '0 0 4px',
    color: '#333',
    fontSize: '16px',
    fontWeight: 600,
  },
  emptyText: { margin: 0, color: '#888', fontSize: '13px' },
};