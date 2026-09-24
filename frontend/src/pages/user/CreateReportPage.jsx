// ============================================================
// SIMONIK - Create Report Page
// File: src/pages/user/CreateReportPage.jsx
// Deskripsi: Halaman buat laporan dengan peta & GPS
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

// Fix ikon marker Leaflet (Vite bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Default center: Purwokerto
const DEFAULT_CENTER = [-7.4234, 109.2345];
const DEFAULT_ZOOM = 15;

// ============================================================
// Komponen: handle klik peta
// ============================================================
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

// ============================================================
// Komponen: pindahkan peta ke posisi baru
// ============================================================
function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

// ============================================================
// Komponen Utama
// ============================================================
export default function CreateReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scope, setScope] = useState('jalan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  useEffect(() => {
    handleGetLocation();
    // eslint-disable-next-line
  }, []);

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsStatus('Browser tidak mendukung GPS');
      return;
    }

    setGpsLoading(true);
    setGpsStatus('Mengambil lokasi...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setGpsStatus(
          `Lokasi ditemukan (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
        );
        setGpsLoading(false);
      },
      (err) => {
        console.error(err);
        setGpsStatus('Gagal ambil lokasi. Klik peta untuk pilih manual.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul laporan wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setError('Deskripsi laporan wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/reports', {
        scope,
        title,
        description,
        latitude: position[0],
        longitude: position[1],
      });

      alert('Laporan berhasil dikirim!');
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link
          to="/user/dashboard"
          style={styles.backLink}
          onMouseEnter={(e) => (e.target.style.color = '#1a5490')}
          onMouseLeave={(e) => (e.target.style.color = '#0b3d6b')}
        >
          ← Kembali
        </Link>
        <h1 style={styles.title}>Buat Laporan Baru</h1>
        <p style={styles.subtitle}>
          Laporkan masalah infrastruktur di sekitar Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Jenis Infrastruktur */}
        <div style={styles.field}>
          <label style={styles.label}>Jenis Infrastruktur</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={styles.select}
          >
            <option value="jalan">Jalan</option>
            <option value="lampu">Lampu Penerangan Jalan</option>
            <option value="drainase">Drainase</option>
          </select>
        </div>

        {/* Judul */}
        <div style={styles.field}>
          <label style={styles.label}>Judul Laporan</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Jalan berlubang parah"
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = '#0b3d6b')}
            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
          />
        </div>

        {/* Deskripsi */}
        <div style={styles.field}>
          <label style={styles.label}>Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan kondisi kerusakan secara detail..."
            rows={4}
            style={styles.textarea}
            onFocus={(e) => (e.target.style.borderColor = '#0b3d6b')}
            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
          />
        </div>

        {/* Lokasi */}
        <div style={styles.field}>
          <label style={styles.label}>Lokasi</label>

          <div style={styles.gpsRow}>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading}
              style={styles.gpsButton}
              onMouseEnter={(e) => {
                if (!gpsLoading) {
                  e.target.style.background = '#1a5490';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#0b3d6b';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {gpsLoading ? 'Mengambil...' : '📍 Lokasi Saya'}
            </button>
            <span style={styles.gpsStatus}>{gpsStatus}</span>
          </div>

          <div style={styles.mapWrapper}>
            <MapContainer
              center={position}
              zoom={DEFAULT_ZOOM}
              style={styles.map}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
              <MapController position={position} />
            </MapContainer>
          </div>

          <p style={styles.coordInfo}>
            📌 Koordinat: {position[0].toFixed(5)}, {position[1].toFixed(5)}
            <br />
            <span style={styles.coordHint}>
              Klik peta untuk ubah lokasi, atau klik tombol "Lokasi Saya".
            </span>
          </p>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={styles.submitBtn}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = '#1a5490';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow =
                '0 6px 20px rgba(11, 61, 107, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#0b3d6b';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {loading ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
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
  header: {
    marginBottom: '24px',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '12px',
    color: '#0b3d6b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    transition: 'border-color 0.2s ease',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.2s ease',
  },
  gpsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  gpsButton: {
    padding: '8px 16px',
    background: '#0b3d6b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background 0.2s ease, transform 0.2s ease',
  },
  gpsStatus: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
  },
  mapWrapper: {
    height: '400px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #ccc',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  coordInfo: {
    margin: '8px 0 0',
    fontSize: '13px',
    color: '#333',
  },
  coordHint: {
    fontSize: '11px',
    color: '#888',
    fontStyle: 'italic',
  },
  error: {
    padding: '12px',
    background: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    fontSize: '13px',
  },
  submitBtn: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: 600,
    background: '#0b3d6b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
  },
};