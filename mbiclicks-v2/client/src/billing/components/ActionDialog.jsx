// Shared dialog untuk approve/reject/return — digunakan oleh PermohonanDetail & ApprovalQueue.
import { useState } from 'react'
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'

const CFG = {
  APPROVE: { title: 'Luluskan Permohonan', color: 'bg-green-600 hover:bg-green-700', icon: <CheckCircle className="w-5 h-5" /> },
  REJECT:  { title: 'Tolak Permohonan',    color: 'bg-red-600 hover:bg-red-700',     icon: <XCircle className="w-5 h-5" /> },
  RETURN:  { title: 'Kembalikan Permohonan', color: 'bg-orange-600 hover:bg-orange-700', icon: <RotateCcw className="w-5 h-5" /> },
}

const ICON_COLOR = { APPROVE: 'text-green-600', REJECT: 'text-red-600', RETURN: 'text-orange-600' }

export default function ActionDialog({ open, action, onClose, onConfirm, isPending }) {
  const [remarks, setRemarks] = useState('')
  if (!open || !action) return null

  const cfg        = CFG[action] ?? {}
  const needRemarks = action !== 'APPROVE'

  function handleConfirm() {
    if (needRemarks && !remarks.trim()) return
    onConfirm(remarks)
    setRemarks('')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={ICON_COLOR[action]}>{cfg.icon}</span>
          <h3 className="text-base font-semibold text-gray-900">{cfg.title}</h3>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Ulasan {needRemarks && <span className="text-red-500">*</span>}
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder={needRemarks ? 'Nyatakan sebab...' : 'Ulasan (pilihan)...'}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { onClose(); setRemarks('') }} disabled={isPending}>Batal</Button>
          <button
            disabled={isPending || (needRemarks && !remarks.trim())}
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${cfg.color}`}
          >
            {isPending && <Spinner className="w-4 h-4" />}
            Sahkan
          </button>
        </div>
      </div>
    </div>
  )
}
