# CHANGELOG — MBIClicks RC1

**Tarikh Release**: 2026-07-02
**Architecture Version**: v1.2 RC1
**Guardian**: Release Guardian

---

## Ringkasan RC1

RC1 merangkumi Sprint 1–5 dan proses RC1 Gate A–D. Ini adalah Release Candidate pertama yang disahkan melalui audit 4 peringkat (Workflow, Permission, UX, Regression).

---

## Sprint 1 — Foundation

- Tambah ViewModel pattern: `ApplicationViewModel`, `TaskViewModel`, `PaymentViewModel`
- Perkenalkan `/me/tasks` endpoint dengan role-based task queue
- Refactor halaman Permohonan menggunakan ViewModel (buang inline status logic)
- ADR-021: Components accept ViewModel as prop only

---

## Sprint 2 — Service Layer

- Bina `BillingService` — single point for all billing API calls
- Perkenalkan `BillingAdapter` untuk normalize API response
- Perkenalkan `BillingError` dengan mesej Bahasa Malaysia
- ADR-023: All billing API calls through BillingService
- ADR-024: BillingError with user-facing message
- ADR-025: AbortSignal pada semua query

---

## Sprint 3 — Backend Stabilization

- Bina `buildWorkflowView` — workflow object dalam `GET /billings/:id`
- Standardize error handling dengan Express errorHandler
- Kemas kini BillingAdapter untuk terima workflow contract
- ADR: workflowType STAFF vs HOD diperkenalkan

---

## Sprint 4 — Zero Confusion UX

Halaman direfactor dari > 300 baris kepada < 200 baris:

| Halaman | Sebelum | Selepas |
|---------|---------|---------|
| PermohonanDetail | 856 baris | 186 baris |
| Permohonan | 184 baris | 125 baris |
| PermohonanSejarah | 130 baris | 117 baris |
| ApprovalQueue | 334 baris | 176 baris |

**Komponen baru** dalam `billing/components/`:
- `VmStatusBadge` — status badge dari ViewModel display
- `ApplicationTimeline` — timeline workflow
- `ApprovalHistory` — sejarah tindakan dengan timeline
- `PaymentSummaryCard` — ringkasan bayaran
- `ActionDialog` — dialog pengesahan tindakan (approve/reject/return)
- `CloseKesDialog` — dialog tutup kes
- `BillingFormInfo` — maklumat permohonan (view mode)
- `BillingFormItems` — senarai item (view + edit mode)
- `BillingAttachments` — pengurusan lampiran
- `VendorModal` — modal carian vendor

ADR-022: Domain-specific components stay in domain folders

---

## Sprint 5 — Action-Oriented Dashboard

**Backend:**
- Bina `GET /me/summary` — role-based aggregate untuk Dashboard
- Response berbeza mengikut role (hod/ceo/finance/finance_hod/admin)

**Frontend:**
- `DashboardService.getSummary()`
- `DashboardViewModel.build({ summary, viewer })` — transform ke display cards
- `SummaryCard` — clickable card dengan navigateTo
- `DashboardSection` — progressive section (hide jika tiada data)
- Dashboard.jsx: 360 baris → 143 baris

ADR-026, ADR-027, ADR-028, ADR-029, ADR-030, ADR-031

---

## RC1 Gate A — Workflow Audit

### Findings & Fixes

**FINDING-A001 (CRITICAL) — closeBilling tiada role check**
- Sebelum: `POST /billings/:id/close` boleh dipanggil oleh mana-mana finance role
- Selepas: `canClose = requireRole('finance_hod', 'admin')` — hanya finance_hod + admin

**FINDING-A002 (HIGH) — HOD lulus permohonan jabatan lain**
- Sebelum: `workflowAction` hanya semak `role === 'hod'`, tiada dept scope
- Selepas: Tambah `billing.departmentId !== req.user.departmentId` → 403

**FINDING-A003 (LOW) — Label CLOSE dan CEO_FINAL hilang**
- Sebelum: ApprovalHistory papar teks mentah "CLOSE" dan "CEO_FINAL"
- Selepas: Tambah `ACTION_LABEL`, `STEP_LABEL`, `DOT_COLOR` untuk kedua-dua

**AUDIT-A004** — finance tidak boleh bypass PENDING_FINANCE_APPROVAL: ✅ PASS
**AUDIT-A005** — recordPayment ada overpayment guard: ✅ PASS

