// DashboardViewModel — transforms /me/summary into display-ready cards.
// Page reads vm only; no role logic in React.

export const DashboardViewModel = {
  build({ summary, viewer }) {
    const role  = viewer?.role?.slug ?? ''
    const app   = summary?.application ?? {}
    const tasks = summary?.tasks ?? {}

    const applicationCards = []
    if (app.active > 0 || app.pendingApproval > 0 || app.waitingPayment > 0 || app.partialPayment > 0) {
      if (app.active !== undefined)         applicationCards.push({ key: 'active',         count: app.active,         label: 'Permohonan Aktif',       color: 'blue',   navigateTo: '/permohonan' })
      if (app.pendingApproval !== undefined) applicationCards.push({ key: 'pendingApproval', count: app.pendingApproval, label: 'Menunggu Kelulusan',      color: 'yellow', navigateTo: '/permohonan' })
      if (app.waitingPayment !== undefined)  applicationCards.push({ key: 'waitingPayment',  count: app.waitingPayment,  label: 'Menunggu Bayaran',        color: 'green',  navigateTo: '/permohonan' })
      if (app.partialPayment !== undefined)  applicationCards.push({ key: 'partialPayment',  count: app.partialPayment,  label: 'Bayaran Ansuran',         color: 'teal',   navigateTo: '/permohonan' })
    }
    if (app.completed !== undefined) {
      applicationCards.push({ key: 'completed', count: app.completed, label: 'Selesai', color: 'gray', navigateTo: '/sejarah' })
    }

    const taskCards = []
    if (tasks.hodApproval)    taskCards.push({ key: 'hodApproval',    count: tasks.hodApproval,    label: 'Kelulusan Jabatan',    color: 'yellow', navigateTo: '/tindakan?queue=pending_hod' })
    if (tasks.ceoApproval)    taskCards.push({ key: 'ceoApproval',    count: tasks.ceoApproval,    label: 'Kelulusan CEO',        color: 'orange', navigateTo: '/tindakan?queue=pending_ceo' })
    if (tasks.ceoFinal)       taskCards.push({ key: 'ceoFinal',       count: tasks.ceoFinal,       label: 'Kelulusan Muktamad',   color: 'purple', navigateTo: '/tindakan?queue=pending_ceo_final' })
    if (tasks.financeCheck)   taskCards.push({ key: 'financeCheck',   count: tasks.financeCheck,   label: 'Semakan Kewangan',     color: 'blue',   navigateTo: '/tindakan?queue=pending_finance_check' })
    if (tasks.financeVerify)  taskCards.push({ key: 'financeVerify',  count: tasks.financeVerify,  label: 'Pengesahan Kewangan',  color: 'indigo', navigateTo: '/tindakan?queue=pending_finance_verify' })
    if (tasks.financeApproval)taskCards.push({ key: 'financeApproval',count: tasks.financeApproval,label: 'Kelulusan Kewangan',   color: 'purple', navigateTo: '/tindakan?queue=pending_finance_approval' })
    if (tasks.payment)        taskCards.push({ key: 'payment',        count: tasks.payment,        label: 'Perlu Dibayar',        color: 'green',  navigateTo: '/tindakan?queue=approved' })

    const showApplicationSection = applicationCards.length > 0
    const showTaskSection        = taskCards.length > 0

    const greeting = _greeting(viewer?.name)
    const hasWork  = tasks.total > 0

    return {
      greeting,
      hasWork,
      totalTasks: tasks.total ?? 0,
      applicationCards,
      taskCards,
      showApplicationSection,
      showTaskSection,
    }
  },
}

function _greeting(name) {
  const hour = new Date().getHours()
  const salutation = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat tengah hari' : 'Selamat petang'
  const first = name?.split(' ')[0] ?? ''
  return first ? `${salutation}, ${first}` : salutation
}
