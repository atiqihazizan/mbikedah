import { AlertCircle } from 'lucide-react'

export default function ErrorState({ error, onRetry, className = 'p-6' }) {
  const msg = error?.message ?? 'Ralat tidak diketahui. Cuba semula.'
  const isForbidden = error?.status === 403 || error?.code === 'FORBIDDEN'
  const isNotFound  = error?.status === 404 || error?.code === 'NOT_FOUND'

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg flex items-start gap-4 ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-900">
          {isForbidden ? 'Tiada kebenaran' : isNotFound ? 'Rekod tidak dijumpai' : 'Ralat'}
        </p>
        <p className="text-sm text-red-700 mt-0.5">{msg}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline">
            Cuba semula
          </button>
        )}
      </div>
    </div>
  )
}
