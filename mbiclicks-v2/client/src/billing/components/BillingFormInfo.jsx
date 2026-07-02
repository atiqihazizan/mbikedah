// Section A: Maklumat Permohonan — view + edit mode.
import { Pencil, Plus, Building2, User2 } from 'lucide-react'
import { Input, Label, SearchableSelect } from '@/components/ui'

export default function BillingFormInfo({
  editMode, billing, form, setForm, user,
  vendors, accounts, onVendorChange, onVendorEdit, onVendorAdd, selectedVendor,
}) {
  const vendorOpts = vendors.map(v => ({
    value: v.id,
    label: v.name,
    sub:   [v.type === 'STAFF' ? 'Kakitangan' : 'Vendor/Kontraktor', v.bankName, v.bankAcc].filter(Boolean).join(' · '),
    raw:   v,
  }))

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">A: Maklumat Permohonan</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-400">Tarikh Permohonan</Label>
          {editMode
            ? <Input value={new Date().toLocaleDateString('ms-MY')} disabled className="bg-gray-50 mt-1" />
            : <p className="mt-1 text-sm text-gray-900">{billing?.createdAt ? new Date(billing.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>}
        </div>
        <div>
          <Label className="text-xs text-gray-400">Permohonan Oleh</Label>
          {editMode
            ? <Input value={user?.name ?? ''} disabled className="bg-gray-50 mt-1" />
            : <p className="mt-1 text-sm text-gray-900">{billing?.applicant?.name}</p>}
        </div>
        <div>
          <Label className="text-xs text-gray-400">Jabatan</Label>
          {editMode
            ? <Input value={user?.department?.name ?? '—'} disabled className="bg-gray-50 mt-1" />
            : <p className="mt-1 text-sm text-gray-900">{billing?.department?.name}</p>}
        </div>
        <div>
          <Label className="text-xs text-gray-400">No. Projek (optional)</Label>
          {editMode
            ? <Input className="mt-1" placeholder="N/A atau no. projek" value={form.projectNo}
                onChange={e => setForm(f => ({ ...f, projectNo: e.target.value }))} />
            : <p className="mt-1 text-sm text-gray-900">{billing?.projectNo || '—'}</p>}
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-gray-400">Nama Pembekal / Kontraktor / Penerima</Label>
          {editMode ? (
            <div className="flex gap-2 mt-1">
              <SearchableSelect
                className="flex-1"
                value={form.vendorId}
                onChange={onVendorChange}
                options={vendorOpts}
                placeholder="Cari dan pilih penerima..."
                clearable
                renderOption={opt => (
                  <div className="flex items-start gap-2">
                    {opt.raw?.type === 'STAFF'
                      ? <User2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                      : <Building2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />}
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{opt.label}</div>
                      {opt.sub && <div className="text-xs text-gray-400 mt-0.5 truncate">{opt.sub}</div>}
                    </div>
                  </div>
                )}
              />
              {selectedVendor && (
                <button type="button" onClick={() => onVendorEdit(selectedVendor)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button type="button" onClick={onVendorAdd}
                className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-blue-300 text-blue-600 rounded-md text-sm hover:bg-blue-50 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{billing?.vendor?.name ?? '—'}</p>
          )}
          {editMode && selectedVendor && (
            <div className="mt-1.5 text-xs text-gray-400 flex flex-wrap gap-3">
              {selectedVendor.bankName && <span>Bank: <span className="text-gray-600">{selectedVendor.bankName}</span></span>}
              {selectedVendor.bankAcc  && <span>No. Akaun: <span className="text-gray-600">{selectedVendor.bankAcc}</span></span>}
              {selectedVendor.phone    && <span>Tel: <span className="text-gray-600">{selectedVendor.phone}</span></span>}
            </div>
          )}
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-gray-400">Tujuan / Penerangan Pembayaran</Label>
          {editMode ? (
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mt-1"
              rows={2} placeholder="Nyatakan tujuan pembayaran..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{billing?.description}</p>
          )}
        </div>
      </div>
    </section>
  )
}
