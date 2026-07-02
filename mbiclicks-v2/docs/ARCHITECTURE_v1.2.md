# MBIClicks Architecture v1.2 RC1

**Status**: Frozen — 2026-07-02
**Guardian**: Release Guardian
**Versi sebelum**: v1.1 (Sprint 5)

Dokumen ini adalah rujukan rasmi untuk semua pembangun. Sebarang perubahan kepada layer, pattern, atau ADR yang dinyatakan di sini memerlukan kelulusan Architecture Guardian.

---

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Vite + React 18 |
| State/Query | TanStack Query v5 + Zustand |
| Styling | Tailwind CSS v4 |
| Backend | Express 5 + Node.js |
| ORM | Prisma + MySQL |
| Auth | JWT (access + refresh) |

---

## Layer Architecture

```
Pengguna
  ↓
Page (< 200 baris)
  ↓
ViewModel (transform data → display)
  ↓
Service (panggil API, normalize error)
  ↓
Backend Controller
  ↓
Prisma ORM
  ↓
MySQL
```

### Peraturan Per Layer

**Page**
- Boleh: Query, Mutation, state, render komponen
- Tidak boleh: Role logic, status string mentah, inline formatter
- Saiz maksimum: 200 baris

**ViewModel**
- Menerima: data API + viewer (user)
- Mengembalikan: objek display-ready (label, color, navigateTo, actions[])
- Tidak boleh: panggil API, useState, JSX

**Service (BillingService, DashboardService)**
- Menggunakan: `api` Axios instance
- Mengembalikan: data dinormalize
- Lempar: `BillingError` dengan `message` yang boleh dipapar pengguna

**Component (billing/components/)**
- Menerima: ViewModel prop sahaja (ADR-021)
- Tidak boleh: Fetch data, tahu tentang routing, role logic

---

## Workflow Billing

### STAFF workflow
```
DRAFT → PENDING_HOD → PENDING_FINANCE_CHECK → PENDING_FINANCE_VERIFY
      → PENDING_FINANCE_APPROVAL
        ├─ amount ≤ RM10k → APPROVED
        └─ amount > RM10k → PENDING_CEO_FINAL → APPROVED
      → PAID / PARTIAL_PAID / CLOSED / REJECTED
```

### HOD workflow (pemohon adalah HOD/Finance_HOD)
```
DRAFT → PENDING_CEO → PENDING_FINANCE_CHECK → PENDING_FINANCE_VERIFY
      → PENDING_CEO_FINAL → APPROVED → PAID / CLOSED / REJECTED
```

### Peranan Per Langkah

| Status | Peranan yang bertindak |
|--------|------------------------|
| PENDING_HOD | hod (jabatan sama), finance_hod (jabatan sama), admin |
| PENDING_CEO | ceo, admin |
| PENDING_FINANCE_CHECK | finance, finance_hod, admin |
| PENDING_FINANCE_VERIFY | finance, finance_hod, admin |
| PENDING_FINANCE_APPROVAL | finance_hod, admin |
| PENDING_CEO_FINAL | ceo, admin |
| APPROVED → PAID | finance, finance_hod, admin |
| APPROVED → CLOSED | finance_hod, admin |

---

## Authorization Policy

### canViewBilling(user, billing)

Polisi rasmi untuk semua endpoint READ billing:

```js
export function canViewBilling(user, billing) {
  const role      = user.role?.slug
  const isOwner   = billing.applicantId === user.id
  const isAdmin   = role === 'admin'
  const isFinance = ['finance', 'finance_hod'].includes(role)
  const isCeo     = role === 'ceo'
  const isOwnHod  = role === 'hod' && billing.departmentId === user.departmentId
  return isOwner || isAdmin || isFinance || isCeo || isOwnHod
}
```

Digunakan dalam: `getBilling`, `getBillingReview`, download attachment.

### Prinsip Kebenaran

- HOD hanya boleh lihat, semak, dan lulus billing jabatan sendiri
- Finance_HOD boleh lihat semua billing (scope kewangan melintasi jabatan)
- CEO boleh lihat semua billing
- Staff hanya boleh lihat billing sendiri

---

## Dashboard Architecture

### Prinsip (ADR-026 hingga ADR-031)

