# LAPORAN KESELAMATAN SISTEM
## PENYERANGAN DAN UBASUAI TIDAK SAH LAMAN WEB WORDPRESS

---

**Tarikh Laporan:** 16 November 2025  
**Masa Laporan:** 17:34 +08  
**Laman Web:** mbikedah.com.my  
**Server:** xenon.sfdns.net  
**Status:** KRITIKAL - Tindakan Segera Diperlukan

---

## 1.0 RINGKASAN EKSEKUTIF

Laman web mbikedah.com.my telah diserang dan dicerobohi oleh pihak tidak bertanggungjawab. Analisis forensik menunjukkan aktiviti pencerobohan yang aktif bermula pada 2 November 2025 dengan puncak serangan pada 9-10 November 2025. Penceroboh telah berjaya:

1. Mencipta 3 file backdoor/malware baru
2. Mengubahsuai 3 file kritikal sistem
3. Memadam/mengosongkan 1 file plugin
4. Memasang cryptocurrency miner (Monero)
5. Menyembunyikan aktiviti menggunakan plugin malware sedia ada

**Kesan:** Sistem terjejas teruk dengan risiko data bocor, prestasi server merosot, dan reputasi laman web terancam.

---

## 2.0 KRONOLOGI SERANGAN

### 2.1 Fasa Persediaan (2-8 November 2025)

#### 2 November 2025, 15:13
- **Aktiviti:** File `wp-config.php` diubahsuai
- **Perubahan:** Debug mode diaktifkan
  - `WP_DEBUG = true`
  - `WP_DEBUG_LOG = true`
  - `WP_DEBUG_DISPLAY = false`
- **Tujuan:** Membolehkan penceroboh melihat error dan aktiviti sistem
- **Saiz File:** 3,227 bytes

#### 6 November 2025, 18:11
- **Aktiviti:** Plugin `wp-posts-cache-engine.php` diubahsuai
- **Perubahan:** Fungsi untuk menyembunyikan plugin dari senarai admin ditambah
- **Tujuan:** Menyembunyikan aktiviti penceroboh
- **Saiz File:** 2,116 bytes

#### 8 November 2025, 11:24
- **Aktiviti:** File `advanced-linkflow-control.php` dikosongkan
- **Perubahan:** Kandungan file dipadam (0 bytes)
- **Tujuan:** Menghapuskan plugin yang tidak diperlukan atau menyembunyikan aktiviti

### 2.2 Fasa Serangan Utama (9-10 November 2025)

#### 9 November 2025, 08:03
- **Aktiviti:** File backdoor dicipta
- **Lokasi:** `/wp-admin/js/bottom.1762646626.php`
- **Saiz:** 70 bytes
- **Identifier:** `uf12QTJk`
- **Jenis:** Backdoor PHP dalam folder JavaScript (tidak normal)
- **Risiko:** KRITIKAL - Akses terus ke sistem

#### 9 November 2025, 08:07 (4 minit kemudian)
- **Aktiviti:** File backdoor kedua dicipta
- **Lokasi:** `/wp-includes/Requests/custom-file-5-1762646839.php`
- **Saiz:** 70 bytes
- **Identifier:** `uf12QTJk` (sama dengan file pertama)
- **Jenis:** Custom file dalam wp-includes (tidak normal)
- **Risiko:** KRITIKAL - Akses terus ke sistem

#### 10 November 2025, 04:32
- **Aktiviti:** Plugin cryptocurrency miner dipasang
- **Lokasi:** `/wp-content/plugins/moneroocean-plugin/moneroocean-web-miner.php`
- **Saiz:** 3,365 bytes
- **Jenis:** Monero cryptocurrency miner
- **Wallet Address Hacker:** `49BACoxJZuqN2Xz4fUi87ffPabmBQtobGUJyWhnWLk8jQXZWBMJDghUABvwqkRcrpQeWvBHaWv1VY9RF2Yu7HvKjAtYLJVR`
- **Kesan:** Menggunakan CPU pengunjung untuk mining tanpa kebenaran
- **Saiz Folder:** 8.0K

#### 10 November 2025, 07:09
- **Aktiviti:** Theme functions diubahsuai
- **Lokasi:** `/wp-content/themes/finance-child/functions.php`
- **Saiz:** 24,210 bytes (peningkatan besar menunjukkan banyak kod ditambah)
- **Risiko:** Kod jahat mungkin disuntik ke dalam theme

---

## 3.0 MALWARE DAN FILE MENcurigakan YANG DITEMUI

