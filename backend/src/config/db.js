// ============================================================
// SIMONIK - Konfigurasi Koneksi Database
// File: src/config/db.js
// Deskripsi: Membuat connection pool ke PostgreSQL
// ============================================================

const { Pool } = require('pg');

// Buat connection pool
// Pool = kumpulan koneksi yang dipakai berulang-ulang
// Lebih efisien daripada buka-tutup koneksi tiap request
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Event listener: kalau koneksi berhasil
pool.on('connect', () => {
  console.log('[DB] Terhubung ke PostgreSQL');
});

// Event listener: kalau ada error
pool.on('error', (err) => {
  console.error('[DB] Error pada client:', err.message);
});

// Export fungsi query untuk dipakai di file lain
module.exports = {
  // Query biasa (SELECT, INSERT, UPDATE, DELETE)
  query: (text, params) => pool.query(text, params),

  // Ambil satu koneksi dari pool (untuk transaction)
  getClient: () => pool.connect(),

  // Pool itu sendiri (kalau butuh akses langsung)
  pool,
};