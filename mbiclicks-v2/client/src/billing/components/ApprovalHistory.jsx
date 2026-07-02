// ADR-021: Terima history array daripada API contract (approvalHistory).

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const ACTION_LABEL = {
  SUBMIT: 'Dihantar', APPROVE: 'Diluluskan', VERIFY: 'Disahkan',
  REJECT: 'Ditolak',  RETURN:  'Dikembalikan', PAY: 'Dibayar',
}
const ACTION_COLOR = {
  SUBMIT: 'text-blue-600', APPROVE: 'text-green-600', VERIFY: 'text-green-600',
  REJECT: 'text-red-600',  RETURN:  'text-orange-600', PAY: 'text-teal-600',
}
const STEP_LABEL = {
  SUBMIT: 'Pemohon', HOD: 'Ketua Jabatan', CEO: 'Ketua Eksekutif',
  FINANCE_CHECK: 'Semakan Kewangan', FINANCE_VERIFY: 'Pengesahan Kewangan',
  FINANCE_APPROVAL: 'Kelulusan Kewangan', PAYMENT: 'Pembayaran',
}
const DOT_COLOR = {
  APPROVE: 'bg-green-600', REJECT: 'bg-red-600', RETURN: 'bg-orange-500',
  SUBMIT: 'bg-blue-600', PAY: 'bg-teal-600', VERIFY: 'bg-green-600',
}

export default function ApprovalHistory({ history = [] }) {
  if (!history.length) return null

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Sejarah Tindakan</h2>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
        <div className="space-y-4">
          {history.map((appr) => (
            <div key={appr.id} className="relative flex gap-4 pl-10">
              <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white top-1 ${DOT_COLOR[appr.action] ?? 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${ACTION_COLOR[appr.action] ?? 'text-gray-600'}`}>
                    {ACTION_LABEL[appr.action] ?? appr.action}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{STEP_LABEL[appr.step] ?? appr.step}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {appr.actor?.name}
                  {appr.actor?.position?.name && <span className="ml-1">· {appr.actor.position.name}</span>}
                  <span className="ml-2">· {fmtDate(appr.actionedAt)}</span>
                </div>
                {appr.remarks && (
                  <div className="mt-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 italic">
                    "{appr.remarks}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
