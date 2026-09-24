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

/**
 * Ambil riwayat status laporan
 */
async function getReportHistory(reportId) {
  const query = `
    SELECT 
      rsh.id,
      rsh.status,
      rsh.note,
      rsh.changed_at,
      u.name AS changed_by_name,
      u.role AS changed_by_role
    FROM report_status_history rsh
    LEFT JOIN users u ON u.id = rsh.changed_by
    WHERE rsh.report_id = $1
    ORDER BY rsh.changed_at ASC
  `;

  const result = await db.query(query, [reportId]);
  return result.rows;
}

// ============================================================
// VALIDASI TRANSISI STATUS
// ============================================================

/**
 * Cek apakah transisi status valid
 * @param {string} fromStatus - Status saat ini
 * @param {string} toStatus - Status tujuan
 * @returns {boolean}
 */
function isValidTransition(fromStatus, toStatus) {
  const transitions = {
    DIAJUKAN: ['DIVERIFIKASI', 'DITOLAK'],
    DIVERIFIKASI: ['DIPROSES'],
    DIPROSES: ['SELESAI'],
    SELESAI: [],
    DITOLAK: [],
  };

  return transitions[fromStatus]?.includes(toStatus) || false;
}

// ============================================================
// UPDATE STATUS LAPORAN
// ============================================================

/**
 * Update status laporan oleh petugas
 * @param {number} reportId - ID laporan
 * @param {string} newStatus - Status baru
 * @param {string} note - Catatan (opsional)
 * @param {object} user - User dari token (petugas)
 * @returns {object} - Laporan yang sudah diupdate
 */
async function updateReportStatus(reportId, newStatus, note, user) {
  // 1. Cek laporan ada & akses
  const report = await getReportById(reportId, user);

  // 2. Validasi transisi status
  if (!isValidTransition(report.status, newStatus)) {
    throw new Error(
      `Status tidak valid: ${report.status} → ${newStatus}`
    );
  }

  // 3. Update status laporan
  const updateQuery = `
    UPDATE reports 
    SET status = $1, updated_at = NOW() 
    WHERE id = $2 
    RETURNING id, status, updated_at
  `;
  await db.query(updateQuery, [newStatus, reportId]);

  // 4. Catat history
  await db.query(
    `INSERT INTO report_status_history (report_id, status, note, changed_by, changed_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [reportId, newStatus, note || null, user.id]
  );

  // 5. Ambil laporan terbaru
  const updated = await getReportById(reportId, user);
  return updated;
}

// ============================================================
// ATTACHMENTS — Foto/Bukti
// ============================================================

/**
 * Simpan metadata attachment ke database
 */
async function addAttachment({ report_id, file_url, type, uploaded_by }) {
  const query = `
    INSERT INTO report_attachments (report_id, file_url, type, uploaded_by, uploaded_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, report_id, file_url, type, uploaded_by, uploaded_at
  `;

  const result = await db.query(query, [report_id, file_url, type, uploaded_by]);
  return result.rows[0];
}

/**
 * Ambil semua attachment untuk laporan
 */
async function getAttachments(reportId) {
  const query = `
    SELECT 
      ra.id,
      ra.report_id,
      ra.file_url,
      ra.type,
      ra.uploaded_at,
      u.name AS uploaded_by_name,
      u.role AS uploaded_by_role
    FROM report_attachments ra
    LEFT JOIN users u ON u.id = ra.uploaded_by
    WHERE ra.report_id = $1
    ORDER BY ra.uploaded_at ASC
  `;

  const result = await db.query(query, [reportId]);
  return result.rows;
}

module.exports = {
  createReport,
  getReports,
  getReportById,
  getReportHistory,
  updateReportStatus,
  isValidTransition,
  addAttachment,
  getAttachments,
};