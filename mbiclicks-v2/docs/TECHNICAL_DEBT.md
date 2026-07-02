# Technical Debt Register — MBIClicks

**Terakhir dikemaskini**: 2026-07-02 (RC1)

Dokumen ini menjejak semua technical debt yang diterima secara sedar. Setiap item mempunyai justifikasi mengapa ia tidak dibaiki sekarang dan target milestone untuk diselesaikan.

---

## TD-003 — Authorization Policy Duplication

**Status**: RC2
**Keutamaan**: Medium

**Masalah**: Logik authorization tersebar di tiga tempat:
1. Route middleware (`requireRole(...)`)
2. Controller (semakan dalam fungsi)
3. WorkflowRules (`stepCfg.role.includes(...)`)

**Justifikasi Ditangguh**: Menggabungkan ketiga-tiga tempat ini memerlukan refactor besar yang boleh memperkenalkan regression baru. RC1 sudah menyelesaikan masalah keselamatan yang kritikal (`canViewBilling`, HOD dept scope, close authorization) tanpa menyentuh duplikasi ini.

**Cadangan Penyelesaian RC2**: Perkenalkan `AuthPolicy` module di `web/src/lib/authPolicy.js` yang menjadi sumber tunggal untuk semua semakan authorization.

---

## TD-004 — Bundle Size Terlalu Besar

**Status**: RC2
**Keutamaan**: Medium

**Masalah**: Bundle JavaScript = 802kB (gzip: 221kB). Melebihi threshold 500kB Vite.

**Kesan Sekarang**: Masa muat pertama lebih lama pada sambungan perlahan. Tiada impact pada fungsi.

**Justifikasi Ditangguh**: Code splitting memerlukan pengubahsuaian `vite.config.js` dan kemungkinan lazy imports pada route level — kerja yang sesuai dilakukan bersama Sprint 6 (Sidebar/Navigation refactor).

**Cadangan Penyelesaian RC2**:
```js
// Lazy load halaman-halaman besar
const Laporan = lazy(() => import('./pages/Laporan'))
const Bajet = lazy(() => import('./pages/Bajet'))
const Tetapan = lazy(() => import('./pages/Tetapan'))
```

---

## TD-005 — TaskCard Component Tidak Digunakan

**Status**: RC2
**Keutamaan**: Low

**Masalah**: `billing/components/TaskCard.jsx` dieksport dalam `billing/components/index.js` tetapi tidak digunakan dalam mana-mana halaman.

**Justifikasi Ditangguh**: Tidak menyebabkan kerosakan, tidak menambah bundle (tree-shaking menghapusnya). Akan dikaji semula dalam RC2 — sama ada digunakan untuk Sprint 6 atau dipadam.

**Cadangan**: Jika Sprint 6 tidak menggunakannya, padam pada RC2.

---

## TD-006 — Legacy Dashboard Backend Route Dead

**Status**: RC2
**Keutamaan**: Low

**Masalah**: `GET /api/dashboard` dan `GET /api/dashboard/pending-approvals` masih didaftarkan dalam `routes/index.js` tetapi tidak dipanggil oleh frontend sejak ADR-026 (Dashboard menggunakan `/me/summary`).

**Justifikasi Ditangguh**: Dead code, tiada kesan kepada pengguna. Buang dalam RC2 bersama-sama dengan penapisan route index yang lebih menyeluruh.

**Cadangan**: Padam `dashboard.routes.js` dan entri dalam `routes/index.js`. Simpan controller jika diperlukan untuk laporan admin.

---

## TD-007 — PermohonanDetail: Vendor & Account Query Dalam View Mode

**Status**: RC2
**Keutamaan**: Low

**Masalah**: `PermohonanDetail.jsx` menjalankan query vendor list dan account list pada setiap render, walaupun pengguna sedang dalam view mode (bukan edit mode). Ini adalah overhead yang tidak perlu.

**Justifikasi Ditangguh**: Tidak memecahkan fungsi. `staleTime` TanStack Query meminimumkan refetch.

**Cadangan RC2**:
```js
const { data: vendorData } = useQuery({
  queryKey: ['vendors'],
  queryFn: ...,
  enabled: isEditMode,  // hanya fetch bila perlu
})
```

---

## TD-008 — buildAktifScope & buildSejarahScope Mencampur Ownership dan Responsibility

**Status**: ✅ SELESAI (RC2)
**Keutamaan**: HIGH

**Prinsip** (ADR-033):
```
Permohonan = Ownership  → billing.applicantId === currentUser.id, tanpa mengira role
Tindakan   = Responsibility → berdasarkan workflow step dan permission (/me/tasks)
```

**Masalah asal**: `buildAktifScope` dan `buildSejarahScope` mencampur kedua-dua konteks dalam satu query apabila tiada `?status=` filter:

| Role | `/permohonan` (Permohonan Saya) dahulu | RC2 (sekarang) |
|------|----------------------------------------|----------------|
| Finance | own + SEMUA PENDING_FINANCE_* + APPROVED + PARTIAL_PAID | own sahaja ✅ |
| CEO | own + SEMUA PENDING_CEO + PENDING_CEO_FINAL | own sahaja ✅ |
| Finance_HOD | own + jabatan PENDING_HOD + SEMUA finance statuses | own sahaja ✅ |
| Admin | SEMUA billing aktif | own sahaja ✅ |

**Penyelesaian RC2** — Endpoint berasingan mengikut konteks:

| Endpoint | Konteks | Filter |
|----------|---------|--------|
| `GET /me/applications` | Permohonan Saya | `applicantId = user.id`, status NOT IN terminal |
| `GET /me/history` | Sejarah Permohonan | `applicantId = user.id`, status IN [PAID, REJECTED, CLOSED] |
| `GET /billings/aktif?status=PENDING_*` | Tindakan (Responsibility) | role-based scope, dikekalkan |

**Fail diubah**:
- `web/src/controllers/me.controller.js` — tambah `getMyApplications`, `getMyHistory`
- `web/src/routes/me.routes.js` — daftar `GET /applications`, `GET /history`
- `client/src/lib/billing.js` — tambah `myApplications`, `myHistory` ke `billingApi`
- `client/src/billing/services/BillingService.js` — tambah `getMyApplications`, `getMyHistory`
- `client/src/pages/Permohonan.jsx` — guna `/me/applications` untuk `isOwnContext`, `/billings/aktif` untuk Tindakan
- `client/src/pages/PermohonanSejarah.jsx` — guna `/me/history`, buang role-based `tab` filter

---

## Ringkasan

| TD | Penerangan | Target | Keutamaan |
|----|------------|--------|-----------|
| TD-003 | Authorization policy duplication | RC2 | Medium |
| TD-004 | Bundle splitting (800kB) | RC2 | Medium |
| TD-005 | TaskCard unused export | RC2 | Low |
| TD-006 | Legacy /api/dashboard route | RC2 | Low |
| TD-007 | PermohonanDetail form queries in view mode | RC2 | Low |
| TD-008 | buildAktifScope mencampur Ownership & Responsibility | ✅ RC2 | High |
