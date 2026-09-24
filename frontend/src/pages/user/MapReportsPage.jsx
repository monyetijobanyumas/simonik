// ============================================================
// SIMONIK - Map Reports Page
// File: src/pages/user/MapReportsPage.jsx
// Deskripsi: Peta persebaran laporan user — legend clickable
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

const DEFAULT_CENTER = [-6.6829, 106.9253];
const DEFAULT_ZOOM = 12;

function createColoredIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

// Auto-fit peta ke semua marker (saat data pertama load)
function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
    // eslint-disable-next-line
  }, [positions]);

  return null;
}

// Expose map instance ke parent via ref
function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export default function MapReportsPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

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

  function handleViewDetail(reportId) {
    navigate(`/user/report/${reportId}`);
  }

  // Klik legend → zoom ke marker status itu
  function handleLegendClick(status) {
    const filtered = reports.filter((r) => r.status === status);
    if (filtered.length === 0 || !mapRef.current) return;

    const positions = filtered.map((r) => [
      Number(r.latitude),
      Number(r.longitude),
    ]);

    if (positions.length === 1) {
      // 1 marker → fly ke marker
      mapRef.current.flyTo(positions[0], 17, { duration: 1 });
    } else {
      // >1 marker → fit bounds
      const bounds = L.latLngBounds(positions);
      mapRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 17,
        duration: 1,
      });
    }
  }

  const positions = reports.map((r) => [Number(r.latitude), Number(r.longitude)]);
  const center = positions.length > 0 ? positions[0] : DEFAULT_CENTER;

  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.stateBox}>
          <p style={styles.stateText}>Memuat peta laporan...</p>
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
          <h1 style={styles.title}>Peta Persebaran Laporan</h1>
          <p style={styles.subtitle}>
            {reports.length} laporan tersebar di peta
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

      {/* Empty state */}
      {reports.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>🗺️</div>
          <p style={styles.emptyTitle}>Belum ada laporan</p>
          <p style={styles.emptyText}>
            Belum ada laporan yang bisa ditampilkan di peta.
          </p>
        </div>
      ) : (
        <>
          {/* Legend Clickable */}
          <div style={styles.legend}>
            {Object.entries(STATUS_INFO).map(([key, info]) => {
              const count = statusCounts[key] || 0;
              const disabled = count === 0;
              return (
                <button
                  key={key}
                  onClick={() => !disabled && handleLegendClick(key)}
                  disabled={disabled}
                  style={{
                    ...styles.legendItem,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.background = '#f0f7ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span
                    style={{
                      ...styles.legendDot,
                      background: info.color,
                    }}
                  />
                  <span style={styles.legendLabel}>
                    {info.label} ({count})
                  </span>
                </button>
              );
            })}
            <span style={styles.legendHint}>👆 Klik untuk zoom ke status</span>
          </div>

          {/* Peta */}
          <div style={styles.mapWrapper}>
            <MapContainer
              center={center}
              zoom={DEFAULT_ZOOM}
              style={styles.map}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapRefSetter mapRef={mapRef} />
              <FitBounds positions={positions} />

              {reports.map((report) => {
                const statusInfo = STATUS_INFO[report.status] || {
                  label: report.status,
                  color: '#666',
                };
                const scopeInfo = SCOPE_INFO[report.scope] || {
                  label: report.scope,
                  icon: '📍',
                };

                return (
                  <Marker
                    key={report.id}
                    position={[Number(report.latitude), Number(report.longitude)]}
                    icon={createColoredIcon(statusInfo.color)}
                  >
                    <Popup>
                      <div style={styles.popupContent}>
                        <div style={styles.popupHeader}>
                          <span style={styles.popupScope}>
                            {scopeInfo.icon} {scopeInfo.label}
                          </span>
                          <span
                            style={{
                              ...styles.popupStatus,
                              color: statusInfo.color,
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <p style={styles.popupTitle}>{report.title}</p>
                        <p style={styles.popupDesc}>
                          {report.description.length > 80
                            ? report.description.substring(0, 80) + '...'
                            : report.description}
                        </p>

                        <button
                          onClick={() => handleViewDetail(report.id)}
                          style={styles.popupBtn}
                          onMouseEnter={(e) =>
                            (e.target.style.background = '#1a5490')
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = '#0b3d6b')
                          }
                        >
                          Lihat Detail →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
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
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: '12px',
    color: '#333',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  legendHint: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#999',
    fontStyle: 'italic',
  },
  mapWrapper: {
    height: '600px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  map: { height: '100%', width: '100%' },
  popupContent: { minWidth: '200px', fontFamily: 'system-ui, sans-serif' },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  popupScope: { fontSize: '11px', color: '#666', fontWeight: 600 },
  popupStatus: { fontSize: '11px', fontWeight: 700 },
  popupTitle: {
    margin: '0 0 4px',
    color: '#0b3d6b',
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  popupDesc: {
    margin: '0 0 10px',
    color: '#666',
    fontSize: '12px',
    lineHeight: 1.4,
  },
  popupBtn: {
    padding: '6px 12px',
    background: '#0b3d6b',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 600,
    width: '100%',
    transition: 'background 0.2s ease',
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