---

## RC1 Gate B — Permission Audit

### Findings & Fixes

**FINDING-B001 (LOW) — Tiada frontend role guard pada /permohonan/:id/tindakan**
- Sebelum: Semua user login boleh navigate, staff nampak 403 error
- Selepas: `useEffect` redirect ke `/permohonan/:id` jika role bukan approver

**FINDING-B002 (HIGH) — HOD boleh baca billing jabatan lain**
- Sebelum: `isHodRole = role === 'hod'` tanpa dept scope dalam `getBilling` dan `getBillingReview`
- Selepas: `canViewBilling(user, billing)` helper dengan `isOwnHod = role === 'hod' && billing.departmentId === user.departmentId`

**FINDING-B003 (MEDIUM) — Download attachment tanpa scope check**
- Sebelum: `GET /billings/:id/attachments/:attId/download` hanya semak authenticate
- Selepas: Semak `canViewBilling(user, billing)` sebelum hantar file

**AUDIT-B004** — DELETE attachment ada ownership check: ✅ PASS
**AUDIT-B005** — PUT billing RETURNED: hanya owner + admin: ✅ PASS

---

## RC1 Gate C — UX Audit

### Findings & Fixes

**FINDING-UX-001 (HIGH) — Task cards navigate ke route yang tidak wujud**
- Sebelum: `navigateTo: '/tindakan?queue=pending_hod'` — route tidak wujud
- Selepas: `navigateTo: '/permohonan?status=PENDING_HOD'` — filter berfungsi

**FINDING-UX-002 (HIGH) — Completed card navigate ke `/sejarah`**
- Sebelum: `navigateTo: '/sejarah'` — route tidak wujud
- Selepas: `navigateTo: '/permohonan/sejarah'` — route betul

**FINDING-UX-003 (LOW) — "Selesai: 0" dipapar untuk pengguna baru**
- Sebelum: Kad "Selesai" sentiasa dipapar walaupun count = 0
- Selepas: `if (app.completed > 0)` — hanya papar bila ada rekod

---

## RC1 Gate D — Regression Audit

- D1: 15 endpoint shape disahkan — tiada breaking change ✅
- D2: Upload, download, submit, payment — semua berfungsi ✅
- D3: Print/Export — tidak diimplementasi, bukan regression ✅
- D4: Notification — stub sahaja, bukan regression ✅
- D5: Build berjaya — satu warning bundle size (TD-004) ✅
- D6: 2 dead code findings (TD-005, TD-006) — bukan regression ✅
- D7: Tiada duplicate request per halaman ✅

---

## Files Changed RC1

### Backend
- `web/src/controllers/billing.controller.js` — canViewBilling, getBilling, getBillingReview, A002 fix
- `web/src/routes/billing.routes.js` — canViewBilling import, download auth, A001 fix
- `web/src/routes/payment.routes.js` — canClose middleware
- `web/src/controllers/me.controller.js` — getMySummary, getMyTasks
- `web/src/routes/me.routes.js` — /me/summary, /me/tasks

### Frontend
- `client/src/dashboard/DashboardViewModel.js` — UX-001, UX-002, UX-003 fixes
- `client/src/dashboard/DashboardService.js` — getSummary
- `client/src/dashboard/components/SummaryCard.jsx` — clickable card
- `client/src/dashboard/components/DashboardSection.jsx` — progressive section
- `client/src/pages/Dashboard.jsx` — rewrite 360→143 baris
- `client/src/pages/Permohonan.jsx` — rewrite 184→125 baris
- `client/src/pages/PermohonanSejarah.jsx` — rewrite 130→117 baris
- `client/src/pages/PermohonanDetail.jsx` — rewrite 856→186 baris
- `client/src/pages/ApprovalQueue.jsx` — rewrite 334→176 baris + B001 fix
- `client/src/billing/components/ApprovalHistory.jsx` — A003 fix
- `client/src/billing/components/` — 10 komponen baru

### Docs
- `docs/RC1_CHECKLIST.md` — audit trail penuh
- `docs/ARCHITECTURE_v1.2.md` — rujukan architecture
- `docs/TECHNICAL_DEBT.md` — debt register
- `docs/ROADMAP_MILESTONE2.md` — rancangan masa depan
- `docs/CHANGELOG_RC1.md` — dokumen ini
