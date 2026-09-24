// ============================================================
// SIMONIK - Report Card Component
// File: src/components/ReportCard.jsx
// Deskripsi: Kartu laporan untuk ditampilkan di list
// ============================================================

import { formatRelativeTime } from '../utils/formatDate';

// Mapping scope → label & ikon
const SCOPE_INFO = {
  jalan: { label: 'Jalan', icon: '🛣️' },
  lampu: { label: 'Lampu Penerangan', icon: '💡' },
  drainase: { label: 'Drainase', icon: '🚰' },
};

// Mapping status → label & warna
const STATUS_INFO = {
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12', bg: '#fef5e7' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db', bg: '#eaf4fb' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6', bg: '#f4ecf7' },
  SELESAI: { label: 'Selesai', color: '#27ae60', bg: '#eafaf1' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b', bg: '#fff5f5' },
};

export default function ReportCard({ report, onClick }) {
  const scopeInfo = SCOPE_INFO[report.scope] || { label: report.scope, icon: '📍' };
  const statusInfo = STATUS_INFO[report.status] || {
    label: report.status,
    color: '#666',
    bg: '#f5f5f5',
  };

  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#0b3d6b';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e5e5e5';
      }}
    >
      <div style={styles.header}>
        <div style={styles.scopeBadge}>
          <span style={styles.scopeIcon}>{scopeInfo.icon}</span>
          <span style={styles.scopeLabel}>{scopeInfo.label}</span>
        </div>
        <span
          style={{
            ...styles.statusBadge,
            color: statusInfo.color,
            background: statusInfo.bg,
          }}
        >
          {statusInfo.label}
        </span>
      </div>

      <h3 style={styles.title}>{report.title}</h3>

      <p style={styles.description}>
        {report.description.length > 100
          ? report.description.substring(0, 100) + '...'
          : report.description}
      </p>

      <div style={styles.footer}>
        <span style={styles.time}>🕐 {formatRelativeTime(report.created_at)}</span>
        {report.latitude != null && (
          <span style={styles.coord}>
            📌 {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    padding: '16px 20px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
    marginBottom: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  scopeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#666',
    fontWeight: 600,
  },
  scopeIcon: {
    fontSize: '16px',
  },
  scopeLabel: {
    letterSpacing: '0.3px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
  title: {
    margin: '0 0 6px',
    color: '#0b3d6b',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  description: {
    margin: '0 0 12px',
    color: '#666',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: '#888',
  },
  time: {
    fontStyle: 'italic',
  },
  coord: {
    fontFamily: 'monospace',
    color: '#999',
  },
};