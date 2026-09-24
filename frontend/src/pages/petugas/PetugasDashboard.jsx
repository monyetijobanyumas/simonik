import { useAuth } from '../../contexts/AuthContext';

export default function PetugasDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>Dashboard Petugas</h1>
      <p>Selamat datang, <strong>{user?.name}</strong>!</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p>Scope: {user?.scopes?.join(', ')}</p>
      <button
        onClick={logout}
        style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
}