| ADR | Peraturan |
|-----|-----------|
| ADR-026 | Dashboard hanya query `/me/tasks` dan `/me/summary` — tidak boleh query `/billings` |
| ADR-027 | Dashboard adalah summary, bukan senarai |
| ADR-028 | Dashboard adalah Entry Point — tiada modal, tiada edit, tiada approval |
| ADR-029 | SummaryCard tidak tahu routing — destinasi melalui `vm.navigateTo` dalam ViewModel |
| ADR-030 | Dashboard mesti Progressive — kalau tiada data, papar lebih ringkas |
| ADR-031 | Dashboard hanya papar tindakan yang wujud — adaptive |

### Data Flow Dashboard

```
GET /me/summary
  ↓
DashboardService.getSummary()
  ↓
DashboardViewModel.build({ summary, viewer })
  ↓
applicationCards[] + taskCards[]
  ↓
DashboardSection → SummaryCard (navigateTo)
```

### navigateTo Convention

| Task Card | Destinasi |
|-----------|-----------|
| hodApproval | `/permohonan?status=PENDING_HOD` |
| ceoApproval | `/permohonan?status=PENDING_CEO` |
| ceoFinal | `/permohonan?status=PENDING_CEO_FINAL` |
| financeCheck | `/permohonan?status=PENDING_FINANCE_CHECK` |
| financeVerify | `/permohonan?status=PENDING_FINANCE_VERIFY` |
| financeApproval | `/permohonan?status=PENDING_FINANCE_APPROVAL` |
| payment | `/permohonan` |
| completed (app) | `/permohonan/sejarah` |

---

## Frontend Route Map

| Route | Komponen | Guard |
|-------|----------|-------|
| `/dashboard` | Dashboard | DashboardGuard (auth; admin→/tetapan) |
| `/permohonan` | Permohonan | DashboardLayout (auth) |
| `/permohonan/sejarah` | PermohonanSejarah | DashboardLayout (auth) |
| `/permohonan/baru` | PermohonanDetail | DashboardLayout (auth) |
| `/permohonan/:id` | PermohonanDetail | DashboardLayout (auth) |
| `/permohonan/:id/tindakan` | ApprovalQueue | useEffect → non-approver redirect |
| `/permohonan/:id/hod` | PermohonanHod | useEffect → hod/finance_hod/admin |
| `/permohonan/:id/ceo` | PermohonanCeo | useEffect → ceo/admin |
| `/permohonan/:id/semakan-kewangan` | FinanceSemakan | useEffect → finance |
| `/permohonan/:id/pengesahan-kewangan` | FinancePengesahan | useEffect → finance/finance_hod/admin |
| `/permohonan/:id/kelulusan-kewangan` | FinanceKelulusan | useEffect → finance_hod/admin |
| `/bajet`, `/laporan`, `/akaun`, `/akaun-bank` | — | FinanceGuard |
| `/tetapan` | Tetapan | AdminGuard |

---

## API Contract Utama

### GET /me/summary
```json
{
  "application": {
    "active": 0, "pendingApproval": 0,
    "waitingPayment": 0, "partialPayment": 0, "completed": 0
  },
  "tasks": {
    "total": 0,
    "hodApproval": 0,      // hanya untuk role hod / finance_hod
    "ceoApproval": 0,      // hanya untuk role ceo
    "ceoFinal": 0,
    "financeCheck": 0,     // hanya untuk role finance / finance_hod
    "financeVerify": 0,
    "financeApproval": 0,
    "payment": 0
  }
}
```

### GET /billings/:id
```json
{
  "billing": { "id", "refNo", "status", "currentStep", "workflowType",
               "totalAmount", "applicant", "department", "vendor", "items[]",
               "attachments[]", "paidBy", "paidAt", "paymentRef" },
  "workflow": { "display", "step", "actions[]", "canClose", "canPay" },
  "payments": [{ "phase", "amount", "type", "paidBy", "paidAt" }],
  "approvalHistory": [{ "id", "step", "action", "actor", "actionedAt", "remarks" }]
}
```

---

## Coding Rules

1. **Page < 200 baris** — kalau lebih, extract komponen atau ViewModel
2. **Tiada role logic dalam React** — semua display logic dalam ViewModel
3. **Tiada status string mentah dalam UI** — guna `STATUS_DISPLAY` atau ViewModel
4. **Tiada comment yang menerangkan WHAT** — nama kod sudah cukup
5. **Tiada backward-compat shim** — tukar terus, jangan kekalkan alias
6. **Tiada `canEditBilling()`, `canDeleteBilling()`** — hanya `canViewBilling()` sebagai helper (TD-003 kekal sebagai nota)
7. **Error user-facing mesti dalam Bahasa Malaysia**
8. **Setiap page buat minimum API call** — tiada duplicate fetch

---

## ADR Register

