// ============================================================
// SIMONIK - Reports Service
// File: src/modules/reports/reports.service.js
// Deskripsi: Logika bisnis untuk pengaduan infrastruktur
// ============================================================

const db = require('../../config/db');

/**
 * Buat laporan baru
 * @param {object} data - { user_id, scope, title, description, latitude, longitude }
 * @returns {object} - Laporan yang baru dibuat
 */
async function createReport({ user_id, scope, title, description, latitude, longitude }) {
  // Validasi scope
  const validScopes = ['jalan', 'lampu', 'drainase'];
  if (!validScopes.includes(scope)) {
    throw new Error('Jenis infrastruktur tidak valid');
  }

  // Insert laporan + simpan koordinat sebagai PostGIS geography
  const query = `
    INSERT INTO reports (user_id, scope, title, description, status, location, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'DIAJUKAN', ST_GeogFromText($5), NOW(), NOW())
    RETURNING id, user_id, scope, title, description, status,
              ST_Y(location::geometry) AS latitude,
              ST_X(location::geometry) AS longitude,
              created_at, updated_at
  `;

  const pointWKT = `SRID=4326;POINT(${longitude} ${latitude})`;
  const values = [user_id, scope, title, description, pointWKT];

  const result = await db.query(query, values);
  const report = result.rows[0];

  // Catat riwayat status awal: DIAJUKAN
  await db.query(
    `INSERT INTO report_status_history (report_id, status, note, changed_by, changed_at)
     VALUES ($1, 'DIAJUKAN', 'Laporan dibuat oleh user', $2, NOW())`,
    [report.id, user_id]
  );

  return report;
}

/**
 * Ambil daftar laporan sesuai role
 * - user: hanya laporan miliknya sendiri
 * - petugas: hanya laporan dengan scope yang dimilikinya
 */
async function getReports(user) {
  let query;
  let values;

  if (user.role === 'petugas') {
    // Ambil scope dari token JWT (sudah diisi di auth.service)
    query = `
      SELECT r.id, r.user_id, r.scope, r.title, r.description, r.status,
             ST_Y(r.location::geometry) AS latitude,
             ST_X(r.location::geometry) AS longitude,
             r.created_at, r.updated_at,
             u.name AS user_name, u.email AS user_email
      FROM reports r
      JOIN users u ON u.id = r.user_id
      WHERE r.scope = ANY($1::scope_type[])
      ORDER BY r.created_at DESC
    `;
    values = [user.scopes];
  } else {
    // User: hanya lihat laporan sendiri
    query = `
      SELECT r.id, r.user_id, r.scope, r.title, r.description, r.status,
             ST_Y(r.location::geometry) AS latitude,
             ST_X(r.location::geometry) AS longitude,
             r.created_at, r.updated_at
      FROM reports r
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    values = [user.id];
  }

  const result = await db.query(query, values);
  return result.rows;
}

/**
 * Ambil detail laporan berdasarkan ID (dengan validasi akses)
 */
async function getReportById(id, user) {
  const query = `
    SELECT r.id, r.user_id, r.scope, r.title, r.description, r.status,
           ST_Y(r.location::geometry) AS latitude,
           ST_X(r.location::geometry) AS longitude,
           r.created_at, r.updated_at,
           u.name AS user_name, u.email AS user_email
    FROM reports r
    JOIN users u ON u.id = r.user_id
    WHERE r.id = $1
  `;

  const result = await db.query(query, [id]);

  if (result.rows.length === 0) {
    throw new Error('Laporan tidak ditemukan');
  }

  const report = result.rows[0];

  // Validasi akses
  if (user.role === 'user' && report.user_id !== user.id) {
    throw new Error('Anda tidak berhak mengakses laporan ini');
  }

  if (user.role === 'petugas' && !user.scopes.includes(report.scope)) {
    throw new Error('Laporan ini di luar scope Anda');
  }

  return report;
}

module.exports = { createReport, getReports, getReportById };