### 3.1 File Backdoor Baru (November 2025)

| No | Lokasi File | Tarikh Dicipta | Saiz | Status |
|----|-------------|----------------|------|--------|
| 1 | `/wp-admin/js/bottom.1762646626.php` | 9 Nov 2025, 08:03 | 70 bytes | **AKTIF** |
| 2 | `/wp-includes/Requests/custom-file-5-1762646839.php` | 9 Nov 2025, 08:07 | 70 bytes | **AKTIF** |

**Kedua-dua file mengandungi identifier yang sama:** `uf12QTJk`

### 3.2 Plugin Malware Baru

| No | Plugin | Tarikh | Saiz Folder | Status |
|----|--------|--------|--------------|--------|
| 1 | `moneroocean-plugin` | 10 Nov 2025 | 8.0K | **AKTIF** |

**Fungsi:** Cryptocurrency miner yang menggunakan CPU pengunjung untuk mining Monero

### 3.3 Plugin Malware Sedia Ada

| No | Plugin | Tarikh Dicipta | Saiz Folder | Status |
|----|--------|----------------|--------------|--------|
| 1 | `emotional_haversack` | Feb 2020 | 84K | **AKTIF** |
| 2 | `blind-self-confidence` | Feb 2020 | 104K | **AKTIF** |

**Nota:** Plugin ini telah wujud sejak 2020 dan beberapa file telah dikosongkan pada tarikh berbeza (Sept 2024, April 2025), menunjukkan aktiviti berterusan.

### 3.4 File Lain yang Mencurigakan

| No | File | Tarikh | Saiz | Status |
|----|------|--------|------|--------|
| 1 | `/wp-sx-generator.php` | Aug 2024 | 0 bytes | Dikosongkan |
| 2 | `advanced-linkflow-control.php` | 8 Nov 2025 | 0 bytes | Dikosongkan |

---

## 4.0 ANALISIS KESAN DAN RISIKO

### 4.1 Kesan Terhadap Sistem

1. **Keselamatan Data**
   - Backdoor memberikan akses penuh kepada penceroboh
   - Risiko data pengguna bocor
   - Risiko kredensial dicuri

2. **Prestasi Server**
   - Cryptocurrency miner menggunakan sumber CPU
   - Server mungkin menjadi perlahan
   - Kos elektrik meningkat

3. **Reputasi Laman Web**
   - Pengunjung terjejas oleh mining tanpa kebenaran
   - Risiko disenarai hitam oleh search engine
   - Kepercayaan pengguna terjejas

4. **Keselamatan Pengunjung**
   - CPU pengunjung digunakan tanpa kebenaran
   - Peranti mungkin menjadi panas
   - Bateri peranti mudah habis

### 4.2 Risiko Berterusan

- Penceroboh masih mempunyai akses melalui backdoor
- Malware masih aktif dan berfungsi
- Risiko serangan lanjut masih tinggi
- Data masih terdedah kepada penceroboh

---

## 5.0 TINDAKAN YANG TELAH DIAMBIL

### 5.1 Analisis Forensik
- ✅ Menyemak semua log sistem
- ✅ Mengenal pasti semua file yang diubah
- ✅ Menganalisis kronologi serangan
- ✅ Mengenal pasti semua malware dan backdoor

### 5.2 Dokumentasi
- ✅ Mencatat semua aktiviti pencerobohan
- ✅ Mencatat semua file yang terjejas
- ✅ Menyediakan laporan lengkap

---

## 6.0 CADANGAN TINDAKAN SEGERA

### 6.1 Tindakan Segera (Dalam 24 Jam)

#### A. Padam File Backdoor
```bash
1. Padam: /wp-admin/js/bottom.1762646626.php
2. Padam: /wp-includes/Requests/custom-file-5-1762646839.php
```

#### B. Padam Plugin Malware
```bash
1. Padam folder: /wp-content/plugins/moneroocean-plugin/
2. Padam folder: /wp-content/plugins/emotional_haversack/
3. Padam folder: /wp-content/plugins/blind-self-confidence/
```

#### C. Pulihkan File yang Diubah
```bash
1. Pulihkan wp-config.php (matikan debug mode)
2. Semak dan pulihkan functions.php theme
3. Pulihkan atau padam advanced-linkflow-control.php
```

#### D. Tukar Semua Katalaluan
- ✅ WordPress Admin
- ✅ Database MySQL
- ✅ FTP/SSH
- ✅ cPanel
- ✅ Email accounts

