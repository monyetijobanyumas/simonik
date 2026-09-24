// ============================================================
// SIMONIK - Report Type Page
// File: src/pages/user/ReportTypePage.jsx
// Deskripsi: Halaman pilih jenis infrastruktur (step 1)
// ============================================================

import { useNavigate, Link } from 'react-router-dom';

// Data jenis infrastruktur
const REPORT_TYPES = [
  {
    key: 'jalan',
    icon: '🛣️',
    label: 'Jalan',
    description: 'Jalan berlubang, retak, atau mengalami kerusakan.',
  },
  {
    key: 'lampu',
    icon: '💡',
    label: 'Lampu Penerangan Jalan',
    description: 'Lampu mati atau komponen penerangan mengalami kerusakan.',
  },
  {
    key: 'drainase',
    icon: '🚰',
    label: 'Drainase',
    description: 'Drainase tersumbat, rusak, atau mengalami masalah aliran.',
  },
];

export default function ReportTypePage() {
  const navigate = useNavigate();

  function handleSelect(scope) {
    navigate(`/user/create-report?scope=${scope}`);
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
        <h1 style={styles.title}>Pilih Jenis Infrastruktur</h1>
        <p style={styles.subtitle}>
          Tentukan kategori masalah yang ingin Anda laporkan
        </p>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          <div style={styles.stepDotActive} />
          <div style={styles.stepDot} />
          <span style={styles.stepLabel}>Tahap 1 dari 2</span>
        </div>
      </div>

      {/* Grid Jenis */}
      <div style={styles.grid}>
        {REPORT_TYPES.map((type) => (
          <button
            key={type.key}
            onClick={() => handleSelect(type.key)}
            style={styles.typeCard}
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
            <div style={styles.typeIcon}>{type.icon}</div>
            <h2 style={styles.typeTitle}>{type.label}</h2>
            <p style={styles.typeDesc}>{type.description}</p>
            <div style={styles.typeArrow}>Pilih →</div>
          </button>
        ))}
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
    marginBottom: '32px',
  },
  title: {
    margin: '0 0 6px',
    color: '#0b3d6b',
    fontSize: '24px',
  },
  subtitle: {
    margin: '0 0 16px',
    color: '#666',
    fontSize: '14px',
  },
  // Step indicator
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  stepDotActive: {
    width: '24px',
    height: '8px',
    borderRadius: '4px',
    background: '#0b3d6b',
  },
  stepDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#ddd',
  },
  stepLabel: {
    marginLeft: '10px',
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic',
  },
  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  typeCard: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  typeIcon: {
    fontSize: '48px',
  },
  typeTitle: {
    margin: 0,
    color: '#0b3d6b',
    fontSize: '17px',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  typeDesc: {
    margin: 0,
    color: '#666',
    fontSize: '13px',
    lineHeight: 1.5,
    flex: 1,
  },
  typeArrow: {
    marginTop: '8px',
    color: '#0b3d6b',
    fontSize: '13px',
    fontWeight: 700,
  },
};