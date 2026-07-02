// ADR-032: Sidebar is Navigation Layer only.
// This ViewModel builds NavigationModel from /me/summary data + current location.
// No role logic, no status comparisons, no workflow knowledge in Sidebar.jsx.

const TASK_CONFIG = [
  { key: 'hodApproval',     label: 'Kelulusan Jabatan', status: 'PENDING_HOD',               queue: null        },
  { key: 'ceoApproval',     label: 'Kelulusan CEO',     status: 'PENDING_CEO',               queue: null        },
  { key: 'ceoFinal',        label: 'Kelulusan Muktamad',status: 'PENDING_CEO_FINAL',         queue: null        },
  { key: 'financeCheck',    label: 'Semakan',            status: 'PENDING_FINANCE_CHECK',     queue: null        },
  { key: 'financeVerify',   label: 'Pengesahan',         status: 'PENDING_FINANCE_VERIFY',    queue: null        },
  { key: 'financeApproval', label: 'Kelulusan KPK',      status: 'PENDING_FINANCE_APPROVAL',  queue: null        },
  // payment covers APPROVED + PARTIAL_PAID — no single status, use ?queue= to distinguish from Aktif
  { key: 'payment',         label: 'Bayaran',            status: null,                        queue: 'payment'   },
]

function buildTaskItems(tasks, currentStatus, currentQueue) {
  return TASK_CONFIG
    .filter(cfg => (tasks[cfg.key] ?? 0) > 0)
    .map(cfg => {
      const to       = cfg.status ? `/permohonan?status=${cfg.status}` : `/permohonan?queue=${cfg.queue}`
      const isActive = cfg.status
        ? currentStatus === cfg.status
        : currentQueue === cfg.queue
      return { key: cfg.key, label: cfg.label, count: tasks[cfg.key], to, isActive }
    })
}

export function buildSidebarNav({ summary, location }) {
  const tasks         = summary?.tasks ?? {}
  const params        = new URLSearchParams(location.search)
  const currentStatus = params.get('status') ?? ''
  const currentQueue  = params.get('queue') ?? ''

  const taskItems        = buildTaskItems(tasks, currentStatus, currentQueue)
  const totalTasks       = taskItems.reduce((sum, item) => sum + item.count, 0)
  const isTindakanActive = taskItems.some(item => item.isActive)

  // Aktif = /permohonan with no PENDING_ status and no ?queue= (i.e. not a task context URL)
  const isAktifActive =
    location.pathname === '/permohonan' &&
    !currentStatus.startsWith('PENDING_') &&
    currentQueue === ''

  return {
    permohonan: {
      isActive: location.pathname.startsWith('/permohonan') && !isTindakanActive && location.pathname !== '/permohonan/baru',
      items: [
        { key: 'aktif',   label: 'Aktif',   to: '/permohonan',         isActive: isAktifActive },
        { key: 'sejarah', label: 'Selesai',  to: '/permohonan/sejarah', isActive: location.pathname === '/permohonan/sejarah' },
      ],
    },
    tindakan: {
      totalCount: totalTasks,
      hasItems:   taskItems.length > 0,
      isActive:   isTindakanActive,
      items:      taskItems,
    },
  }
}
