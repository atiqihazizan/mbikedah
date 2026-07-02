# Roadmap Milestone 2 — MBIClicks

**Bermula selepas**: RC1 APPROVED (2026-07-02)
**Fokus**: Feature Development — nilai kepada pengguna
**Architecture**: v1.2 RC1 Frozen — tidak diubah tanpa ADR

---

## Prinsip Milestone 2

1. **Architecture tidak disentuh** — ADR-021 hingga ADR-031 kekal
2. **Feature baharu sahaja** — bukan refactor architecture
3. **Setiap sprint mesti lulus RC sebelum merge** (proses sama seperti RC1)
4. **Guardian review wajib** sebelum sebarang perubahan pattern

---

## Feature Backlog

### P1 — High Priority

#### 📄 PDF / Print
- Cetak permohonan billing sebagai PDF (untuk arkib dan pengesahan)
- Laporan kewangan boleh dieksport sebagai PDF/Excel
- Guna library: `@react-pdf/renderer` atau `jsPDF`

#### 🔔 Real Notification
- Notifikasi dalam aplikasi apabila status permohonan berubah
- Approver terima notifikasi bila ada permohonan baru untuk diluluskan
- Guna: Polling `/notifications` setiap 30s atau Server-Sent Events
- UI: Panel notifikasi di Topbar (stub sudah ada di `HomeLayout.jsx`)

#### 🔍 Global Search
- Cari permohonan mengikut refNo, nama pemohon, vendor, atau amaun
- Backend: `GET /billings/search?q=...`
- Frontend: SearchBar dalam Topbar → Modal hasil carian

### P2 — Medium Priority

#### 📊 Laporan Lanjutan
- Laporan perbelanjaan per jabatan per bulan
- Graf trend permohonan
- Export ke Excel
- Dashboard Finance: summary kewangan real-time

#### 📱 Mobile Responsiveness
- Semak semua halaman pada viewport 375px
- Table → Card view pada mobile
- Bottom navigation untuk mobile (gantikan sidebar)
- Touch-friendly action buttons

#### ⚡ Performance
- TD-004: Bundle splitting — lazy load Laporan, Bajet, Tetapan
- Image optimization untuk lampiran
- Pagination yang lebih pantas (cursor-based)

### P3 — Future

#### 🧾 Audit Trail
- Log semua tindakan pengguna (siapa buat apa, bila)
- `/activity-logs` sudah ada di backend — bina UI
- Export audit log sebagai CSV

#### 📈 Analytics Dashboard
- Berapa lama purata permohonan untuk diluluskan per peringkat
- Bottleneck analysis (siapa paling lambat approve)
- Finance: amaun dibayar per bulan vs budget

#### 🔗 AutoCount Integration (Fasa 2)
- Sync data bayaran ke AutoCount secara automatik
- `/api/autocount` sudah ada — bina sync flow
- Alert bila sync gagal

---

## Sprint 6 — Dicadangkan

**Tajuk**: Sidebar + Navigation

**Skop**:
- Sidebar navigation yang collapsible
- Breadcrumb pada semua halaman
- Tab navigation dalam Permohonan (Aktif / Sejarah)
- Notification badge pada sidebar

**Kenapa dahulu**: Navigation yang baik menjadi asas untuk semua feature P1.

---

## Sprint 7 — Dicadangkan

**Tajuk**: Notification + Real-time

**Skop**:
- Notification system (polling atau SSE)
- Email notification (bila permohonan dihantar kepada approver)
- Badge count di Topbar
- Notification preferences per user

---

## Technical Debt yang Perlu Diselesaikan dalam Milestone 2

| TD | Target Sprint |
|----|---------------|
| TD-003 — Authorization consolidation | Sprint 8 |
| TD-004 — Bundle splitting | Sprint 6 (bersama Sidebar) |
| TD-005 — TaskCard cleanup | Sprint 6 |
| TD-006 — Legacy /api/dashboard | Sprint 6 |
| TD-007 — PermohonanDetail form queries | Sprint 7 |

---

## Definition of Done (Milestone 2)

Setiap feature dianggap selesai bila:
1. Berfungsi dalam environment production
2. Lulus UX audit (3 soalan × 5 role)
3. Tiada regression dalam endpoint shapes
4. Bundle size tidak melebihi 1MB (gzip < 300kB)
5. Mobile responsive pada 375px viewport
