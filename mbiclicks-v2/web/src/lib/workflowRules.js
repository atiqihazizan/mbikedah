/**
 * workflowRules.js
 *
 * Rule engine untuk workflow permohonan pembayaran.
 * Setiap step mempunyai:
 *   - status    : nama status semasa
 *   - step      : label rekod kelulusan
 *   - roles     : role yang boleh bertindak
 *   - condition : fn(billing) → boolean — step ini aktif atau tidak
 *   - onApprove : status seterusnya selepas lulus (string atau fn(billing))
 *   - onReject  : status selepas tolak
 *   - onReturn  : status selepas kembalikan
 *
 * Nak tukar workflow? Ubah STEP_DEFINITIONS sahaja — controller tidak perlu disentuh.
 */

export const STEP_DEFINITIONS = [
  {
    status:    'PENDING_HOD',
    step:      'HOD',
    roles:     ['hod', 'finance_hod', 'admin'],
    // Skip jika pemohon adalah HOD/finance_hod (workflow jenis HOD)
    condition: (billing) => billing.workflowType !== 'HOD',
    onApprove: 'PENDING_FINANCE_CHECK',
    onReject:  'REJECTED',
    onReturn:  'RETURNED',
  },
  {
    status:    'PENDING_CEO',
    step:      'CEO',
    roles:     ['ceo', 'admin'],
    // Hanya aktif jika pemohon adalah HOD (CEO gantikan HOD)
    condition: (billing) => billing.workflowType === 'HOD',
    onApprove: 'PENDING_FINANCE_CHECK',
    onReject:  'REJECTED',
    onReturn:  'RETURNED',
  },
  {
    status:    'PENDING_FINANCE_CHECK',
    step:      'FINANCE_CHECK',
    roles:     ['finance', 'finance_hod', 'admin'],
    condition: () => true,
    onApprove: 'PENDING_FINANCE_VERIFY',
    onReject:  'REJECTED',
    onReturn:  'RETURNED',
  },
  {
    status:    'PENDING_FINANCE_VERIFY',
    step:      'FINANCE_VERIFY',
    roles:     ['finance', 'finance_hod', 'admin'],
    condition: () => true,
    // HOD workflow → CEO final; STAFF workflow → kelulusan finance_hod
    onApprove: (billing) => billing.workflowType === 'HOD' ? 'PENDING_CEO_FINAL' : 'PENDING_FINANCE_APPROVAL',
    onReject:  'REJECTED',
    onReturn:  'RETURNED',
  },
  {
    status:    'PENDING_FINANCE_APPROVAL',
    step:      'FINANCE_APPROVAL',
    roles:     ['finance_hod', 'admin'],
    // Hanya untuk STAFF workflow (HOD workflow terus ke CEO_FINAL dari VERIFY)
    condition: (billing) => billing.workflowType !== 'HOD',
    // > RM10,000 → CEO final; lain → terus APPROVED
    onApprove: (billing) => parseFloat(billing.totalAmount) > 10000 ? 'PENDING_CEO_FINAL' : 'APPROVED',
    onReject:  'REJECTED',
    onReturn:  'RETURNED',
  },
  {
    status:    'PENDING_CEO_FINAL',
    step:      'CEO_FINAL',
    roles:     ['ceo', 'admin'],
    condition: () => true,
    onApprove: 'APPROVED',
    onReject:  'REJECTED',
    onReturn:  'RETURNED',
  },
]

// ─── Display config untuk setiap status ──────────────────────────────────────
export const STATUS_DISPLAY = {
  DRAFT:                    { label: 'Draf',                    color: 'gray',   icon: '✏️' },
  PENDING_HOD:              { label: 'Menunggu Ketua Jabatan',  color: 'yellow', icon: '⏳' },
  PENDING_CEO:              { label: 'Menunggu CEO',            color: 'orange', icon: '⏳' },
  PENDING_FINANCE_CHECK:    { label: 'Semakan Kewangan',        color: 'blue',   icon: '🔍' },
  PENDING_FINANCE_VERIFY:   { label: 'Pengesahan Kewangan',     color: 'blue',   icon: '✅' },
  PENDING_FINANCE_APPROVAL: { label: 'Kelulusan Kewangan',      color: 'indigo', icon: '📋' },
  PENDING_CEO_FINAL:        { label: 'Kelulusan Akhir CEO',     color: 'purple', icon: '👑' },
  APPROVED:                 { label: 'Diluluskan',              color: 'green',  icon: '✅' },
  PARTIAL_PAID:             { label: 'Bayaran Separa',          color: 'teal',   icon: '💳' },
  PAID:                     { label: 'Selesai Dibayar',         color: 'green',  icon: '✔️' },
  RETURNED:                 { label: 'Dikembalikan',            color: 'orange', icon: '↩️' },
  REJECTED:                 { label: 'Ditolak',                 color: 'red',    icon: '❌' },
  CLOSED:                   { label: 'Ditutup',                 color: 'gray',   icon: '🔒' },
}

// ─── Engine: bina config untuk billing tertentu ──────────────────────────────

/**
 * Kembalikan semua step yang aktif untuk billing ini (ikut condition).
 * Hasilnya: array STEP_DEFINITIONS yang berkenaan.
 */
export function buildWorkflowSteps(billing) {
  return STEP_DEFINITIONS.filter(def => def.condition(billing))
}

/**
 * Kembalikan map { [status]: stepConfig } — sama seperti getStepConfig lama,
 * tapi dibina secara dinamik dari STEP_DEFINITIONS + condition.
 * onApprove diselesaikan kepada string (bukan fn).
 */
