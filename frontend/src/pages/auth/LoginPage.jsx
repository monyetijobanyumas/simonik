// ============================================================
// SIMONIK - Login Page
// File: src/pages/auth/LoginPage.jsx
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function validateForm() {
    if (!email.trim()) {
      setError('Email tidak boleh kosong.');
      return false;
    }
    if (!email.includes('@')) {
      setError('Format email tidak valid. Harus mengandung "@".');
      return false;
    }
    if (!password.trim()) {
      setError('Password tidak boleh kosong.');
      return false;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'petugas') {
        navigate('/petugas/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login gagal. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="animate-card">
        <h1 style={styles.title} className="animate-title">
          SIMONIK
        </h1>

        <p style={styles.subtitle} className="animate-subtitle">
          Sistem Informasi Monitoring
          <br />
          dan Pengaduan Infrastruktur Kawasan
        </p>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
          className="animate-form"
          noValidate
        >
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = '#0b3d6b')}
              onBlur={(e) => (e.target.style.borderColor = '#ccc')}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = '#0b3d6b')}
              onBlur={(e) => (e.target.style.borderColor = '#ccc')}
            />
          </div>

          {error && (
            <div style={styles.error} className="animate-error">
              <span style={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
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
            {loading ? 'Memuat...' : 'Login'}
          </button>
        </form>

        <div style={styles.hint} className="animate-hint">
          <strong>Akun Demo:</strong>
          <br />User: user@simonik.test / rahasia123
          <br />Petugas Jalan: jalan@simonik.test / rahasia123
          <br />Petugas Lampu: lampu@simonik.test / rahasia123
          <br />Petugas Drainase: drainase@simonik.test / rahasia123
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 15s ease infinite',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '440px',
  },
  title: {
    margin: 0,
    textAlign: 'center',
    color: '#0b3d6b',
    fontSize: '28px',
    letterSpacing: '2px',
    fontWeight: 700,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: '8px',
    marginBottom: '32px',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 600,
    background: '#0b3d6b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.5px',
    transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    background: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  errorIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    minWidth: '20px',
    background: '#c0392b',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '13px',
    fontWeight: 700,
  },
  hint: {
    marginTop: '24px',
    padding: '12px',
    background: '#f0f7ff',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#333',
    lineHeight: 1.7,
    borderLeft: '3px solid #0b3d6b',
  },
};