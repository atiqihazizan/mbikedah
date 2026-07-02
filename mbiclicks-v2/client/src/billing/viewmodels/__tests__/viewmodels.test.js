import { describe, test, expect } from 'vitest'
import { ApplicationViewModel } from '../application.viewmodel.js'
import { TaskViewModel }        from '../task.viewmodel.js'
import { PaymentViewModel }     from '../payment.viewmodel.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeWorkflow(overrides = {}) {
  return {
    currentStatus: 'PENDING_FINANCE_VERIFY',
    workflowType:  'STAFF',
    currentTask: {
      queue:        'finance_verify',
      assigneeRole: ['finance', 'finance_hod', 'admin'],
    },
    steps: [
      { key: 'SUBMIT',   label: 'Draf',                    status: 'completed' },
      { key: 'APPROVAL', label: 'Kelulusan Ketua Jabatan', status: 'completed' },
      { key: 'FINANCE',  label: 'Proses Kewangan',         status: 'current'   },
      { key: 'PAYMENT',  label: 'Proses Bayaran',          status: 'pending'   },
      { key: 'COMPLETE', label: 'Selesai',                 status: 'pending'   },
    ],
    ...overrides,
  }
}

function makeBilling(overrides = {}) {
  return {
    id:           12,
    refNo:        'INV/2026/0012',
    applicantId:  5,
    departmentId: 2,
    totalAmount:  15000,
    workflowType: 'STAFF',
    status:       'PENDING_FINANCE_VERIFY',
    description:  'Bayaran perkhidmatan',
    updatedAt:    new Date(Date.now() - 2 * 86_400_000).toISOString(), // 2 hari lalu
    applicant:    { name: 'Ahmad Ali' },
    department:   { name: 'Jabatan Kewangan' },
    ...overrides,
  }
}

// ─── ApplicationViewModel ─────────────────────────────────────────────────────

describe('ApplicationViewModel', () => {
  test('pulangkan null jika tiada billing', () => {
    expect(ApplicationViewModel.build({ billing: null, workflow: makeWorkflow() })).toBeNull()
  })

  test('step 3 aktif untuk PENDING_FINANCE_VERIFY', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling(), workflow: makeWorkflow() })
    expect(vm.currentStepIndex).toBe(3)
    expect(vm.status).toBe('Proses Kewangan')
  })

  test('progress dikira berdasarkan completed steps', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling(), workflow: makeWorkflow() })
    // 2 completed dari 5 → 40%
    expect(vm.progress).toBe(40)
    expect(vm.totalSteps).toBe(5)
  })

  test('display.badge betul untuk FINANCE step', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling(), workflow: makeWorkflow() })
    expect(vm.display.badge).toBe('Sedang Diproses')
    expect(vm.display.color).toBe('blue')
  })

  test('HOD workflow — label step 2 ialah Kelulusan CEO', () => {
    const workflow = makeWorkflow({
      workflowType: 'HOD',
      steps: [
        { key: 'SUBMIT',   label: 'Draf',           status: 'completed' },
        { key: 'APPROVAL', label: 'Kelulusan CEO',  status: 'current'   },
        { key: 'FINANCE',  label: 'Proses Kewangan', status: 'pending'  },
        { key: 'PAYMENT',  label: 'Proses Bayaran', status: 'pending'   },
        { key: 'COMPLETE', label: 'Selesai',         status: 'pending'  },
      ],
    })
    const vm = ApplicationViewModel.build({
      billing: makeBilling({ workflowType: 'HOD', status: 'PENDING_CEO' }),
      workflow,
    })
    expect(vm.currentStepIndex).toBe(2)
    const approvalStep = vm.steps.find(s => s.key === 'APPROVAL')
    expect(approvalStep.label).toBe('Kelulusan CEO')
  })

  test('paymentSummary null jika tiada bayaran', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling(), workflow: makeWorkflow(), payments: [] })
    expect(vm.paymentSummary).toBeNull()
  })

  test('paymentSummary dikira dengan betul', () => {
    const payments = [
      { amount: 5000, paidAt: '2026-07-12T10:00:00Z', paymentRef: 'REF-001', phase: 1 },
      { amount: 3000, paidAt: '2026-07-22T10:00:00Z', paymentRef: 'REF-002', phase: 2 },
    ]
    const vm = ApplicationViewModel.build({ billing: makeBilling(), workflow: makeWorkflow(), payments })
    expect(vm.paymentSummary.paidAmount).toBe(8000)
    expect(vm.paymentSummary.balanceAmount).toBe(7000)
    expect(vm.paymentSummary.paymentCount).toBe(2)
    expect(vm.paymentSummary.lastPaymentReference).toBe('REF-002')
    expect(vm.paymentSummary.isCompleted).toBe(false)
  })
})

