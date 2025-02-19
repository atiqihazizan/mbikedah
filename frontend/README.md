# MBI Click Pro - Frontend

Sistem pengurusan pentadbiran MBI yang komprehensif dan mesra pengguna.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MBI-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## 📋 Kandungan
- [Keperluan Sistem](#-keperluan-sistem)
- [Pemasangan](#-pemasangan)
- [Memulakan Aplikasi](#️-memulakan-aplikasi)
- [Struktur Projek](#️-struktur-projek)
- [Modul-modul Utama](#️-modul-modul-utama)
- [Keselamatan](#-keselamatan)
- [Aliran Kerja](#-aliran-kerja)
- [Reka Bentuk Responsif](#-reka-bentuk-responsif)
- [Penyelenggaraan](#-penyelenggaraan)
- [Dokumentasi API](#-dokumentasi-api)
- [Menyumbang](#-menyumbang)
- [Sokongan](#-sokongan)

## 🌟 Pengenalan

MBI Click Pro adalah sistem pengurusan pentadbiran digital yang dibangunkan khas untuk Majlis Bandaraya Ipoh. Sistem ini bertujuan untuk:

- Memudahkan pengurusan pembayaran dan kewangan
- Mendigitalkan proses pentadbiran
- Meningkatkan kecekapan operasi
- Menyediakan analisis dan laporan terperinci
- Memantau prestasi perkhidmatan

### Kumpulan Sasaran
- Kakitangan MBI
- Pentadbir Sistem
- Pegawai Kewangan
- Pegawai Pentadbiran
- Pengurus Bahagian

## 🎯 Ciri-ciri Utama

- Antara muka yang mesra pengguna
- Sistem pengurusan pembayaran yang lengkap
- Pengurusan dokumen dan surat-menyurat
- Pengurusan maklumat penduduk
- Pengurusan tabung dan kutipan
- Pengurusan jenazah
- Penjanaan laporan komprehensif
- Sistem keselamatan yang kukuh

## 💻 Teknologi Yang Digunakan

### Frontend
- React 18
- Vite
- TailwindCSS
- Headless UI
- React Router DOM
- Axios
- React Icons
- UUID

### State Management
- React Context API
- Custom Hooks

### Styling
- TailwindCSS
- CSS Modules
- PostCSS
- Autoprefixer

### Testing
- Vitest
- React Testing Library
- Cypress (E2E)

### Code Quality
- ESLint
- Prettier
- Husky
- lint-staged

## 🚀 Keperluan Sistem

### Keperluan Minimum
- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- Sambungan internet untuk API calls
- Browser moden (Chrome, Firefox, Safari, Edge)
- Resolusi skrin minimum 1024x768
- RAM minimum 4GB untuk pembangunan

### Keperluan Yang Disyorkan
- Node.js v20
- RAM 8GB
- Resolusi skrin 1920x1080
- SSD untuk pembangunan
- Sambungan internet berkelajuan tinggi

## 🌐 Persekitaran

### Development
```env
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=MBI Click Pro
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK=true
VITE_ENABLE_DEBUG=true
```

### Staging
```env
NODE_ENV=staging
VITE_API_BASE_URL=https://staging-api.mbi.gov.my
VITE_APP_NAME=MBI Click Pro
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEBUG=true
```

### Production
```env
NODE_ENV=production
VITE_API_BASE_URL=https://api.mbi.gov.my
VITE_APP_NAME=MBI Click Pro
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEBUG=false
```

## 📦 Pemasangan

### Menggunakan npm

1. Klon repositori:
   ```bash
   git clone https://github.com/atiqihazizan/mbikedah.git
   cd app/frontend
   ```

2. Pasang dependencies:
   ```bash
   npm install
   ```

3. Salin fail .env:
   ```bash
   cp .env.example .env
   ```

4. Kemaskini konfigurasi dalam fail .env

### Menggunakan Docker

1. Bina imej:
   ```bash
   docker build -t mbi-frontend .
   ```

2. Jalankan kontainer:
   ```bash
   docker run -p 3000:3000 mbi-frontend
   ```

## 🏃‍♂️ Memulakan Aplikasi

### Mod Pembangunan
```bash
# Menggunakan npm
npm run dev

# Menggunakan yarn
yarn dev

# Port tertentu
npm run dev -- --port=3001
```

### Mod Pengeluaran
```bash
# Bina aplikasi
npm run build

# Pratonton build
npm run preview
```

### Mod Debug
```bash
# Dengan debug logs
DEBUG=app:* npm run dev

# Dengan debug tools
npm run dev:debug
```

## 📱 Panduan Pengguna

### Log Masuk
1. Buka aplikasi di browser
2. Masukkan ID Pengguna
3. Masukkan Kata Laluan
4. Klik butang "Log Masuk"

### Menu Utama
- Dashboard: Paparan utama dengan ringkasan
- Pembayaran: Urus pembayaran dan bil
- Tabung: Urus kutipan dan sumbangan
- Jenazah: Urus pendaftaran jenazah
- Surat: Urus surat dan dokumen
- Penduduk: Urus maklumat penduduk

### Pengurusan Pembayaran
1. Pilih "Pembayaran" dari menu
2. Pilih jenis pembayaran
3. Isi maklumat yang diperlukan
4. Semak dan sahkan pembayaran
5. Jana dan cetak resit

### Penjanaan Laporan
1. Pilih menu "Laporan"
2. Pilih jenis laporan
3. Tetapkan tempoh
4. Klik "Jana Laporan"
5. Muat turun atau cetak

## 🔧 Penyelenggaraan

### Pembersihan Sistem
```bash
# Bersihkan cache
npm run clean

# Bersihkan node_modules
npm run clean:all

# Bersihkan build
npm run clean:build
```

### Semakan Kod
```bash
# Semak syntax
npm run lint

# Semak dan betulkan
npm run lint:fix

# Semak format
npm run format
```

### Ujian
```bash
# Ujian unit
npm run test

# Ujian dengan coverage
npm run test:coverage

# Ujian E2E
npm run test:e2e

# Ujian dalam mod watch
npm run test:watch
```

## 📈 Pemantauan

### Metrik Prestasi
- Masa muatan halaman
- Penggunaan CPU/Memory
- Kadar ralat
- Masa respons API
- Penggunaan cache

### Log Sistem
- Ralat aplikasi
- Ralat rangkaian
- Ralat pengesahan
- Ralat sistem
- Amaran sistem

## 🔒 Keselamatan

### Amalan Terbaik
- Gunakan HTTPS
- Encrypt data sensitif
- Validate semua input
- Sanitize output
- Guna prepared statements
- Implement rate limiting
- Monitor aktiviti mencurigakan

### Pengendalian Ralat
- Log semua ralat
- Notifikasi untuk ralat kritikal
- Fallback untuk kegagalan
- Backup automatik
- Pemulihan sistem

## 📚 Dokumentasi

### Dokumentasi Teknikal
- [Panduan Arkitektur](/docs/architecture.md)
- [Panduan API](/docs/api.md)
- [Panduan Keselamatan](/docs/security.md)
- [Panduan Pembangunan](/docs/development.md)

### Dokumentasi Pengguna
- [Manual Pengguna](/docs/user-manual.pdf)
- [Panduan Pemasangan](/docs/installation.md)
- [FAQ](/docs/faq.md)
- [Troubleshooting](/docs/troubleshooting.md)

## 📞 Sokongan

### Sokongan Teknikal
- Email: support@mbi.gov.my
- Tel: +604-xxx xxxx
- Waktu: 9 PG - 5 PTG (Isnin-Jumaat)

### Kecemasan
- Hotline: +6012-xxx xxxx (24/7)
- WhatsApp: +6012-xxx xxxx
- Telegram: @mbisupport

### Sistem Tiket
- Portal: http://support.mbi.gov.my
- Email: helpdesk@mbi.gov.my
- Response Time: < 24 jam

## 📅 Penyelenggaraan Berjadual

### Waktu Penyelenggaraan
- Setiap Ahad: 12 AM - 4 AM
- Setiap bulan: Hari Ahad pertama
- Kemas kini besar: Dimaklumkan 1 minggu awal

### Backup
- Harian: 12 AM
- Mingguan: Ahad 12 AM
- Bulanan: Hari pertama bulan

## 📝 Lesen

Hak Cipta  2024 MBI Click Pro
Sistem ini dilindungi dan dilesenkan di bawah MBI.

---

Dibangunkan dengan  oleh Pasukan Pembangunan MBI
