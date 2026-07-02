// ADR-021: Terima vm={ApplicationViewModel} sahaja.
import { CheckCircle2, Clock, Circle, XCircle } from 'lucide-react'

const STEP_ICON = {
  completed: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  current:   <Clock className="w-4 h-4 text-blue-600" />,
  pending:   <Circle className="w-4 h-4 text-gray-300" />,
  cancelled: <XCircle className="w-4 h-4 text-red-500" />,
}

const STEP_CLS = {
  completed: 'text-green-700 font-medium',
  current:   'text-blue-700 font-semibold',
  pending:   'text-gray-400',
  cancelled: 'text-red-500',
}

export default function ApplicationTimeline({ vm }) {
  if (!vm?.steps?.length) return null

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Perjalanan Permohonan
      </h2>
      <div className="flex items-start gap-0">
        {vm.steps.map((step, i) => (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* connector line */}
            {i < vm.steps.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                step.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
            {/* icon */}
            <div className="relative z-10 bg-white">{STEP_ICON[step.status] ?? STEP_ICON.pending}</div>
            {/* label */}
            <span className={`mt-2 text-[11px] text-center leading-tight ${STEP_CLS[step.status] ?? STEP_CLS.pending}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