| ADR | Tajuk | Keputusan |
|-----|-------|-----------|
| ADR-021 | Component Props | Components only accept ViewModel as prop |
| ADR-022 | Component Placement | Domain-specific components in domain folders |
| ADR-023 | BillingService | All API calls through BillingService, never direct |
| ADR-024 | Error Handling | BillingError with user-facing Malay message |
| ADR-025 | Abort Signal | All queries pass AbortSignal |
| ADR-026 | Dashboard Data Source | Dashboard only queries /me/tasks and /me/summary |
| ADR-027 | Dashboard is Summary | No senarai (list) in Dashboard |
| ADR-028 | Dashboard is Entry Point | No modal, edit, approval, payment in Dashboard |
| ADR-029 | SummaryCard Routing | Destination via vm.navigateTo, not hard-coded in component |
| ADR-030 | Dashboard Progressive | Empty state when no data, not zero-filled cards |
| ADR-031 | Dashboard Adaptive | Only render task cards that have non-zero count |
| ADR-032 | Sidebar Navigation Layer | Sidebar renders NavigationModel only — no `if(status===...)`, no workflow logic |
| ADR-033 | Permohonan = Ownership, Tindakan = Responsibility | Permohonan endpoint sentiasa filter `applicantId === user.id`; Tindakan data dari `/me/tasks` sahaja |
| ADR-034 | Ownership endpoint hanya memproses parameter kontraknya | Unknown params (`status`, `queue`, `workflow`, dll) → diabaikan, endpoint tetap pulangkan rekod milik sendiri. Known params tidak sah (`page=-1`, `limit=0`, `limit>100`) → 400. Kontrak semasa: `page`, `limit` sahaja |

---

## Sidebar Architecture (ADR-032)

Sidebar menggunakan `SidebarViewModel.buildSidebarNav({ summary, location })` untuk mendapatkan NavigationModel. Sidebar.jsx tidak boleh mengandungi sebarang logik workflow atau status.

### NavigationModel Structure

```js
{
  permohonan: {
    isActive: bool,
    items: [
      { key, label, to, isActive }  // Aktif | Sejarah | + Permohonan Baru
    ]
  },
  tindakan: {
    totalCount: number,
    hasItems: bool,         // ADR-031: jika false, menu Tindakan tidak dipapar
    isActive: bool,
    items: [
      { key, label, count, to, isActive }  // hanya queue dengan count > 0
    ]
  }
}
```

### Task Key → Route Mapping

| Key | Label | Status Filter |
|-----|-------|---------------|
| hodApproval | Kelulusan Jabatan | `PENDING_HOD` |
| ceoApproval | Kelulusan CEO | `PENDING_CEO` |
| ceoFinal | Kelulusan Muktamad | `PENDING_CEO_FINAL` |
| financeCheck | Semakan | `PENDING_FINANCE_CHECK` |
| financeVerify | Pengesahan | `PENDING_FINANCE_VERIFY` |
| financeApproval | Kelulusan KPK | `PENDING_FINANCE_APPROVAL` |
| payment | Bayaran | — (navigates to `/permohonan`) |

### Active Highlight Rules (Spec F)

- `/permohonan` (no status) → Permohonan > Aktif active
- `/permohonan?status=PENDING_HOD` → **Tindakan > Kelulusan Jabatan** active (NOT Permohonan)
- `/permohonan/sejarah` → Permohonan > Sejarah active
- `/permohonan/baru` → Permohonan > + Permohonan Baru active

### Data Source

Sidebar queries `/me/summary` dengan query key `['me-summary']` — same key as Dashboard. TanStack Query deduplicates; satu request sahaja walaupun kedua-dua komponen query serentak.

---

## Apa Yang TIDAK BOLEH Dilakukan

- Tambah role logic dalam React component atau Page
- Panggil `/billings` dari Dashboard
- Buat modal approval atau edit dalam Dashboard
- Buat helper policy baru (`canEditBilling` dll) tanpa ADR
- Ubah workflowRules.js tanpa Guardian review
- Merge ke main tanpa RC gate
- Skip useEffect guard pada halaman bertindak
- Letak `if(status === ...)` atau `if(workflow === ...)` dalam Sidebar.jsx
- Buat endpoint baru untuk sidebar badge — guna `/me/summary` yang sedia ada
- Letak menu kelulusan (Task Context) di bawah section Kewangan
- Campurkan Ownership dan Responsibility dalam satu endpoint/query (ADR-033)
- Gunakan role untuk menapis data dalam "Permohonan Saya" — gunakan `applicantId === user.id` sahaja
