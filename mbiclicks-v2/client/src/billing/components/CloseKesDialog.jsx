import { useState } from 'react'
import { XCircle, X } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'

function fmtRM(v) {
  return 'RM ' + (parseFloat(v) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ADR-021: Terima payVm dari PaymentViewModel.
export default function CloseKesDialog({ payVm, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState('')
  const paid      = payVm?.paymentSummary?.paidAmount ?? 0
  const remaining = payVm?.paymentSummary?.balanceAmount ?? 0

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" /> Tutup Kes
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (reason.trim()) onConfirm(reason.trim()) }}
          className="px-5 py-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-1">
            {paid > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>Sudah dibayar</span>
                <span className="font-medium">{fmtRM(paid)}</span>
              </div>
            )}
            <div className="flex justify-between text-red-700 font-medium">
              <span>Baki tidak akan dibayar</span>
              <span>{fmtRM(remaining)}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Sebab Penutupan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Contoh: Kerja tidak disiapkan, kontrak dibatalkan..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isPending || !reason.trim()} className="bg-red-600 hover:bg-red-700 text-white">
              {isPending ? <Spinner size="sm" /> : 'Sahkan Tutup Kes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
