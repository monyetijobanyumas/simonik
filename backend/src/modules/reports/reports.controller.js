// ============================================================
// SIMONIK - Reports Controller
// File: src/modules/reports/reports.controller.js
// Deskripsi: Handler HTTP request untuk pengaduan
// ============================================================

const reportsService = require('./reports.service');

/**
 * POST /api/reports
 * Body: { scope, title, description, latitude, longitude }
 * Akses: user (yang login)
 */
async function createReport(req, res) {
  try {
    const { scope, title, description, latitude, longitude } = req.body;
    const user_id = req.user.id; // dari middleware auth

    // Validasi input wajib
    if (!scope || !title || !description || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Jenis infrastruktur, judul, deskripsi, dan lokasi wajib diisi',
      });
    }

    const report = await reportsService.createReport({
      user_id,
      scope,
      title,
      description,
      latitude,
      longitude,
    });

    return res.status(201).json({
      success: true,
      message: 'Laporan berhasil dikirim',
      data: { report },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/reports
 * Ambil list laporan sesuai role user yang login
 */
async function getReports(req, res) {
  try {
    const reports = await reportsService.getReports(req.user);

    return res.status(200).json({
      success: true,
      data: { reports, total: reports.length },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/reports/:id
 */
async function getReportById(req, res) {
  try {
    const { id } = req.params;
    const report = await reportsService.getReportById(id, req.user);

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { createReport, getReports, getReportById };