// ─── ApplicationViewModel — flags baru (viewer, isLocked, canEdit) ───────────

describe('ApplicationViewModel — viewer flags', () => {
  const viewer = { id: 5, role: { slug: 'staff' } }

  test('isOwner true jika viewer ialah pemohon', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling({ applicantId: 5 }), workflow: makeWorkflow(), viewer })
    expect(vm.isOwner).toBe(true)
  })

  test('isOwner false jika bukan pemohon', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling({ applicantId: 99 }), workflow: makeWorkflow(), viewer })
    expect(vm.isOwner).toBe(false)
  })

  test('isOwner null jika tiada viewer', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling(), workflow: makeWorkflow() })
    expect(vm.isOwner).toBeNull()
  })

  test('canEdit true jika owner dan DRAFT', () => {
    const billing = makeBilling({ applicantId: 5, status: 'DRAFT' })
    const workflow = makeWorkflow({ currentStatus: 'DRAFT', steps: [
      { key: 'SUBMIT', label: 'Draf', status: 'current' },
      { key: 'APPROVAL', label: 'Kelulusan', status: 'pending' },
      { key: 'FINANCE', label: 'Kewangan', status: 'pending' },
      { key: 'PAYMENT', label: 'Bayaran', status: 'pending' },
      { key: 'COMPLETE', label: 'Selesai', status: 'pending' },
    ]})
    const vm = ApplicationViewModel.build({ billing, workflow, viewer })
    expect(vm.canEdit).toBe(true)
  })

  test('canEdit false jika owner tetapi PENDING (dalam proses)', () => {
    const billing = makeBilling({ applicantId: 5 }) // status PENDING_FINANCE_VERIFY
    const vm = ApplicationViewModel.build({ billing, workflow: makeWorkflow(), viewer })
    expect(vm.canEdit).toBe(false)
  })

  test('isLocked true jika REJECTED', () => {
    const billing = makeBilling({ status: 'REJECTED' })
    const workflow = makeWorkflow({ currentStatus: 'REJECTED', steps: [
      { key: 'SUBMIT',   label: 'Draf',      status: 'current'   },
      { key: 'APPROVAL', label: 'Kelulusan', status: 'cancelled' },
      { key: 'FINANCE',  label: 'Kewangan',  status: 'cancelled' },
      { key: 'PAYMENT',  label: 'Bayaran',   status: 'cancelled' },
      { key: 'COMPLETE', label: 'Selesai',   status: 'cancelled' },
    ]})
    const vm = ApplicationViewModel.build({ billing, workflow, viewer })
    expect(vm.isLocked).toBe(true)
    expect(vm.lockedMessage).toBe('Permohonan ini telah ditolak dan tidak boleh diubah.')
  })

  test('isLocked false jika masih dalam proses', () => {
    const vm = ApplicationViewModel.build({ billing: makeBilling(), workflow: makeWorkflow(), viewer })
    expect(vm.isLocked).toBe(false)
    expect(vm.lockedMessage).toBeNull()
  })

  test('isLocked true jika PAID', () => {
    const billing = makeBilling({ status: 'PAID' })
    const workflow = makeWorkflow({ currentStatus: 'PAID', steps: [
      { key: 'SUBMIT',   label: 'Draf',    status: 'completed' },
      { key: 'APPROVAL', label: 'Kelulusan', status: 'completed' },
      { key: 'FINANCE',  label: 'Kewangan', status: 'completed' },
      { key: 'PAYMENT',  label: 'Bayaran',  status: 'completed' },
      { key: 'COMPLETE', label: 'Selesai',  status: 'current'   },
    ]})
    const vm = ApplicationViewModel.build({ billing, workflow, viewer })
    expect(vm.isLocked).toBe(true)
    expect(vm.canEdit).toBe(false)
  })
})

// ─── TaskViewModel ────────────────────────────────────────────────────────────

