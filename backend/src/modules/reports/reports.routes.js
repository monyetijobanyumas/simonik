// ============================================================
// SIMONIK - Reports Routes
// File: src/modules/reports/reports.routes.js
// ============================================================

const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const authMiddleware = require('../../middlewares/auth');

// Semua endpoint di bawah butuh login
router.use(authMiddleware);

// POST /api/reports → buat laporan baru
router.post('/', reportsController.createReport);

// GET /api/reports → list laporan
router.get('/', reportsController.getReports);

// GET /api/reports/:id → detail laporan
router.get('/:id', reportsController.getReportById);

module.exports = router;