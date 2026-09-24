// ============================================================
// SIMONIK - Create Report Page (Step 2)
// File: src/pages/user/CreateReportPage.jsx
// Deskripsi: Form detail laporan + upload foto
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';

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

const VALID_SCOPES = ['jalan', 'lampu', 'drainase'];
const DEFAULT_CENTER = [-7.4234, 109.2345];
const DEFAULT_ZOOM = 15;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Komponen: klik peta untuk pindah marker
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

// Komponen: pindahkan peta ke posisi baru
function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function CreateReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const scopeParam = searchParams.get('scope');
  const scopeInfo = SCOPE_INFO[scopeParam];

  // Validasi scope
  useEffect(() => {
    if (!scopeParam || !VALID_SCOPES.includes(scopeParam)) {
      navigate('/user/report-type', { replace: true });
    }
    // eslint-disable-next-line
  }, [scopeParam]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [photo, setPhoto] = useState(null); // File object
  const [photoPreview, setPhotoPreview] = useState(null); // Data URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  // Ambil GPS otomatis
  useEffect(() => {
    if (scopeInfo) handleGetLocation();
    // eslint-disable-next-line
  }, [scopeInfo]);

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

  // Handler pilih file foto
  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Hanya file JPG, PNG, atau WEBP yang diizinkan.');
      e.target.value = '';
      return;
    }

    // Validasi ukuran
    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 5MB.');
      e.target.value = '';
      return;
    }

    setError('');
    setPhoto(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  // Hapus foto yang dipilih
  function handleRemovePhoto() {
    setPhoto(null);
    setPhotoPreview(null);
    const input = document.getElementById('photo-input');
    if (input) input.value = '';
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
      // 1. Buat laporan dulu
      const reportRes = await api.post('/reports', {
        scope: scopeParam,
        title,
        description,
        latitude: position[0],
        longitude: position[1],
      });

      const reportId = reportRes.data.data.report.id;

      // 2. Kalau ada foto, upload
      if (photo) {
        const formData = new FormData();
        formData.append('file', photo);

        await api.post(`/reports/${reportId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      alert('Laporan berhasil dikirim!');
      navigate('/user/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan.');
    } finally {
      setLoading(false);
    }
  }

  if (!scopeInfo) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link
          to="/user/report-type"
          style={styles.backLink}
          onMouseEnter={(e) => (e.target.style.color = '#1a5490')}
          onMouseLeave={(e) => (e.target.style.color = '#0b3d6b')}
        >
          ← Ganti Jenis Infrastruktur
        </Link>

        <h1 style={styles.title}>Buat Laporan Baru</h1>
        <p style={styles.subtitle}>Lengkapi detail laporan Anda</p>

        <div style={styles.stepIndicator}>
          <div style={styles.stepDotDone} />
          <div style={styles.stepDotActive} />
          <span style={styles.stepLabel}>Tahap 2 dari 2</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Card: Jenis Terpilih */}
        <div style={styles.selectedTypeCard}>
          <div style={styles.selectedTypeIcon}>{scopeInfo.icon}</div>
          <div style={styles.selectedTypeContent}>
            <p style={styles.selectedTypeLabel}>Jenis Infrastruktur</p>
            <p style={styles.selectedTypeValue}>{scopeInfo.label}</p>
          </div>
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

        {/* Foto */}
        <div style={styles.field}>
          <label style={styles.label}>
            Foto Bukti <span style={styles.optional}>(opsional)</span>
          </label>

          {!photoPreview ? (
            <div style={styles.uploadBox}>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={styles.fileInput}
              />
              <label htmlFor="photo-input" style={styles.uploadLabel}>
                <div style={styles.uploadIcon}>📷</div>
                <p style={styles.uploadText}>Klik untuk pilih foto</p>
                <p style={styles.uploadHint}>
                  Format: JPG, PNG, WEBP · Maks 5MB
                </p>
              </label>
            </div>
          ) : (
            <div style={styles.previewBox}>
              <img src={photoPreview} alt="Preview" style={styles.previewImg} />
              <button
                type="button"
                onClick={handleRemovePhoto}
                style={styles.removePhotoBtn}
                onMouseEnter={(e) => (e.target.style.background = '#c0392b')}
                onMouseLeave={(e) => (e.target.style.background = '#e74c3c')}
              >
                ✗ Hapus Foto
              </button>
            </div>
          )}
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
            <MapContainer center={position} zoom={DEFAULT_ZOOM} style={styles.map}>
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

        {error && <div style={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={styles.submitBtn}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = '#1a5490';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(11, 61, 107, 0.4)';
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
  header: { marginBottom: '24px' },
  backLink: {
    display: 'inline-block',
    marginBottom: '12px',
    color: '#0b3d6b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'color 0.2s ease',
  },
  title: { margin: 0, color: '#0b3d6b', fontSize: '24px' },
  subtitle: { margin: '4px 0 16px', color: '#666', fontSize: '14px' },
  stepIndicator: { display: 'flex', alignItems: 'center', gap: '6px' },
  stepDotDone: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#0b3d6b',
  },
  stepDotActive: {
    width: '24px',
    height: '8px',
    borderRadius: '4px',
    background: '#0b3d6b',
  },
  stepLabel: {
    marginLeft: '10px',
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  selectedTypeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px',
    background: '#f0f7ff',
    border: '1px solid #cce0f5',
    borderRadius: '8px',
  },
  selectedTypeIcon: { fontSize: '32px' },
  selectedTypeContent: { display: 'flex', flexDirection: 'column', gap: '2px' },
  selectedTypeLabel: {
    margin: 0,
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  selectedTypeValue: {
    margin: 0,
    fontSize: '15px',
    color: '#0b3d6b',
    fontWeight: 700,
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: 600, color: '#333' },
  optional: { color: '#888', fontWeight: 400, fontStyle: 'italic' },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
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
  // Upload foto
  uploadBox: {
    position: 'relative',
  },
  fileInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: 0,
    overflow: 'hidden',
  },
  uploadLabel: {
    display: 'block',
    padding: '32px 20px',
    background: '#fafbfc',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease',
  },
  uploadIcon: { fontSize: '32px', marginBottom: '8px' },
  uploadText: {
    margin: '0 0 4px',
    color: '#0b3d6b',
    fontSize: '14px',
    fontWeight: 600,
  },
  uploadHint: { margin: 0, color: '#888', fontSize: '11px' },
  // Preview
  previewBox: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e5e5',
  },
  previewImg: {
    display: 'block',
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '6px 12px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'background 0.2s ease',
  },
  // GPS & peta
  gpsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap',
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
  gpsStatus: { fontSize: '12px', color: '#666', fontStyle: 'italic' },
  mapWrapper: {
    height: '400px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #ccc',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  map: { height: '100%', width: '100%' },
  coordInfo: { margin: '8px 0 0', fontSize: '13px', color: '#333' },
  coordHint: { fontSize: '11px', color: '#888', fontStyle: 'italic' },
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