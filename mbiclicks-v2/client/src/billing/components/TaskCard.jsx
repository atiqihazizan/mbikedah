// ADR-021: Terima vm dari TaskViewModel.buildFromTaskItem().
// Guna dalam halaman "Tindakan" (inbox).
import VmStatusBadge from './VmStatusBadge'
import { Clock, AlertCircle } from 'lucide-react'

function fmtRM(v) {
  return 'RM ' + (parseFloat(v) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PRIORITY_CLS = {
  urgent: 'border-l-4 border-l-red-500',
  high:   'border-l-4 border-l-orange-400',
  normal: 'border-l-4 border-l-gray-200',
}

export default function TaskCard({ vm, onClick }) {
  if (!vm) return null

  const priorityCls = PRIORITY_CLS[vm.priority] ?? PRIORITY_CLS.normal
  const isUrgent    = vm.priority === 'urgent'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all ${priorityCls}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <VmStatusBadge display={vm.display} />
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                <AlertCircle className="w-3 h-3" /> Urgent
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">{vm.refNo}</p>
          <p className="text-xs text-gray-500 mt-0.5">{vm.applicant} · {vm.department}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-gray-900">{fmtRM(vm.amount)}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 justify-end">
            <Clock className="w-3 h-3" />
            <span>{vm.daysWaiting} hari</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-blue-600 font-medium mt-2 text-right">Buka →</p>
    </button>
  )
}
