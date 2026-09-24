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

/**
 * GET /api/reports/:id/history
 */
async function getReportHistory(req, res) {
  try {
    const { id } = req.params;

    // Validasi akses (pakai fungsi yang sudah ada)
    await reportsService.getReportById(id, req.user);

    // Ambil history
    const history = await reportsService.getReportHistory(id);

    return res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * PATCH /api/reports/:id/status
 * Update status laporan (petugas only)
 * Body: { status, note }
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Validasi input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status wajib diisi',
      });
    }

    // Hanya petugas yang bisa update status
    if (req.user.role !== 'petugas') {
      return res.status(403).json({
        success: false,
        message: 'Hanya petugas yang dapat mengubah status laporan',
      });
    }

    const report = await reportsService.updateReportStatus(
      id,
      status,
      note,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Status laporan berhasil diubah menjadi ${status}`,
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
 * POST /api/reports/:id/attachments
 * Upload foto (user atau petugas)
 * Multipart form-data, field: "file"
 */
async function uploadAttachment(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File wajib diunggah',
      });
    }

    // Validasi akses — pastikan user boleh akses laporan ini
    await reportsService.getReportById(id, req.user);

    // Tentukan tipe: kalau petugas upload → 'bukti', kalau user → 'laporan'
    const type = req.user.role === 'petugas' ? 'bukti' : 'laporan';

    // URL relatif yang disimpan di database
    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await reportsService.addAttachment({
      report_id: id,
      file_url: fileUrl,
      type,
      uploaded_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'File berhasil diunggah',
      data: { attachment },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/reports/:id/attachments
 */
async function getAttachments(req, res) {
  try {
    const { id } = req.params;

    // Validasi akses
    await reportsService.getReportById(id, req.user);

    const attachments = await reportsService.getAttachments(id);

    return res.status(200).json({
      success: true,
      data: { attachments, total: attachments.length },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createReport,
  getReports,
  getReportById,
  getReportHistory,
  updateStatus,
  uploadAttachment,
  getAttachments,
};