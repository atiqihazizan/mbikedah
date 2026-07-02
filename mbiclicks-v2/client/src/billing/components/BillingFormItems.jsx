// Section B: Maklumat Keperluan (butiran item) — view + edit mode.
import { Plus, Trash2 } from 'lucide-react'
import { Input, Label, SearchableSelect } from '@/components/ui'

function fmtRM(v) {
  return 'RM ' + (parseFloat(v) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BillingFormItems({ editMode, billing, items, accounts, onAddItem, onRemoveItem, onUpdateItem }) {
  const total    = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.unitCost) || 0), 0)
  const accOpts  = accounts.map(a => ({ value: a.accNo, label: a.accNo, sub: a.name }))
  const viewItems = editMode ? items : (billing?.items ?? [])

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">B: Maklumat Keperluan</h2>
        {editMode && <span className="text-xs text-gray-400">JUMLAH: {fmtRM(total)}</span>}
      </div>
      <div className="space-y-3">
        {viewItems.map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-700 text-sm">Butiran #{idx + 1}</h4>
              {editMode && items.length > 1 && (
                <button onClick={() => onRemoveItem(idx)} className="text-gray-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mb-3">
              <Label className="text-xs text-gray-500">Butir Bekalan / Perkhidmatan</Label>
              {editMode ? (
                <textarea className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mt-1"
                  rows={2} placeholder="Butiran bekalan/perkhidmatan..."
                  value={item.description}
                  onChange={e => onUpdateItem(idx, 'description', e.target.value)} />
              ) : (
                <p className="mt-1 text-sm text-gray-700">{item.description}</p>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Kod Bajet</Label>
                {editMode ? (
                  <SearchableSelect value={item.accNo} onChange={v => onUpdateItem(idx, 'accNo', v ?? '')}
                    options={accOpts} placeholder="—" clearable
                    renderOption={opt => (
                      <div className='ml-3'>
                        <div className="font-mono text-xs text-gray-500">{opt.value}</div>
                        <div className="text-xs truncate">{opt.sub}</div>
                      </div>
                    )} />
                ) : (
                  <p className="mt-1 text-sm font-mono text-gray-900">{item.accNo || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500">No. Invois</Label>
                {editMode
                  ? <Input className="text-sm mt-1" placeholder="INV-001" value={item.invoiceNo} onChange={e => onUpdateItem(idx, 'invoiceNo', e.target.value)} />
                  : <p className="mt-1 text-sm text-gray-900">{item.invoiceNo || '—'}</p>}
              </div>
              <div>
                <Label className="text-xs text-gray-500">Bil/Unit</Label>
                {editMode
                  ? <Input type="number" min="0.001" step="0.001" className="text-sm mt-1 text-right" value={item.qty} onChange={e => onUpdateItem(idx, 'qty', e.target.value)} />
                  : <p className="mt-1 text-sm text-gray-900">{item.qty}</p>}
              </div>
              <div>
                <Label className="text-xs text-gray-500">Kos/Unit (RM)</Label>
                {editMode
                  ? <Input type="number" min="0" step="0.01" className="text-sm mt-1 text-right" placeholder="0.00" value={item.unitCost} onChange={e => onUpdateItem(idx, 'unitCost', e.target.value)} />
                  : <p className="mt-1 text-sm text-gray-900">{fmtRM(item.unitCost)}</p>}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 text-right">
              <p className="text-sm font-medium text-gray-700">
                Jumlah: <span className="text-gray-900">{fmtRM((parseFloat(item.qty) || 0) * (parseFloat(item.unitCost) || 0))}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={onAddItem} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
          <Plus className="w-4 h-4" /> Tambah Butiran
        </button>
      )}
      {!editMode && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-right">
          <p className="text-base font-bold text-gray-900">JUMLAH BAYARAN: {fmtRM(billing?.totalAmount)}</p>
        </div>
      )}
    </section>
  )
}