describe('TaskViewModel', () => {
  const viewer = { id: 10, role: { slug: 'finance' } }

  test('pulangkan null jika tiada currentTask', () => {
    const workflow = makeWorkflow({ currentTask: null })
    expect(TaskViewModel.build({ billing: makeBilling(), workflow, viewer })).toBeNull()
  })

  test('pulangkan null jika viewer bukan assignee', () => {
    const viewerHod = { id: 20, role: { slug: 'hod' } }
    const vm = TaskViewModel.build({ billing: makeBilling(), workflow: makeWorkflow(), viewer: viewerHod })
    expect(vm).toBeNull()
  })

  test('pulangkan ViewModel jika finance pada finance_verify', () => {
    const vm = TaskViewModel.build({ billing: makeBilling(), workflow: makeWorkflow(), viewer })
    expect(vm).not.toBeNull()
    expect(vm.queue).toBe('finance_verify')
    expect(vm.title).toBe('Menunggu Pengesahan')
    expect(vm.actions).toContain('APPROVE')
    expect(vm.actions).toContain('REJECT')
    expect(vm.actions).toContain('RETURN')
  })

  test('priority high jika 2 hari menunggu', () => {
    const vm = TaskViewModel.build({ billing: makeBilling(), workflow: makeWorkflow(), viewer })
    expect(vm.daysWaiting).toBe(2)
    expect(vm.priority).toBe('high')
    expect(vm.isUrgent).toBe(false)
  })

  test('priority urgent jika 3+ hari menunggu', () => {
    const old = makeBilling({ updatedAt: new Date(Date.now() - 4 * 86_400_000).toISOString() })
    const vm = TaskViewModel.build({ billing: old, workflow: makeWorkflow(), viewer })
    expect(vm.priority).toBe('urgent')
    expect(vm.isUrgent).toBe(true)
    expect(vm.display.color).toBe('red')
  })

  test('HOD task — title "Menunggu Kelulusan"', () => {
    const workflow = makeWorkflow({
      currentTask: { queue: 'hod_approve', assigneeRole: ['hod', 'finance_hod', 'admin'] },
    })
    const viewerHod = { id: 20, role: { slug: 'hod' } }
    const vm = TaskViewModel.build({ billing: makeBilling(), workflow, viewer: viewerHod })
    expect(vm.title).toBe('Menunggu Kelulusan')
  })

  test('payment task — action PAY sahaja', () => {
    const workflow = makeWorkflow({
      currentTask:   { queue: 'payment', assigneeRole: ['finance', 'finance_hod', 'admin'] },
      currentStatus: 'APPROVED',
    })
    const vm = TaskViewModel.build({ billing: makeBilling({ status: 'APPROVED' }), workflow, viewer })
    expect(vm.actions).toEqual(['PAY'])
  })
})

// ─── TaskViewModel.buildFromTaskItem (TD-002) ─────────────────────────────────

describe('TaskViewModel.buildFromTaskItem', () => {
  function makeTaskItem(overrides = {}) {
    return {
      billingId:   1,
      refNo:       'INV/2026/0001',
      queue:       'finance_verify',
      amount:      5000,
      applicant:   'Ahmad Ali',
      department:  'Jabatan Kewangan',
      daysWaiting: 1,
      priority:    'high',
      isUrgent:    false,
      ...overrides,
    }
  }

  test('bina VM dari task item dengan betul', () => {
    const vm = TaskViewModel.buildFromTaskItem(makeTaskItem())
    expect(vm.billingId).toBe(1)
    expect(vm.refNo).toBe('INV/2026/0001')
    expect(vm.queue).toBe('finance_verify')
    expect(vm.title).toBe('Menunggu Pengesahan')
    expect(vm.amount).toBe(5000)
    expect(vm.applicant).toBe('Ahmad Ali')
    expect(vm.department).toBe('Jabatan Kewangan')
    expect(vm.priority).toBe('high')
    expect(vm.isUrgent).toBe(false)
  })

  test('display.color orange untuk priority high', () => {
    const vm = TaskViewModel.buildFromTaskItem(makeTaskItem({ priority: 'high' }))
    expect(vm.display.color).toBe('orange')
    expect(vm.display.badge).toBe('Segera')
  })

  test('display.color red untuk priority urgent', () => {
    const vm = TaskViewModel.buildFromTaskItem(makeTaskItem({ priority: 'urgent', isUrgent: true, daysWaiting: 4 }))
    expect(vm.display.color).toBe('red')
    expect(vm.isUrgent).toBe(true)
  })

  test('display.color blue untuk priority normal', () => {
    const vm = TaskViewModel.buildFromTaskItem(makeTaskItem({ priority: 'normal', daysWaiting: 0 }))
    expect(vm.display.color).toBe('blue')
  })

  test('kira priority dari daysWaiting jika priority tidak diberikan', () => {
    // isUrgent: undefined supaya fallback kepada priority === 'urgent'
    const item = makeTaskItem({ priority: undefined, daysWaiting: 5, isUrgent: undefined })
    const vm = TaskViewModel.buildFromTaskItem(item)
    expect(vm.priority).toBe('urgent')
    expect(vm.isUrgent).toBe(true)
  })

  test('title betul untuk setiap queue', () => {
    const cases = [
      { queue: 'hod_approve',      title: 'Menunggu Kelulusan' },
      { queue: 'ceo_approve',      title: 'Menunggu Kelulusan CEO' },
      { queue: 'finance_check',    title: 'Menunggu Semakan' },
      { queue: 'finance_verify',   title: 'Menunggu Pengesahan' },
      { queue: 'finance_approval', title: 'Menunggu Kelulusan Ketua Pegawai Kewangan' },
      { queue: 'ceo_final',        title: 'Menunggu Kelulusan Muktamad' },
      { queue: 'payment',          title: 'Menunggu Proses Bayaran' },
    ]
    for (const { queue, title } of cases) {
      const vm = TaskViewModel.buildFromTaskItem(makeTaskItem({ queue }))
      expect(vm.title, `queue: ${queue}`).toBe(title)
    }
  })
})

