// ============================================================
// SIMONIK - Main Server
// File: src/server.js
// Deskripsi: Entry point aplikasi backend
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

// ============================================================
// MIDDLEWARE GLOBAL
// ============================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SIMONIK backend aktif!',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes → /api/auth/...
app.use('/api/auth', authRoutes);

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} tidak ditemukan`,
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[SERVER] Berjalan di http://localhost:${PORT}`);
});