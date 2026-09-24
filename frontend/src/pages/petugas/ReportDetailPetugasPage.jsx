// ============================================================
// SIMONIK - Report Detail Petugas Page
// File: src/pages/petugas/ReportDetailPetugasPage.jsx
// Deskripsi: Halaman detail laporan petugas + foto + tombol aksi
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';
import { formatFullDate, formatRelativeTime } from '../../utils/formatDate';

// Fix ikon marker Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SCOPE_INFO = {
  jalan: { label: 'Jalan', icon: '🛣️' },
  lampu: { label: 'Lampu Penerangan Jalan', icon: '💡' },
  drainase: { label: 'Drainase', icon: '🚰' },
};

const STATUS_INFO = {
  DIAJUKAN: { label: 'Diajukan', color: '#f39c12', bg: '#fef5e7' },
  DIVERIFIKASI: { label: 'Diverifikasi', color: '#3498db', bg: '#eaf4fb' },
  DIPROSES: { label: 'Diproses', color: '#9b59b6', bg: '#f4ecf7' },
  SELESAI: { label: 'Selesai', color: '#27ae60', bg: '#eafaf1' },
  DITOLAK: { label: 'Ditolak', color: '#c0392b', bg: '#fff5f5' },
};

const STATUS_ACTIONS = {
  DIAJUKAN: [
    {
      status: 'DIVERIFIKASI',
      label: 'Verifikasi Laporan',
      color: '#27ae60',
      icon: '✓',
      notePlaceholder: 'Catatan verifikasi (opsional)',
      confirmText: 'Verifikasi laporan ini? Laporan akan diteruskan untuk ditangani.',
    },
    {
      status: 'DITOLAK',
      label: 'Tolak Laporan',
      color: '#c0392b',
      icon: '✗',
      notePlaceholder: 'Alasan penolakan (wajib)',
      confirmText: 'Tolak laporan ini? Pastikan alasan penolakan diisi.',
      requireNote: true,
    },
  ],
  DIVERIFIKASI: [
    {
      status: 'DIPROSES',
      label: 'Mulai Proses Penanganan',
      color: '#9b59b6',
      icon: '▶',
      notePlaceholder: 'Catatan mulai proses (opsional)',
      confirmText: 'Mulai proses penanganan laporan ini?',
    },
  ],
  DIPROSES: [
    {
      status: 'SELESAI',
      label: 'Tandai Selesai',
      color: '#27ae60',
      icon: '✓',
      notePlaceholder: 'Catatan penyelesaian (opsional)',
      confirmText: 'Tandai laporan ini sebagai SELESAI? Laporan tidak bisa diubah lagi.',
    },
  ],
  SELESAI: [],
  DITOLAK: [],
};

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export default function ReportDetailPetugasPage() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const [reportRes, historyRes, attachRes] = await Promise.all([
        api.get(`/reports/${id}`),
        api.get(`/reports/${id}/history`),
        api.get(`/reports/${id}/attachments`),
      ]);
      setReport(reportRes.data.data.report);
      setHistory(historyRes.data.data.history);
      setAttachments(attachRes.data.data.attachments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail laporan.');
    } finally {
      setLoading(false);
    }
  }

  function openModal(action) {
    setModal({ action, note: '', loading: false, error: '' });
  }

  function closeModal() {
    setModal(null);
  }

  async function handleConfirm() {
    if (!modal) return;

    if (modal.action.requireNote && !modal.note.trim()) {
      setModal({ ...modal, error: 'Catatan wajib diisi untuk aksi ini.' });
      return;
    }

    setModal({ ...modal, loading: true, error: '' });

    try {
      await api.patch(`/reports/${id}/status`, {
        status: modal.action.status,
        note: modal.note.trim() || null,
      });
      await fetchData();
      closeModal();
    } catch (err) {
      setModal({
        ...modal,
        loading: false,
        error: err.response?.data?.message || 'Gagal mengubah status.',
      });
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.stateBox}>
          <p style={styles.stateText}>Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={styles.container}>
        <Link to="/petugas/dashboard" style={styles.backLink}>
          ← Kembali ke Dashboard
        </Link>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>⚠️ {error || 'Laporan tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const scopeInfo = SCOPE_INFO[report.scope] || { label: report.scope, icon: '📍' };
  const statusInfo = STATUS_INFO[report.status] || {
    label: report.status,
    color: '#666',
    bg: '#f5f5f5',
  };
  const position = [Number(report.latitude), Number(report.longitude)];
  const actions = STATUS_ACTIONS[report.status] || [];

  return (
    <div style={styles.container}>
      <Link
        to="/petugas/dashboard"
        style={styles.backLink}
        onMouseEnter={(e) => (e.target.style.color = '#1a5490')}
        onMouseLeave={(e) => (e.target.style.color = '#0b3d6b')}
      >
        ← Kembali ke Dashboard
      </Link>

      {/* Card: Header */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
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

        <h1 style={styles.title}>{report.title}</h1>
        <p style={styles.meta}>🕐 Dibuat {formatRelativeTime(report.created_at)}</p>
        {report.user_name && (
          <p style={styles.pelapor}>
            👤 Dilaporkan oleh <strong>{report.user_name}</strong>
          </p>
        )}
      </div>

      {/* Card: Deskripsi */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Deskripsi</h2>
        <p style={styles.description}>{report.description}</p>
      </div>

      {/* Card: Foto */}
      {attachments.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Foto ({attachments.length})</h2>
          <div style={styles.photoGrid}>
            {attachments.map((att) => (
              <a
                key={att.id}
                href={`${API_BASE}${att.file_url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.photoItem}
              >
                <img
                  src={`${API_BASE}${att.file_url}`}
                  alt="Foto laporan"
                  style={styles.photoImg}
                  loading="lazy"
                />
                <span style={styles.photoType}>
                  {att.type === 'bukti' ? '✓ Bukti' : '📷 Laporan'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Card: Lokasi */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Lokasi</h2>
        <p style={styles.coordText}>
          📌 {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}
        </p>
        <div style={styles.mapWrapper}>
          <MapContainer
            center={position}
            zoom={16}
            style={styles.map}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
          </MapContainer>
        </div>
      </div>

      {/* Card: Timeline */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Riwayat Status</h2>
        <div style={styles.timeline}>
          {history.map((item, index) => {
            const info = STATUS_INFO[item.status] || {
              label: item.status,
              color: '#666',
              bg: '#f5f5f5',
            };
            const isLast = index === history.length - 1;

            return (
              <div key={item.id} style={styles.timelineItem}>
                <div style={styles.timelineLeft}>
                  <div style={{ ...styles.timelineDot, background: info.color }} />
                  {!isLast && <div style={styles.timelineLine} />}
                </div>
                <div style={styles.timelineContent}>
                  <div style={styles.timelineHeader}>
                    <span
                      style={{
                        ...styles.timelineStatus,
                        color: info.color,
                        background: info.bg,
                      }}
                    >
                      {info.label}
                    </span>
                    <span style={styles.timelineTime}>
                      {formatFullDate(item.changed_at)}
                    </span>
                  </div>
                  {item.note && <p style={styles.timelineNote}>{item.note}</p>}
                  {item.changed_by_name && (
                    <p style={styles.timelineBy}>
                      oleh <strong>{item.changed_by_name}</strong> ({item.changed_by_role})
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card: Aksi */}
      {actions.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Aksi</h2>
          <div style={styles.actionsRow}>
            {actions.map((action) => (
              <button
                key={action.status}
                onClick={() => openModal(action)}
                style={{ ...styles.actionBtn, background: action.color }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 20px ${action.color}66`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info final status */}
      {(report.status === 'SELESAI' || report.status === 'DITOLAK') && (
        <div style={styles.finalInfo}>
          <p style={styles.finalText}>
            {report.status === 'SELESAI'
              ? '✅ Laporan ini sudah selesai ditangani.'
              : '❌ Laporan ini sudah ditolak.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{modal.action.label}</h3>
            <p style={styles.modalConfirmText}>{modal.action.confirmText}</p>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>
                Catatan{' '}
                {modal.action.requireNote && <span style={{ color: '#c0392b' }}>*</span>}
              </label>
              <textarea
                value={modal.note}
                onChange={(e) =>
                  setModal({ ...modal, note: e.target.value, error: '' })
                }
                placeholder={modal.action.notePlaceholder}
                rows={3}
                style={styles.modalTextarea}
                autoFocus
              />
            </div>

            {modal.error && <div style={styles.modalError}>{modal.error}</div>}

            <div style={styles.modalActions}>
              <button
                onClick={closeModal}
                disabled={modal.loading}
                style={styles.modalCancelBtn}
                onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
                onMouseLeave={(e) => (e.target.style.background = '#fff')}
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={modal.loading}
                style={{ ...styles.modalConfirmBtn, background: modal.action.color }}
                onMouseEnter={(e) => {
                  if (!modal.loading) e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                {modal.loading ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
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
  card: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  scopeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#666',
    fontWeight: 600,
  },
  scopeIcon: { fontSize: '20px' },
  scopeLabel: { letterSpacing: '0.3px' },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
  title: {
    margin: '0 0 6px',
    color: '#0b3d6b',
    fontSize: '22px',
    lineHeight: 1.3,
  },
  meta: {
    margin: '0 0 6px',
    color: '#888',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  pelapor: { margin: 0, color: '#666', fontSize: '13px' },
  sectionTitle: {
    margin: '0 0 12px',
    color: '#0b3d6b',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  },
  description: {
    margin: 0,
    color: '#333',
    fontSize: '14px',
    lineHeight: 1.7,
  },
  coordText: {
    margin: '0 0 12px',
    color: '#333',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  mapWrapper: {
    height: '280px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
  },
  map: { height: '100%', width: '100%' },
  // Foto
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
  },
  photoItem: {
    position: 'relative',
    display: 'block',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
    aspectRatio: '1 / 1',
    textDecoration: 'none',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  photoType: {
    position: 'absolute',
    bottom: '6px',
    left: '6px',
    padding: '2px 8px',
    background: 'rgba(0,0,0,0.65)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '10px',
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
  errorText: { margin: 0, color: '#c0392b', fontSize: '14px' },
  // Timeline
  timeline: { display: 'flex', flexDirection: 'column' },
  timelineItem: { display: 'flex', gap: '16px', minHeight: '60px' },
  timelineLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '4px',
  },
  timelineDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    flexShrink: 0,
    border: '3px solid #fff',
    boxShadow: '0 0 0 1px #e5e5e5',
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    background: '#e5e5e5',
    margin: '4px 0',
  },
  timelineContent: { flex: 1, paddingBottom: '20px' },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  timelineStatus: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 700,
  },
  timelineTime: { fontSize: '11px', color: '#888' },
  timelineNote: {
    margin: '4px 0 0',
    color: '#333',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  timelineBy: { margin: '4px 0 0', color: '#888', fontSize: '11px' },
  // Aksi
  actionsRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  actionBtn: {
    padding: '12px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  finalInfo: {
    padding: '16px 20px',
    background: '#f5f7fa',
    borderRadius: '8px',
    textAlign: 'center',
    marginTop: '8px',
  },
  finalText: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
    fontWeight: 600,
  },
  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalBox: {
    background: '#fff',
    borderRadius: '12px',
    padding: '28px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: { margin: '0 0 8px', color: '#0b3d6b', fontSize: '18px' },
  modalConfirmText: {
    margin: '0 0 20px',
    color: '#666',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  modalField: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  modalLabel: { fontSize: '13px', fontWeight: 600, color: '#333' },
  modalTextarea: {
    padding: '10px 12px',
    fontSize: '13px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  modalError: {
    padding: '10px 12px',
    background: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    fontSize: '12px',
    marginBottom: '16px',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  modalCancelBtn: {
    padding: '10px 20px',
    background: '#fff',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background 0.2s ease',
  },
  modalConfirmBtn: {
    padding: '10px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'opacity 0.2s ease',
  },
};