export function getStepConfig(billing) {
  const config = {}
  for (const def of STEP_DEFINITIONS) {
    config[def.status] = {
      role:      def.roles,
      step:      def.step,
      onApprove: typeof def.onApprove === 'function' ? def.onApprove(billing) : def.onApprove,
      onReject:  def.onReject,
      onReturn:  def.onReturn,
    }
  }
  return config
}

// ─── Step key untuk Application View (pemohon) ───────────────────────────────
// Beberapa backend status → satu step paparan (sorok detail dalaman kewangan)
const APPLICATION_STEP_MAP = [
  {
    key:      'SUBMIT',
    label:    'Draf',
    matches:  ['DRAFT', 'RETURNED'],
  },
  {
    key:      'APPROVAL',
    labelStaff: 'Kelulusan Ketua Jabatan',
    labelHod:   'Kelulusan CEO',
    matches:  ['PENDING_HOD', 'PENDING_CEO'],
  },
  {
    key:      'FINANCE',
    label:    'Proses Kewangan',
    matches:  ['PENDING_FINANCE_CHECK', 'PENDING_FINANCE_VERIFY', 'PENDING_FINANCE_APPROVAL', 'PENDING_CEO_FINAL'],
  },
  {
    key:      'PAYMENT',
    label:    'Proses Bayaran',
    matches:  ['APPROVED', 'PARTIAL_PAID'],
  },
  {
    key:      'COMPLETE',
    label:    'Selesai',
    matches:  ['PAID', 'CLOSED'],
  },
]

// ─── Queue key untuk Task View (pegawai) ─────────────────────────────────────
export const TASK_QUEUE_MAP = {
  PENDING_HOD:              { queue: 'hod_approve',      assigneeRole: ['hod', 'finance_hod', 'admin'] },
  PENDING_CEO:              { queue: 'ceo_approve',       assigneeRole: ['ceo', 'admin'] },
  PENDING_FINANCE_CHECK:    { queue: 'finance_check',     assigneeRole: ['finance', 'finance_hod', 'admin'] },
  PENDING_FINANCE_VERIFY:   { queue: 'finance_verify',    assigneeRole: ['finance', 'finance_hod', 'admin'] },
  PENDING_FINANCE_APPROVAL: { queue: 'finance_approval',  assigneeRole: ['finance_hod', 'admin'] },
  PENDING_CEO_FINAL:        { queue: 'ceo_final',         assigneeRole: ['ceo', 'admin'] },
  APPROVED:                 { queue: 'payment',           assigneeRole: ['finance', 'finance_hod', 'admin'] },
  PARTIAL_PAID:             { queue: 'payment',           assigneeRole: ['finance', 'finance_hod', 'admin'] },
}

/**
 * Bina workflow object lengkap untuk API response.
 * Ini adalah kontrak antara backend dan frontend.
 * Frontend membaca ini — bukan billing.status secara langsung.
 */
export function buildWorkflowView(billing) {
  const status       = billing.status
  const workflowType = billing.workflowType   // 'STAFF' | 'HOD'
  const isHod        = workflowType === 'HOD'

  // ── current task ──────────────────────────────────────────────────────────
  const taskDef   = TASK_QUEUE_MAP[status] ?? null
  const currentTask = taskDef
    ? { queue: taskDef.queue, assigneeRole: taskDef.assigneeRole }
    : null

  // ── application steps (step status: completed | current | pending | cancelled) ─
  const terminalStatuses = ['PAID', 'CLOSED', 'REJECTED']
  const isTerminal       = terminalStatuses.includes(status)
  const isCancelled      = ['REJECTED'].includes(status)

  const steps = APPLICATION_STEP_MAP.map(def => {
    const label    = def.labelStaff
      ? (isHod ? def.labelHod : def.labelStaff)
      : def.label

    let stepStatus
    if (def.matches.includes(status)) {
      stepStatus = isTerminal && def.key !== 'COMPLETE' ? 'cancelled' : 'current'
    } else {
      // tentukan urutan
      const currentDefIdx = APPLICATION_STEP_MAP.findIndex(d => d.matches.includes(status))
      const thisIdx       = APPLICATION_STEP_MAP.indexOf(def)
      stepStatus = thisIdx < currentDefIdx ? 'completed' : 'pending'
    }

    // jika rejected — semua selepas step semasa jadi cancelled
    if (isCancelled) {
      const currentDefIdx = APPLICATION_STEP_MAP.findIndex(d => d.matches.includes(status))
      const thisIdx       = APPLICATION_STEP_MAP.indexOf(def)
      if (thisIdx > currentDefIdx) stepStatus = 'cancelled'
    }

    return { key: def.key, label, status: stepStatus }
  })

  // ── next status (dari workflowRules) ──────────────────────────────────────
  const stepCfg   = getStepConfig(billing)
  const current   = stepCfg[status]
  const nextStatus = current?.onApprove ?? null

  return {
    currentStatus: status,
    workflowType,
    currentTask,
    nextStatus,
    steps,
  }
}

/**
 * Kembalikan { can_approve, can_reject, can_return } untuk user pada billing ini.
 * Juga termasuk next_action label untuk display.
 */
export function computeActions(billing, userRole) {
  const steps    = getStepConfig(billing)
  const stepCfg  = steps[billing.status]

  if (!stepCfg) {
    return { can_approve: false, can_reject: false, can_return: false, next_action: null }
  }

  const canAct = stepCfg.role.includes(userRole)

  return {
    can_approve:  canAct,
    can_reject:   canAct,
    can_return:   canAct,
    next_action:  canAct ? STATUS_DISPLAY[stepCfg.onApprove]?.label ?? null : null,
    step:         stepCfg.step,
    current_role: stepCfg.role,
  }
}
