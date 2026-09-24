-- ============================================================
-- SIMONIK - Data Seed Awal
-- File: 002_seed.sql
-- Deskripsi: Mengisi data awal untuk testing (user + petugas)
-- Password semua akun: rahasia123
--
-- CATATAN: Data infrastruktur simulasi TIDAK dimasukkan di sini.
-- Alasannya: sistem belum memiliki batas wilayah administratif,
-- sehingga data infrastruktur tanpa batas wilayah justru
-- membingungkan saat demo. Infrastruktur opsional untuk MVP.
-- ============================================================

-- ============================================================
-- 1. INSERT USERS
-- Hash bcrypt untuk password: rahasia123
--
-- Struktur ID yang akan terbentuk:
--   1 = User Demo (role: user)
--   2 = Petugas Jalan (role: petugas)
--   3 = Petugas Lampu (role: petugas)
--   4 = Petugas Drainase (role: petugas)
-- ============================================================

INSERT INTO users (name, email, password_hash, role) VALUES
  ('User Demo',       'user@simonik.test',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user'),
  ('Petugas Jalan',   'jalan@simonik.test',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petugas'),
  ('Petugas Lampu',   'lampu@simonik.test',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petugas'),
  ('Petugas Drainase','drainase@simonik.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petugas');

-- ============================================================
-- 2. INSERT PETUGAS_SCOPES
-- Menghubungkan petugas dengan scope-nya
-- Mengacu pada ID yang dihasilkan di INSERT di atas:
--   2 = Petugas Jalan      → scope 'jalan'
--   3 = Petugas Lampu      → scope 'lampu'
--   4 = Petugas Drainase   → scope 'drainase'
-- ============================================================

INSERT INTO petugas_scopes (user_id, scope) VALUES
  (2, 'jalan'),
  (3, 'lampu'),
  (4, 'drainase');

-- ============================================================
-- SELESAI
-- ============================================================