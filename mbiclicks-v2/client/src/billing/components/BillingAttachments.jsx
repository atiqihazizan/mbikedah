// Section: Lampiran — view + edit mode.
import { FileText, Upload, X } from 'lucide-react'
import { BillingService } from '@/billing/services/BillingService'

export default function BillingAttachments({ editMode, billingId, attachments, pendingFiles, onDeleteAtt, onFilePick, onFileRemove }) {
  const hasAttachments = attachments.length > 0 || pendingFiles.length > 0

  if (!editMode && !hasAttachments) return null

  function handleFileChange(e) {
    const picked  = Array.from(e.target.files)
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    const valid   = picked.filter(f => allowed.includes(f.type) && f.size <= 10 * 1024 * 1024)
    onFilePick(valid)
    e.target.value = ''
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Lampiran {editMode && !billingId && <span className="text-red-500">*</span>}
      </h2>
      <div className="space-y-2">
        {attachments.map(att => (
          <div key={att.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-2">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <a href={BillingService.downloadUrl(billingId, att.id)} target="_blank" rel="noreferrer"
              className="text-blue-600 hover:underline truncate flex-1">{att.originalName}</a>
            <span className="text-xs text-gray-400">{(att.size / 1024).toFixed(0)} KB</span>
            {editMode && (
              <button onClick={() => onDeleteAtt(att.id)} className="text-gray-300 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {pendingFiles.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-sm bg-blue-50 rounded px-3 py-2">
            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate flex-1 text-gray-700">{f.name}</span>
            <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
            <button onClick={() => onFileRemove(i)} className="text-gray-300 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      {editMode && (
        <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors w-fit mt-3">
          <Upload className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Pilih Fail</span>
          <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={handleFileChange} />
        </label>
      )}
    </section>
  )
}