// ─── PaymentViewModel ─────────────────────────────────────────────────────────

describe('PaymentViewModel', () => {
  test('pulangkan null jika tiada billing', () => {
    expect(PaymentViewModel.build({ billing: null })).toBeNull()
  })

  test('status PENDING jika tiada bayaran', () => {
    const vm = PaymentViewModel.build({ billing: makeBilling(), payments: [] })
    expect(vm.paymentSummary.status).toBe('PENDING')
    expect(vm.paymentSummary.paidAmount).toBe(0)
    expect(vm.paymentSummary.nextAction).toBe('WAIT_PAYMENT')
    expect(vm.timeline).toBeNull()
  })

  test('status PARTIAL jika ada bayaran separa', () => {
    const payments = [
      { amount: 5000, paidAt: '2026-07-12T10:00:00Z', paymentRef: 'REF-001', phase: 1 },
    ]
    const vm = PaymentViewModel.build({ billing: makeBilling(), payments })
    expect(vm.paymentSummary.status).toBe('PARTIAL')
    expect(vm.paymentSummary.paidAmount).toBe(5000)
    expect(vm.paymentSummary.balanceAmount).toBe(10000)
    expect(vm.paymentSummary.remainingPercentage).toBe(67)
    expect(vm.paymentSummary.lastPaymentReference).toBe('REF-001')
    expect(vm.paymentSummary.isCompleted).toBe(false)
    expect(vm.paymentSummary.nextAction).toBe('WAIT_PAYMENT')
  })

  test('status PAID jika jumlah penuh dibayar', () => {
    const payments = [
      { amount: 15000, paidAt: '2026-07-15T10:00:00Z', paymentRef: 'REF-FULL', phase: 1 },
    ]
    const vm = PaymentViewModel.build({
      billing: makeBilling({ status: 'PAID', totalAmount: 15000 }),
      payments,
    })
    expect(vm.paymentSummary.status).toBe('PAID')
    expect(vm.paymentSummary.isCompleted).toBe(true)
    expect(vm.paymentSummary.nextAction).toBe('COMPLETED')
  })

  test('transactions disusun mengikut tarikh', () => {
    const payments = [
      { amount: 5000, paidAt: '2026-07-22T10:00:00Z', paymentRef: 'REF-002', phase: 2 },
      { amount: 3000, paidAt: '2026-07-12T10:00:00Z', paymentRef: 'REF-001', phase: 1 },
    ]
    const vm = PaymentViewModel.build({ billing: makeBilling(), payments })
    expect(vm.transactions[0].reference).toBe('REF-001') // terdahulu dulu
    expect(vm.transactions[1].reference).toBe('REF-002')
    expect(vm.transactions[0].label).toBe('Ansuran Pertama')
    expect(vm.transactions[1].label).toBe('Bayaran Akhir')
  })

  test('timeline papar ringkasan — bukan senarai', () => {
    const payments = [
      { amount: 8000, paidAt: '2026-07-22T10:00:00Z', paymentRef: 'REF-001', phase: 1 },
    ]
    const vm = PaymentViewModel.build({ billing: makeBilling(), payments })
    expect(vm.timeline).not.toBeNull()
    expect(vm.timeline.paidAmount).toBe(8000)
    expect(vm.timeline.balanceAmount).toBe(7000)
    // timeline BUKAN transactions — tiada array item
    expect(vm.timeline.items).toBeUndefined()
  })

  test('nextAction STOPPED jika billing CLOSED', () => {
    const payments = [
      { amount: 5000, paidAt: '2026-07-12T10:00:00Z', paymentRef: 'REF-001', phase: 1 },
    ]
    const vm = PaymentViewModel.build({
      billing: makeBilling({ status: 'CLOSED' }),
      payments,
    })
    expect(vm.paymentSummary.nextAction).toBe('STOPPED')
    expect(vm.paymentSummary.status).toBe('STOPPED')
  })
})