### 6.2 Tindakan Jangka Pendek (Dalam 1 Minggu)

1. **Install Security Plugin**
   - Wordfence Security atau Sucuri Security
   - Aktifkan firewall
   - Aktifkan malware scanning
   - Aktifkan real-time monitoring

2. **Audit Keselamatan Lengkap**
   - Semak semua file PHP untuk kod mencurigakan
   - Semak semua plugin dan theme
   - Semak semua user accounts
   - Semak semua database entries

3. **Backup dan Pulihkan**
   - Buat backup penuh sebelum pembersihan
   - Pulihkan dari backup sebelum serangan (jika ada)
   - Pastikan backup bersih dari malware

4. **Update Sistem**
   - Update WordPress ke versi terkini
   - Update semua plugin
   - Update semua theme
   - Update PHP version jika perlu

### 6.3 Tindakan Jangka Panjang (Dalam 1 Bulan)

1. **Peningkatan Keselamatan**
   - Implementasi Two-Factor Authentication (2FA)
   - Limit login attempts
   - Disable XML-RPC
   - Change default file permissions
   - Implementasi Web Application Firewall (WAF)

2. **Monitoring Berterusan**
   - Setup automated security scanning
   - Setup file integrity monitoring
   - Setup log monitoring
   - Setup alert system

3. **Latihan dan Kesedaran**
   - Latihan keselamatan untuk staff
   - Best practices untuk password
   - Kesedaran tentang phishing dan social engineering

---

## 7.0 KOS DAN IMPAK KEWANGAN

### 7.1 Kos Langsung
- Masa untuk pembersihan dan pemulihan: **Dianggarkan 8-16 jam**
- Kos security plugin premium: **RM200-500/tahun**
- Kos backup service: **RM100-300/tahun**

### 7.2 Kos Tidak Langsung
- Kehilangan trafik pengunjung: **Tidak dapat diukur**
- Kehilangan kepercayaan pengguna: **Tidak dapat diukur**
- Risiko denda jika data pengguna bocor: **Tinggi**

---

## 8.0 KESIMPULAN

Laman web mbikedah.com.my telah diserang dengan serius oleh pihak tidak bertanggungjawab. Penceroboh telah berjaya memasang backdoor, malware, dan cryptocurrency miner. Tindakan segera diperlukan untuk membersihkan sistem dan mencegah serangan lanjut.

**Status Semasa:** KRITIKAL  
**Tindakan:** SEGERA - Pembersihan dan pemulihan perlu dilakukan dalam 24 jam

---

## 9.0 LAMPIRAN

### 9.1 Senarai File yang Terjejas

**File Backdoor:**
1. `/wp-admin/js/bottom.1762646626.php` (70 bytes, 9 Nov 2025, 08:03)
2. `/wp-includes/Requests/custom-file-5-1762646839.php` (70 bytes, 9 Nov 2025, 08:07)

**Plugin Malware:**
1. `/wp-content/plugins/moneroocean-plugin/` (8.0K, 10 Nov 2025)
2. `/wp-content/plugins/emotional_haversack/` (84K, Feb 2020)
3. `/wp-content/plugins/blind-self-confidence/` (104K, Feb 2020)

**File yang Diubah:**
1. `/wp-config.php` (3,227 bytes, 2 Nov 2025, 15:13)
2. `/wp-content/plugins/wp-posts-cache-engine/wp-posts-cache-engine.php` (2,116 bytes, 6 Nov 2025, 18:11)
3. `/wp-content/themes/finance-child/functions.php` (24,210 bytes, 10 Nov 2025, 07:09)

**File yang Dikosongkan:**
1. `/wp-content/plugins/advanced-linkflow-control/advanced-linkflow-control.php` (0 bytes, 8 Nov 2025, 11:24)
2. `/wp-sx-generator.php` (0 bytes, Aug 2024)

### 9.2 Wallet Address Cryptocurrency Miner
```
49BACoxJZuqN2Xz4fUi87ffPabmBQtobGUJyWhnWLk8jQXZWBMJDghUABvwqkRcrpQeWvBHaWv1VY9RF2Yu7HvKjAtYLJVR
```

### 9.3 Identifier Malware
```
uf12QTJk
```

---

**Disiapkan oleh:** Sistem Analisis Keselamatan  
**Tarikh:** 16 November 2025  
**Masa:** 17:34 +08  
**Status:** Laporan Siap untuk Tindakan

---

*Laporan ini adalah dokumen sulit dan hanya untuk kegunaan pihak pengurusan sahaja.*

