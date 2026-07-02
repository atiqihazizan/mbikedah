/**
 * TaskViewModel
 *
 * Context: Pegawai — "Apa kerja saya hari ini?"
 * Return null jika tiada tugasan untuk viewer pada billing ini.
 *
 * ADR-008: React membaca vm.x sahaja.
 * [COMPATIBILITY LAYER] — assigneeRole dari workflow.currentTask.assigneeRole
 * masih bergantung pada role.slug. Migration path: permission-based step access.
 */

// ─── Label tugasan dalam Bahasa Melayu ───────────────────────────────────────
const TASK_LABELS = {
  hod_approve:      'Menunggu Kelulusan',
  ceo_approve:      'Menunggu Kelulusan CEO',
  finance_check:    'Menunggu Semakan',
  finance_verify:   'Menunggu Pengesahan',
  finance_approval: 'Menunggu Kelulusan Ketua Pegawai Kewangan',
  ceo_final:        'Menunggu Kelulusan Muktamad',
  payment:          'Menunggu Proses Bayaran',
}

// ─── Display config per priority ─────────────────────────────────────────────
const PRIORITY_DISPLAY = {
  urgent: { color: 'red',    badge: 'Urgent',  icon: 'fire'   },
  high:   { color: 'orange', badge: 'Segera',  icon: 'clock'  },
  normal: { color: 'blue',   badge: 'Normal',  icon: 'circle' },
}

// ─── Actions yang dibenarkan per queue ───────────────────────────────────────
const QUEUE_ACTIONS = {
  hod_approve:      ['APPROVE', 'RETURN', 'REJECT'],
  ceo_approve:      ['APPROVE', 'RETURN', 'REJECT'],
  finance_check:    ['APPROVE', 'RETURN', 'REJECT'],
  finance_verify:   ['APPROVE', 'RETURN', 'REJECT'],
  finance_approval: ['APPROVE', 'RETURN', 'REJECT'],
  ceo_final:        ['APPROVE', 'RETURN', 'REJECT'],
  payment:          ['PAY'],
}

// ─── TaskViewModel ────────────────────────────────────────────────────────────
export const TaskViewModel = {
  /**
   * @param {{ billing, workflow, viewer: { id, role: { slug } } }} data
   * @returns {Object|null} ViewModel atau null jika bukan tugasan viewer
   */
  build({ billing, workflow, viewer }) {
    if (!billing || !workflow || !viewer) return null

    const currentTask = workflow.currentTask
    if (!currentTask) return null

    // Semak sama ada viewer ialah assignee
    // [COMPATIBILITY LAYER] — guna role.slug
    const assigneeRoles = currentTask.assigneeRole ?? []
    const viewerRole    = viewer.role?.slug
    if (!assigneeRoles.includes(viewerRole)) return null

    const queue      = currentTask.queue
    const title      = TASK_LABELS[queue] ?? queue
    const actions    = QUEUE_ACTIONS[queue] ?? []
    const daysWaiting = _computeDaysWaiting(billing.updatedAt)
    const priority    = _computePriority(daysWaiting)
    const display     = PRIORITY_DISPLAY[priority] ?? PRIORITY_DISPLAY.normal

    return {
      billingId:   billing.id,
      refNo:       billing.refNo,
      queue,
      title,
      amount:      parseFloat(billing.totalAmount ?? 0),
      applicant:   billing.applicant?.name ?? '—',
      department:  billing.department?.name ?? '—',
      daysWaiting,
      priority,
      isUrgent:    priority === 'urgent',
      actions,
      display,
    }
  },

  /**
   * Build dari items /me/tasks (list context — data lebih ringkas)
   */
  buildFromTaskItem(item) {
    const priority = item.priority ?? _computePriority(item.daysWaiting ?? 0)
    const display  = PRIORITY_DISPLAY[priority] ?? PRIORITY_DISPLAY.normal
    const title    = TASK_LABELS[item.queue] ?? item.queue

    return {
      billingId:   item.billingId,
      refNo:       item.refNo,
      queue:       item.queue,
      title,
      amount:      item.amount,
      applicant:   item.applicant,
      department:  item.department,
      daysWaiting: item.daysWaiting,
      priority,
      isUrgent:    item.isUrgent ?? priority === 'urgent',
      display,
    }
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _computeDaysWaiting(updatedAt) {
  if (!updatedAt) return 0
  return Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86_400_000)
}

function _computePriority(days) {
  if (days >= 3) return 'urgent'
  if (days >= 1) return 'high'
  return 'normal'
}
