# SIMONIK

**Sistem Informasi Monitoring dan Pengaduan Infrastruktur Kawasan**

Aplikasi berbasis web untuk menerima pengaduan masyarakat mengenai masalah infrastruktur publik berbasis lokasi, dengan fitur verifikasi, penanganan oleh petugas per-scope, dan monitoring status laporan.

---

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Arsitektur](#arsitektur)
- [Teknologi](#teknologi)
- [Cara Menjalankan](#cara-menjalankan)
- [Struktur Database](#struktur-database)
- [Akun Demo](#akun-demo)
- [API Endpoints](#api-endpoints)
- [Struktur Proyek](#struktur-proyek)
- [Skenario Demo](#skenario-demo)
- [Pengembangan Lanjutan](#pengembangan-lanjutan)

---

## ✨ Fitur Utama

### Role User (Masyarakat)

- Login dengan akun yang disediakan
- **Dashboard dengan 4 menu**: Buat Laporan, Laporan Saya, Peta Laporan, Statistik
- **Buat laporan 2 tahap**:
  - Tahap 1: Pilih jenis infrastruktur (Jalan / Lampu Penerangan / Drainase)
  - Tahap 2: Isi detail + upload foto (maksimal 3 foto)
- **GPS otomatis** dari browser + koreksi marker di peta
- **Tracking status** laporan dengan timeline
- **Lihat persebaran laporan** di peta interaktif dengan legend berwarna
- **Statistik** laporan pribadi (chart per status, per jenis, tren 7 hari)

### Role Petugas

- Login dengan **scope terbatas** (hanya lihat laporan sesuai jenis infrastruktur yang ditugaskan)
- **Dashboard dengan summary cards** (total + 5 status clickable filter)
- **Detail laporan** dengan timeline lengkap
- **Update status laporan**:
  - Verifikasi (DIAJUKAN → DIVERIFIKASI)
  - Tolak dengan alasan (DIAJUKAN → DITOLAK)
  - Mulai proses (DIVERIFIKASI → DIPROSES)
  - Selesaikan (DIPROSES → SELESAI)
- **Upload bukti penyelesaian** (foto kondisi setelah diperbaiki, maksimal 3)
- **Peta persebaran** laporan sesuai scope
- **Statistik** laporan scope

### Fitur Umum

- Autentikasi JWT dengan role-based access control
- Validasi transisi status (tidak bisa "loncat" status)
- Upload foto dengan validasi (JPG/PNG/WEBP, maks 5MB)
- Peta interaktif dengan Leaflet + OpenStreetMap
- Batasan maksimal 3 foto per jenis (laporan/bukti)
- Timeline riwayat status lengkap

---

## 🏗️ Arsitektur
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Browser │────▶│ Backend │────▶│ PostgreSQL │
│ (React SPA) │◀────│ (Express) │◀────│ + PostGIS │
└──────────────┘ └──────────────┘ └──────────────┘
│ │ │
Leaflet peta REST API Data laporan +
Chart.js JWT auth koordinat GPS


---

## 🛠️ Teknologi

### Backend

- **Node.js** + **Express** — server & REST API
- **PostgreSQL** + **PostGIS** — database + geospatial
- **bcryptjs** — hash password
- **jsonwebtoken** — autentikasi JWT
- **multer** — upload file
- **pg** — driver PostgreSQL

### Frontend

- **React** + **Vite** — framework UI
- **React Router** — routing
- **Axios** — HTTP client
- **Leaflet** + **React Leaflet** — peta interaktif
- **Chart.js** + **react-chartjs-2** — grafik statistik

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js 18+
- PostgreSQL 16+ dengan PostGIS
- Git

### 1. Clone Repository

```bash
git clone https://github.com/monyetijobanyumas/simonik.git
cd simonik