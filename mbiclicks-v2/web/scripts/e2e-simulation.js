/**
 * RC3 — End-to-End Simulation Script
 *
 * 5 simulasi penuh workflow MBIClicks.
 * Guna endpoint sebenar. Tiada bypass database.
 *
 * Run: node scripts/e2e-simulation.js
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE   = 'http://localhost:4000/api'

// ─── HTTP Helpers ──────────────────────────────────────────────────────────────

async function apiReq(method, path, body, token) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }
  const res  = await fetch(`${BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${data.message ?? data.error ?? JSON.stringify(data)}`)
  return data
}

const GET   = (path, token)        => apiReq('GET', path, null, token)
const POST  = (path, body, token)  => apiReq('POST', path, body, token)
const PATCH = (path, body, token)  => apiReq('PATCH', path, body, token)

// ─── Response Shape Helpers ────────────────────────────────────────────────────
// POST /billings, /submit, /action/:act → { data: billing }
const fromCreate  = r => r.data          // { data: billing } → billing
// GET /billings/:id → { billing, workflow, payments, approvalHistory }
const fromGet     = r => r.billing       // → billing
// GET /me/applications, /me/history → { data: [], total, ... }
const fromList    = r => r.data ?? []    // → []

// ─── Auth ──────────────────────────────────────────────────────────────────────

async function login(staffNo) {
  const r = await POST('/auth/login', { staffNo })
  return r.accessToken
}

// ─── Step 1: Clear Data ────────────────────────────────────────────────────────

async function clearData() {
  log('═'.repeat(60))
  log('STEP 1 — Clear Test Data')
  log('═'.repeat(60))

  const r = await prisma.billing.deleteMany()
  await prisma.notification.deleteMany()

  const tables = [
    'notifications',
    'billings', 'billing_items', 'billing_approvals', 'billing_payments', 'billing_attachments',
  ]
  for (const t of tables) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`)
  }

  log(`✓ ${r.count} billing dipadam, AUTO_INCREMENT direset`)
  log('')
}

// ─── Verify Helpers ────────────────────────────────────────────────────────────

function assert(label, actual, expected) {
  const ok = actual === expected
  if (!ok) throw new Error(`ASSERT GAGAL: ${label} — jangkaan "${expected}", dapat "${actual}"`)
  return `  ✓ ${label}: ${actual}`
}

async function verifyStatus(id, token, expectStatus) {
  const r       = await GET(`/billings/${id}`, token)
  const billing = fromGet(r)
  return {
    billing,
    check: assert('status', billing?.status, expectStatus),
  }
}

async function verifyMeSummary(token, expectActiveMin) {
  const s      = await GET('/me/summary', token)
  const active = s.application?.active ?? 0
  if (active < expectActiveMin) throw new Error(`/me/summary active=${active}, jangkaan ≥${expectActiveMin}`)
  return `  ✓ /me/summary active=${active}`
}

async function verifyMeTasks(token, expectQueueKey) {
  const t     = await GET('/me/tasks', token)
  const found = t.items?.some(i => i.queue === expectQueueKey)
  if (!found) throw new Error(`/me/tasks tiada item queue="${expectQueueKey}". Items: ${JSON.stringify(t.items?.map(i => i.queue))}`)
  return `  ✓ /me/tasks queue="${expectQueueKey}" dijumpai, totalPending=${t.summary?.totalPending}`
}

async function verifyOwnership(token, billingId, shouldExist) {
  const r     = await GET('/me/applications', token)
  const rows  = fromList(r)
  const found = rows.some(b => b.id === billingId)
  if (shouldExist  && !found) throw new Error(`/me/applications tidak ada billing id=${billingId}`)
  if (!shouldExist && found)  throw new Error(`/me/applications SILAP ada billing id=${billingId} (ownership violation)`)
  return `  ✓ /me/applications ownership ok (found=${found})`
}

async function verifyNoOtherOwner(billingId, otherTokens) {
  const violations = []
  for (const { name, token } of otherTokens) {
    const r    = await GET('/me/applications', token)
    const rows = fromList(r)
    if (rows.some(b => b.id === billingId)) violations.push(name)
  }
  if (violations.length > 0) throw new Error(`ADR-033 GAGAL: ${violations.join(', ')} nampak billing id=${billingId} dalam /me/applications`)
  return `  ✓ ADR-033 ok — tiada user lain nampak billing ${billingId}`
}

async function verifyPayments(id, token, expectPaidCount, expectTotalPaid) {
  const r        = await GET(`/billings/${id}/payments`, token)
  const paidCount = (r.data ?? []).filter(p => p.paidAt).length
  const totalPaid = r.totalPaid ?? 0
  if (paidCount !== expectPaidCount) throw new Error(`Payment paid count=${paidCount}, jangkaan ${expectPaidCount}`)
  if (Math.abs(totalPaid - expectTotalPaid) > 0.01) throw new Error(`totalPaid=${totalPaid}, jangkaan ${expectTotalPaid}`)
  const remaining = (r.totalAmount ?? 0) - totalPaid
  return `  ✓ ${paidCount} fasa dibayar, RM${totalPaid.toFixed(2)} / RM${(r.totalAmount ?? 0).toFixed(2)}, baki RM${remaining.toFixed(2)}`
}

async function verifyInHistory(token, billingId) {
  const r    = await GET('/me/history', token)
  const rows = fromList(r)
  if (!rows.some(b => b.id === billingId)) throw new Error(`PAID/REJECTED billing id=${billingId} tidak ada dalam /me/history`)
  return `  ✓ billing ${billingId} ada dalam /me/history`
}

// ─── Logging ───────────────────────────────────────────────────────────────────

const results = []

function log(msg)  { console.log(msg) }
function step(msg) { log(`\n  [→] ${msg}`) }
function ok(msg)   { log(msg) }
function fail(msg) { log(`  ✗ ${msg}`) }

// ─── SIMULATION 1 ─── Staff Audit → HOD → Finance → Finance_HOD → PAID (≤10k) ──

async function sim1() {
  const SIM    = 'SIM-1'
  const report = { id: SIM, name: 'Staff (Audit) → PAID RM 5,000', steps: [], bugs: [], fixes: [] }
  const checks = []

  log('\n' + '═'.repeat(60))
  log(`${SIM} — Staff (Audit) → HOD → Finance → Finance_HOD → PAID (≤10k)`)
  log('═'.repeat(60))

  try {
    const tStaff      = await login('0050')   // Erna, staff, Audit
    const tHod        = await login('0032')   // Noor Salwani, HOD, Audit
    const tFinance    = await login('0008')   // Tunku Azilah, finance
    const tFinanceHod = await login('0006')   // Ahmad Zuhairi, finance_hod
    const tOtherStaff = await login('0030')   // Tarmizi, staff, Komunikasi (non-owner)
    step('Login berjaya: Erna (0050), Noor Salwani (0032), Tunku Azilah (0008), Ahmad Zuhairi (0006)')

    step('Buat draf billing RM 5,000')
    const raw = await POST('/billings', {
      vendorId: 1,
      description: '[SIM-1] Permohonan Bayaran Audit Q1 2026',
      items: [{ description: 'Servis Audit Dalaman', qty: 1, unitCost: 5000 }],
    }, tStaff)
    const b  = fromCreate(raw)
    checks.push(assert('status selepas create', b.status, 'DRAFT'))
    checks.push(assert('workflowType selepas create', b.workflowType, 'STAFF'))
    const id = b.id
    report.steps.push('CREATE DRAFT ✓')

    // Verify ownership
    checks.push(await verifyOwnership(tStaff, id, true))
    checks.push(await verifyNoOtherOwner(id, [
      { name: 'Tarmizi (lain dept)', token: tOtherStaff },
      { name: 'Tunku Azilah (finance)', token: tFinance },
    ]))

    step('Submit permohonan')
    await POST(`/billings/${id}/submit`, {}, tStaff)
    let { check } = await verifyStatus(id, tStaff, 'PENDING_HOD')
    checks.push(check)
    checks.push(await verifyMeSummary(tStaff, 1))
    checks.push(await verifyMeTasks(tHod, 'hod_approve'))
    report.steps.push('SUBMIT → PENDING_HOD ✓')

    step('HOD (Noor Salwani) luluskan')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Disahkan HOD Audit' }, tHod)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_CHECK'))
    checks.push(check)
    checks.push(await verifyMeTasks(tFinance, 'finance_check'))
    report.steps.push('HOD APPROVE → PENDING_FINANCE_CHECK ✓')

    step('Finance Check (Tunku Azilah)')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Semakan finance lulus' }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_VERIFY'))
    checks.push(check)
    report.steps.push('FINANCE CHECK → PENDING_FINANCE_VERIFY ✓')

    step('Finance Verify (Tunku Azilah)')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Pengesahan finance lulus' }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_APPROVAL'))
    checks.push(check)
    checks.push(await verifyMeTasks(tFinanceHod, 'finance_approval'))
    report.steps.push('FINANCE VERIFY → PENDING_FINANCE_APPROVAL ✓')

    step('Finance HOD (Ahmad Zuhairi) luluskan — ≤10k → terus APPROVED')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Kelulusan KPK' }, tFinanceHod)
    ;({ check } = await verifyStatus(id, tStaff, 'APPROVED'))
    checks.push(check)
    checks.push(await verifyMeTasks(tFinance, 'payment'))
    report.steps.push('FINANCE_HOD → APPROVED (≤10k) ✓')

    step('Finance rekod bayaran penuh RM 5,000')
    await POST(`/billings/${id}/payments`, {
      type: 'FULL', amount: 5000, paymentRef: 'REF-SIM1-001', remarks: 'Bayaran penuh',
    }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PAID'))
    checks.push(check)
    checks.push(await verifyPayments(id, tStaff, 1, 5000))
    checks.push(await verifyInHistory(tStaff, id))
    report.steps.push('PAYMENT FULL → PAID ✓')

    for (const c of checks) ok(c)
    report.status = 'PASS'
    log(`\n  🟢 ${SIM} PASS`)

  } catch (e) {
    report.status = 'FAIL'
    report.bugs.push(e.message)
    fail(`ERROR: ${e.message}`)
    log(`\n  🔴 ${SIM} FAIL`)
  }

  results.push(report)
}

// ─── SIMULATION 2 ─── Staff Komunikasi → HOD → Finance → Finance_HOD → CEO_FINAL → PAID (>10k) ──

async function sim2() {
  const SIM    = 'SIM-2'
  const report = { id: SIM, name: 'Staff (Komunikasi) → CEO_FINAL → PAID RM 15,000', steps: [], bugs: [], fixes: [] }
  const checks = []

  log('\n' + '═'.repeat(60))
  log(`${SIM} — Staff (Komunikasi) → HOD → Finance → Finance_HOD → CEO_FINAL → PAID (>10k)`)
  log('═'.repeat(60))

  try {
    const tStaff      = await login('0030')   // Tarmizi, staff, Komunikasi
    const tHod        = await login('c0021')  // Helmi, HOD, Komunikasi
    const tFinance    = await login('0028')   // Noorul Husna, finance
    const tFinanceHod = await login('0006')   // Ahmad Zuhairi, finance_hod
    const tCeo        = await login('kpe001') // Dato Ahmad, CEO
    step('Login berjaya: Tarmizi (0030), Helmi (c0021), Noorul Husna (0028), Ahmad Zuhairi (0006), Dato Ahmad (kpe001)')

    step('Buat draf billing RM 15,000')
    const raw = await POST('/billings', {
      vendorId: 1,
      description: '[SIM-2] Permohonan ICT Komunikasi 2026',
      items: [{ description: 'Peralatan ICT', qty: 3, unitCost: 5000 }],
    }, tStaff)
    const b  = fromCreate(raw)
    checks.push(assert('status selepas create', b.status, 'DRAFT'))
    const id = b.id
    report.steps.push('CREATE DRAFT ✓')

    step('Submit')
    await POST(`/billings/${id}/submit`, {}, tStaff)
    let { check } = await verifyStatus(id, tStaff, 'PENDING_HOD')
    checks.push(check)
    report.steps.push('SUBMIT → PENDING_HOD ✓')

    step('HOD (Helmi) luluskan')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Lulus HOD Komunikasi' }, tHod)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_CHECK'))
    checks.push(check)
    report.steps.push('HOD → PENDING_FINANCE_CHECK ✓')

    step('Finance Check (Noorul Husna)')
    await POST(`/billings/${id}/action/approve`, {}, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_VERIFY'))
    checks.push(check)
    report.steps.push('FINANCE CHECK → PENDING_FINANCE_VERIFY ✓')

    step('Finance Verify (Noorul Husna)')
    await POST(`/billings/${id}/action/approve`, {}, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_APPROVAL'))
    checks.push(check)
    report.steps.push('FINANCE VERIFY → PENDING_FINANCE_APPROVAL ✓')

    step('Finance HOD (Ahmad Zuhairi) luluskan — >10k → PENDING_CEO_FINAL')
    await POST(`/billings/${id}/action/approve`, { remarks: 'KPK lulus, perlu CEO' }, tFinanceHod)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_CEO_FINAL'))
    checks.push(check)
    checks.push(await verifyMeTasks(tCeo, 'ceo_final'))
    report.steps.push('FINANCE_HOD → PENDING_CEO_FINAL (>10k) ✓')

    step('CEO (Dato Ahmad) kelulusan muktamad')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Diluluskan Dato CEO' }, tCeo)
    ;({ check } = await verifyStatus(id, tStaff, 'APPROVED'))
    checks.push(check)
    report.steps.push('CEO_FINAL → APPROVED ✓')

    step('Finance rekod bayaran penuh RM 15,000')
    await POST(`/billings/${id}/payments`, {
      type: 'FULL', amount: 15000, paymentRef: 'REF-SIM2-001',
    }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PAID'))
    checks.push(check)
    checks.push(await verifyPayments(id, tStaff, 1, 15000))
    checks.push(await verifyInHistory(tStaff, id))
    report.steps.push('PAYMENT FULL → PAID ✓')

    for (const c of checks) ok(c)
    report.status = 'PASS'
    log(`\n  🟢 ${SIM} PASS`)

  } catch (e) {
    report.status = 'FAIL'
    report.bugs.push(e.message)
    fail(`ERROR: ${e.message}`)
    log(`\n  🔴 ${SIM} FAIL`)
  }

  results.push(report)
}

// ─── SIMULATION 3 ─── Staff Ladang Hutan → PAID (RM 2,500) + task isolation ──

async function sim3() {
  const SIM    = 'SIM-3'
  const report = { id: SIM, name: 'Staff (Ladang Hutan) → PAID RM 2,500 + verify task isolation', steps: [], bugs: [], fixes: [] }
  const checks = []

  log('\n' + '═'.repeat(60))
  log(`${SIM} — Staff (Ladang Hutan) → HOD → Finance → Finance_HOD → PAID + task isolation`)
  log('═'.repeat(60))

  try {
    const tStaff      = await login('0024')   // Nur Aishah, staff, Ladang Hutan
    const tHod        = await login('0016')   // Asmawati, HOD, Ladang Hutan
    const tFinance    = await login('0075')   // Mohammad Naim, finance
    const tFinanceHod = await login('0006')   // Ahmad Zuhairi, finance_hod
    const tOtherHod   = await login('c0021')  // Helmi, HOD Komunikasi (lain dept)
    step('Login berjaya: Nur Aishah (0024), Asmawati (0016), Mohammad Naim (0075), Ahmad Zuhairi (0006)')

    step('Buat draf billing RM 2,500')
    const raw = await POST('/billings', {
      vendorId: 1,
      description: '[SIM-3] Bekalan Ladang Hutan Q2 2026',
      items: [{ description: 'Baja & Racun', qty: 5, unitCost: 500 }],
    }, tStaff)
    const b  = fromCreate(raw)
    checks.push(assert('status selepas create', b.status, 'DRAFT'))
    const id = b.id
    report.steps.push('CREATE DRAFT ✓')

    step('Submit — verify HOD lain dept TIDAK nampak task')
    await POST(`/billings/${id}/submit`, {}, tStaff)
    let { check } = await verifyStatus(id, tStaff, 'PENDING_HOD')
    checks.push(check)

    // Responsibility isolation — HOD dari dept lain tidak boleh nampak
    const otherHodTasks = await GET('/me/tasks', tOtherHod)
    const wrongTask = otherHodTasks.items?.some(t => t.billingId === id)
    if (wrongTask) throw new Error('HOD dept lain nampak task — RESPONSIBILITY ISOLATION BUG')
    checks.push('  ✓ HOD dept lain tidak nampak task ini')
    report.steps.push('SUBMIT → PENDING_HOD ✓ (task isolation verified)')

    step('HOD (Asmawati) luluskan')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Lulus HOD Ladang Hutan' }, tHod)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_CHECK'))
    checks.push(check)
    report.steps.push('HOD → PENDING_FINANCE_CHECK ✓')

    step('Finance Check → Verify → Finance HOD → APPROVED')
    await POST(`/billings/${id}/action/approve`, {}, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_VERIFY'))
    checks.push(check)
    report.steps.push('FINANCE CHECK → PENDING_FINANCE_VERIFY ✓')

    await POST(`/billings/${id}/action/approve`, {}, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_APPROVAL'))
    checks.push(check)
    report.steps.push('FINANCE VERIFY → PENDING_FINANCE_APPROVAL ✓')

    await POST(`/billings/${id}/action/approve`, {}, tFinanceHod)
    ;({ check } = await verifyStatus(id, tStaff, 'APPROVED'))
    checks.push(check)
    report.steps.push('FINANCE_HOD → APPROVED ✓')

    step('Finance rekod bayaran penuh RM 2,500')
    await POST(`/billings/${id}/payments`, {
      type: 'FULL', amount: 2500, paymentRef: 'REF-SIM3-001',
    }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PAID'))
    checks.push(check)
    checks.push(await verifyPayments(id, tStaff, 1, 2500))
    checks.push(await verifyInHistory(tStaff, id))
    report.steps.push('PAYMENT → PAID ✓')

    for (const c of checks) ok(c)
    report.status = 'PASS'
    log(`\n  🟢 ${SIM} PASS`)

  } catch (e) {
    report.status = 'FAIL'
    report.bugs.push(e.message)
    fail(`ERROR: ${e.message}`)
    log(`\n  🔴 ${SIM} FAIL`)
  }

  results.push(report)
}

// ─── SIMULATION 4 ─── HOD sebagai Pemohon → CEO → Finance → CEO_FINAL → PAID ──

async function sim4() {
  const SIM    = 'SIM-4'
  const report = { id: SIM, name: 'HOD sebagai Pemohon → workflow HOD → PAID RM 8,000', steps: [], bugs: [], fixes: [] }
  const checks = []

  log('\n' + '═'.repeat(60))
  log(`${SIM} — HOD (Sumber Manusia) sebagai Pemohon → CEO → Finance → CEO_FINAL → PAID`)
  log('═'.repeat(60))

  try {
    const tHodApplicant = await login('0009')   // Nurul Awanis, HOD, Sumber Manusia
    const tCeo          = await login('kpe001')  // Dato Ahmad, CEO
    const tFinance      = await login('0008')    // Tunku Azilah, finance
    const tFinanceHod   = await login('0006')    // Ahmad Zuhairi, finance_hod
    step('Login berjaya: Nurul Awanis (0009 / HOD), Dato Ahmad (kpe001 / CEO), Tunku Azilah (0008), Ahmad Zuhairi (0006)')

    step('Buat draf RM 8,000 — pemohon adalah HOD')
    const raw = await POST('/billings', {
      vendorId: 1,
      description: '[SIM-4] Latihan Sumber Manusia 2026',
      items: [{ description: 'Yuran Latihan', qty: 4, unitCost: 2000 }],
    }, tHodApplicant)
    const b  = fromCreate(raw)
    checks.push(assert('status selepas create', b.status, 'DRAFT'))
    // workflowType ditetapkan semasa SUBMIT, bukan CREATE — jadi masih STAFF di sini
    const id = b.id
    report.steps.push('CREATE DRAFT ✓')

    checks.push(await verifyOwnership(tHodApplicant, id, true))

    step('Submit — mesti ke PENDING_CEO (bukan PENDING_HOD)')
    await POST(`/billings/${id}/submit`, {}, tHodApplicant)
    let { billing, check } = await verifyStatus(id, tHodApplicant, 'PENDING_CEO')
    checks.push(check)
    // Verify workflowType=HOD selepas submit
    checks.push(assert('workflowType selepas submit', billing?.workflowType, 'HOD'))
    checks.push(await verifyMeTasks(tCeo, 'ceo_approve'))
    report.steps.push('SUBMIT → PENDING_CEO ✓ (skip HOD step, workflowType=HOD)')

    step('CEO (Dato Ahmad) luluskan')
    await POST(`/billings/${id}/action/approve`, { remarks: 'CEO lulus permohonan HOD' }, tCeo)
    ;({ check } = await verifyStatus(id, tHodApplicant, 'PENDING_FINANCE_CHECK'))
    checks.push(check)
    report.steps.push('CEO → PENDING_FINANCE_CHECK ✓')

    step('Finance Check (Tunku Azilah)')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Check ok' }, tFinance)
    ;({ check } = await verifyStatus(id, tHodApplicant, 'PENDING_FINANCE_VERIFY'))
    checks.push(check)
    report.steps.push('FINANCE CHECK → PENDING_FINANCE_VERIFY ✓')

    step('Finance Verify — HOD workflow terus CEO_FINAL (skip FINANCE_APPROVAL)')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Verify ok' }, tFinance)
    ;({ check } = await verifyStatus(id, tHodApplicant, 'PENDING_CEO_FINAL'))
    checks.push(check)
    checks.push(await verifyMeTasks(tCeo, 'ceo_final'))
    report.steps.push('FINANCE VERIFY → PENDING_CEO_FINAL ✓ (skip FINANCE_APPROVAL)')

    step('CEO Kelulusan Muktamad')
    await POST(`/billings/${id}/action/approve`, { remarks: 'Kelulusan akhir CEO' }, tCeo)
    ;({ check } = await verifyStatus(id, tHodApplicant, 'APPROVED'))
    checks.push(check)
    report.steps.push('CEO_FINAL → APPROVED ✓')

    step('Finance rekod bayaran penuh RM 8,000')
    await POST(`/billings/${id}/payments`, {
      type: 'FULL', amount: 8000, paymentRef: 'REF-SIM4-001',
    }, tFinance)
    ;({ check } = await verifyStatus(id, tHodApplicant, 'PAID'))
    checks.push(check)
    checks.push(await verifyPayments(id, tHodApplicant, 1, 8000))
    checks.push(await verifyInHistory(tHodApplicant, id))
    report.steps.push('PAYMENT → PAID ✓')

    for (const c of checks) ok(c)
    report.status = 'PASS'
    log(`\n  🟢 ${SIM} PASS`)

  } catch (e) {
    report.status = 'FAIL'
    report.bugs.push(e.message)
    fail(`ERROR: ${e.message}`)
    log(`\n  🔴 ${SIM} FAIL`)
  }

  results.push(report)
}

// ─── SIMULATION 5 ─── Staff → 3 Ansuran → PAID ──────────────────────────────

async function sim5() {
  const SIM    = 'SIM-5'
  const report = { id: SIM, name: 'Staff → Bayaran Ansuran 3x RM 3,000 → PAID RM 9,000', steps: [], bugs: [], fixes: [] }
  const checks = []

  log('\n' + '═'.repeat(60))
  log(`${SIM} — Staff (Sumber Manusia) → HOD → Finance → 3 Ansuran → PAID`)
  log('═'.repeat(60))

  try {
    const tStaff      = await login('0025')   // Shathirah, staff, Sumber Manusia
    const tHod        = await login('0009')   // Nurul Awanis, HOD, Sumber Manusia
    const tFinance    = await login('0008')   // Tunku Azilah, finance
    const tFinanceHod = await login('0006')   // Ahmad Zuhairi, finance_hod
    step('Login berjaya: Shathirah (0025), Nurul Awanis (0009 / HOD), Tunku Azilah (0008), Ahmad Zuhairi (0006)')

    step('Buat draf RM 9,000 (3 ansuran × RM 3,000)')
    const raw = await POST('/billings', {
      vendorId: 1,
      description: '[SIM-5] Kursus HR & Pembangunan 2026',
      items: [{ description: 'Pakej Latihan HR', qty: 1, unitCost: 9000 }],
    }, tStaff)
    const b  = fromCreate(raw)
    checks.push(assert('status selepas create', b.status, 'DRAFT'))
    const id = b.id
    report.steps.push('CREATE DRAFT ✓')

    step('Submit')
    await POST(`/billings/${id}/submit`, {}, tStaff)
    let { check } = await verifyStatus(id, tStaff, 'PENDING_HOD')
    checks.push(check)
    report.steps.push('SUBMIT → PENDING_HOD ✓')

    step('HOD → Finance Check → Finance Verify → Finance HOD → APPROVED')
    await POST(`/billings/${id}/action/approve`, {}, tHod)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_CHECK'))
    checks.push(check)
    report.steps.push('HOD → PENDING_FINANCE_CHECK ✓')

    await POST(`/billings/${id}/action/approve`, {}, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_VERIFY'))
    checks.push(check)
    report.steps.push('FINANCE CHECK → PENDING_FINANCE_VERIFY ✓')

    await POST(`/billings/${id}/action/approve`, {}, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PENDING_FINANCE_APPROVAL'))
    checks.push(check)
    report.steps.push('FINANCE VERIFY → PENDING_FINANCE_APPROVAL ✓')

    await POST(`/billings/${id}/action/approve`, {}, tFinanceHod)
    ;({ check } = await verifyStatus(id, tStaff, 'APPROVED'))
    checks.push(check)
    report.steps.push('FINANCE_HOD → APPROVED ✓')

    // ─── ANSURAN FASA 1 + plan fasa 2 & 3 ───────────────────────────────────
    step('Ansuran Fasa 1: bayar RM 3,000, plan fasa 2 & 3')
    // phases array = semua fasa termasuk fasa semasa (newPayments[0] dibayar sekarang)
    await POST(`/billings/${id}/payments`, {
      type: 'PARTIAL',
      amount: 3000,
      paymentRef: 'REF-SIM5-P1',
      remarks: 'Ansuran 1/3',
      phases: [
        { amount: 3000 },                                    // fasa 1 — dibayar sekarang
        { amount: 3000, dueDate: '2026-08-01' },             // fasa 2 — planned
        { amount: 3000, dueDate: '2026-09-01' },             // fasa 3 — planned
      ],
    }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PARTIAL_PAID'))
    checks.push(check)
    checks.push(await verifyPayments(id, tStaff, 1, 3000))
    report.steps.push('ANSURAN FASA 1 → PARTIAL_PAID ✓')

    // Dapatkan fasa yang belum dibayar
    const p1 = await GET(`/billings/${id}/payments`, tStaff)
    const fasa2 = (p1.data ?? []).find(p => !p.paidAt && p.phase === 2)
    if (!fasa2) throw new Error('Fasa 2 tidak dijumpai')
    checks.push(`  ✓ Fasa 2 ready (id=${fasa2.id}, dueDate=${fasa2.dueDate?.split('T')[0] ?? '-'})`)

    // ─── ANSURAN FASA 2 ───────────────────────────────────────────────────────
    step('Ansuran Fasa 2: bayar RM 3,000')
    await PATCH(`/billings/${id}/payments/${fasa2.id}`, {
      paymentRef: 'REF-SIM5-P2', remarks: 'Ansuran 2/3',
    }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PARTIAL_PAID'))
    checks.push(check)
    checks.push(await verifyPayments(id, tStaff, 2, 6000))
    report.steps.push('ANSURAN FASA 2 → PARTIAL_PAID ✓')

    // Dapatkan fasa 3
    const p2 = await GET(`/billings/${id}/payments`, tStaff)
    const fasa3 = (p2.data ?? []).find(p => !p.paidAt && p.phase === 3)
    if (!fasa3) throw new Error('Fasa 3 tidak dijumpai')
    checks.push(`  ✓ Fasa 3 ready (id=${fasa3.id})`)

    // ─── ANSURAN FASA 3 (TERAKHIR) ───────────────────────────────────────────
    step('Ansuran Fasa 3: bayar RM 3,000 — mesti PAID')
    await PATCH(`/billings/${id}/payments/${fasa3.id}`, {
      paymentRef: 'REF-SIM5-P3', remarks: 'Ansuran 3/3 — selesai',
    }, tFinance)
    ;({ check } = await verifyStatus(id, tStaff, 'PAID'))
    checks.push(check)
    checks.push(await verifyPayments(id, tStaff, 3, 9000))
    checks.push(await verifyInHistory(tStaff, id))
    report.steps.push('ANSURAN FASA 3 → PAID ✓ (3/3 selesai, RM 9,000 penuh)')

    for (const c of checks) ok(c)
    report.status = 'PASS'
    log(`\n  🟢 ${SIM} PASS`)

  } catch (e) {
    report.status = 'FAIL'
    report.bugs.push(e.message)
    fail(`ERROR: ${e.message}`)
    log(`\n  🔴 ${SIM} FAIL`)
  }

  results.push(report)
}

// ─── Final Report ──────────────────────────────────────────────────────────────

function printReport() {
  log('\n\n' + '═'.repeat(60))
  log('RC3 — FINAL REPORT')
  log('═'.repeat(60))

  for (const r of results) {
    log(`\n## ${r.id} — ${r.name}`)
    log(`Status: ${r.status === 'PASS' ? '🟢 PASS' : '🔴 FAIL'}`)
    log(`Flow: ${r.steps.join(' → ')}`)
    if (r.bugs.length > 0) {
      log(`Bug: ${r.bugs.join('; ')}`)
      if (r.fixes.length > 0) log(`Fix: ${r.fixes.join('; ')}`)
    } else {
      log('Bug: Tiada')
    }
  }

  const total  = results.length
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = total - passed
  const allBugs = results.flatMap(r => r.bugs)

  log('\n' + '─'.repeat(60))
  log('## Summary')
  log(`Jumlah simulasi : ${total}`)
  log(`PASS            : ${passed}`)
  log(`FAIL            : ${failed}`)
  log(`Bug ditemui     : ${allBugs.length}`)

  if (failed === 0) {
    log('')
    log('Kesimpulan akhir: ✅ Sistem LULUS — semua 5 simulasi berjaya')
  } else {
    log('')
    log(`Kesimpulan akhir: ❌ Sistem BELUM LULUS — ${failed} simulasi gagal`)
    log('')
    log('Bug yang ditemui:')
    allBugs.forEach((b, i) => log(`  ${i + 1}. ${b}`))
  }
  log('═'.repeat(60))
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log('\n🚀 RC3 — End-to-End Simulation Test')
  log(`   Tarikh: ${new Date().toLocaleString('ms-MY')}`)
  log(`   Server: ${BASE}`)
  log('')

  try {
    await clearData()
    await sim1()
    await sim2()
    await sim3()
    await sim4()
    await sim5()
  } finally {
    printReport()
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error('FATAL:', e.message)
  process.exit(1)
})
