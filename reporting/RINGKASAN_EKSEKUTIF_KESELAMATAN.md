# RINGKASAN EKSEKUTIF
## PENYERANGAN WORDPRESS - MBIKEDAH.COM.MY

**Tarikh:** 16 November 2025  
**Status:** KRITIKAL

---

## MASALAH UTAMA

Laman web telah dicerobohi dengan:
- ✅ 2 file backdoor aktif
- ✅ 3 plugin malware aktif
- ✅ Cryptocurrency miner menggunakan CPU pengunjung
- ✅ File kritikal diubahsuai

---

## TINDAKAN SEGERA (24 JAM)

1. **Padam File Backdoor:**
   - `/wp-admin/js/bottom.1762646626.php`
   - `/wp-includes/Requests/custom-file-5-1762646839.php`

2. **Padam Plugin Malware:**
   - `/wp-content/plugins/moneroocean-plugin/`
   - `/wp-content/plugins/emotional_haversack/`
   - `/wp-content/plugins/blind-self-confidence/`

3. **Tukar Semua Katalaluan:**
   - WordPress Admin
   - Database
   - FTP/SSH
   - cPanel

4. **Install Security Plugin:**
   - Wordfence atau Sucuri
   - Aktifkan firewall

---

## KRONOLOGI SERANGAN

- **2 Nov:** wp-config.php diubah (debug diaktifkan)
- **6 Nov:** Plugin cache diubah
- **8 Nov:** Plugin dikosongkan
- **9 Nov:** 2 backdoor dicipta (08:03 & 08:07)
- **10 Nov:** Cryptocurrency miner dipasang (04:32)
- **10 Nov:** Theme functions diubah (07:09)

---

## KESAN

- ⚠️ Akses penuh penceroboh ke sistem
- ⚠️ CPU pengunjung digunakan tanpa kebenaran
- ⚠️ Risiko data bocor
- ⚠️ Prestasi server terjejas

---

**Rujuk laporan lengkap:** `LAPORAN_KESELAMATAN_WORDPRESS_MBIKEDAH.md`

