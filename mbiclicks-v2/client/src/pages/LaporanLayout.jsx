import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus, Trash2, GripVertical, ChevronLeft, Pencil, Check, X,
  LayoutTemplate, ChevronRight, Search, FolderOpen,
} from 'lucide-react'
import { reportLayoutApi } from '@/lib/budget'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui'
import { toast } from 'sonner'

const SECTION_TYPE_LABEL = {
  HASIL: 'Hasil', BELANJA: 'Belanja', CUSTOM: 'Tersuai', SEPARATOR: 'Pemisah',
}
const SECTION_TYPE_COLOR = {
  HASIL: 'bg-blue-100 text-blue-700',
  BELANJA: 'bg-orange-100 text-orange-700',
  CUSTOM: 'bg-purple-100 text-purple-700',
  SEPARATOR: 'bg-gray-100 text-gray-500',
}

// ─── Sortable row (shared) ────────────────────────────────────────────────────
function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2 group"
    >
      <button className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        {...attributes} {...listeners}>
        <GripVertical size={15} />
      </button>
      {children}
    </div>
  )
}

// ─── Inline editable text ─────────────────────────────────────────────────────
function InlineEdit({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value)

  const commit = () => { if (draft.trim()) { onSave(draft.trim()); setEditing(false) } }

  if (!editing) return (
    <span
      className={`cursor-pointer hover:underline decoration-dashed ${className}`}
      onClick={() => { setDraft(value); setEditing(true) }}
    >{value}</span>
  )
  return (
    <span className="flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="border border-purple-400 rounded px-2 py-0.5 text-sm outline-none"
      />
      <button onClick={commit} className="text-green-600"><Check size={14} /></button>
      <button onClick={() => setEditing(false)} className="text-red-400"><X size={14} /></button>
    </span>
  )
}

// ─── Account Picker Modal ─────────────────────────────────────────────────────
function AccountPicker({ onSelect, onClose, alreadyAdded = [] }) {
  const [search, setSearch] = useState('')
  const { data: accountData } = useQuery({
    queryKey: ['accounts-all'],
    queryFn: () => api.get('/accounts', { params: { limit: 9999 } }).then(r => r.data),
  })

  const allAccounts = accountData?.data ?? []
  const filtered = allAccounts.filter(l =>
    !alreadyAdded.includes(l.accNo) &&
    (l.accNo.toLowerCase().includes(search.toLowerCase()) ||
     (l.name ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-gray-900">Pilih Akaun</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kod akaun atau nama..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">Tiada akaun dijumpai</p>
          ) : filtered.map(l => (
            <button key={l.accNo}
              onClick={() => { onSelect(l); onClose() }}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-purple-50 text-left transition-colors">
              <span className="font-mono text-xs text-gray-400 w-24 shrink-0">{l.accNo}</span>
              <span className="text-sm text-gray-700 flex-1 truncate">{l.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${l.accType === 'HASIL' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {l.accType}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section Editor ───────────────────────────────────────────────────────────
function SectionEditor({ layoutId, section, onDelete }) {
  const qc = useQueryClient()
  const [showPicker, setShowPicker] = useState(false)
  const [items, setItems] = useState(section.items ?? [])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const alreadyAdded = items.map(i => i.accNo)

  const saveItems = useCallback(async (newItems) => {
    try {
      const saved = await reportLayoutApi.bulkSaveItems(layoutId, section.id, newItems.map((it, idx) => ({
        accNo: it.accNo, label: it.label ?? null, isGroupHeader: it.isGroupHeader ?? false, sortOrder: idx,
      })))
      setItems(saved)
      qc.invalidateQueries(['report-layouts', layoutId])
    } catch { toast.error('Gagal simpan item') }
  }, [layoutId, section.id, qc])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex(i => i.id === active.id)
    const newIdx = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIdx, newIdx)
    setItems(reordered)
    saveItems(reordered)
  }

  const addAccount = (acc) => {
    const newItems = [...items, {
      id: Date.now(), accNo: acc.accNo, label: acc.name, isGroupHeader: false, sortOrder: items.length,
    }]
    setItems(newItems)
    saveItems(newItems)
  }

  const removeItem = (idx) => {
    const newItems = items.filter((_, i) => i !== idx)
    setItems(newItems)
    saveItems(newItems)
  }

  const toggleHeader = (idx) => {
    const newItems = items.map((it, i) => i === idx ? { ...it, isGroupHeader: !it.isGroupHeader } : it)
    setItems(newItems)
    saveItems(newItems)
  }

  const updateLabel = (idx, label) => {
    const newItems = items.map((it, i) => i === idx ? { ...it, label } : it)
    setItems(newItems)
    saveItems(newItems)
  }

  const updateSectionMut = useMutation({
    mutationFn: (data) => reportLayoutApi.updateSection(layoutId, section.id, data),
    onSuccess: () => qc.invalidateQueries(['report-layouts', layoutId]),
  })

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-1">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SECTION_TYPE_COLOR[section.sectionType]}`}>
            {SECTION_TYPE_LABEL[section.sectionType]}
          </span>
          <InlineEdit
            value={section.title}
            onSave={(title) => updateSectionMut.mutate({ ...section, title })}
            className="font-semibold text-sm text-gray-800"
          />
        </div>
        <button onClick={() => { if (confirm(`Padam bahagian "${section.title}"?`)) onDelete() }}
          className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-1 min-h-[40px]">
        {section.sectionType === 'SEPARATOR' ? (
          <p className="text-xs text-gray-400 italic text-center py-2">— garisan pemisah —</p>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {items.map((item, idx) => (
                  <SortableRow key={item.id} id={item.id}>
                    <div className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
                      item.isGroupHeader ? 'bg-orange-50 font-semibold' : 'bg-gray-50'
                    }`}>
                      <span className="font-mono text-gray-400 w-20 shrink-0">{item.accNo}</span>
                      <InlineEdit
                        value={item.label || item.accNo}
                        onSave={(label) => updateLabel(idx, label)}
                        className={`flex-1 ${item.isGroupHeader ? 'font-semibold text-orange-800' : 'text-gray-700'}`}
                      />
                    </div>
                    <button
                      onClick={() => toggleHeader(idx)}
                      title={item.isGroupHeader ? 'Jadikan biasa' : 'Jadikan header'}
                      className={`p-1 text-xs rounded ${item.isGroupHeader ? 'text-orange-500' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      <span className="font-bold text-[10px]">H</span>
                    </button>
                    <button onClick={() => removeItem(idx)} className="p-1 text-gray-300 hover:text-red-500">
                      <X size={13} />
                    </button>
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>
            <button
              onClick={() => setShowPicker(true)}
              className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 py-1.5 border border-dashed border-purple-200 hover:border-purple-400 rounded-lg transition-colors"
            >
              <Plus size={13} /> Tambah akaun
            </button>
          </>
        )}
      </div>

      {showPicker && (
        <AccountPicker
          alreadyAdded={alreadyAdded}
          onSelect={addAccount}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ─── Layout Builder ───────────────────────────────────────────────────────────
function LayoutBuilder({ layoutId }) {
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const sensors   = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const [sectionOrder, setSectionOrder] = useState(null)
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSection, setNewSection] = useState({ title: '', sectionType: 'CUSTOM', showTotal: true })

  const { data: layout, isLoading } = useQuery({
    queryKey: ['report-layouts', layoutId],
    queryFn:  () => reportLayoutApi.get(layoutId),
    onSuccess: (d) => setSectionOrder(d.sections.map(s => s.id)),
  })

  const updateMut = useMutation({
    mutationFn: (data) => reportLayoutApi.update(layoutId, data),
    onSuccess: () => { qc.invalidateQueries(['report-layouts', layoutId]); toast.success('Nama dikemaskini') },
  })

  const addSectionMut = useMutation({
    mutationFn: (data) => reportLayoutApi.addSection(layoutId, data),
    onSuccess: (s) => {
      qc.invalidateQueries(['report-layouts', layoutId])
      setSectionOrder(prev => [...(prev ?? []), s.id])
      setShowAddSection(false)
      setNewSection({ title: '', sectionType: 'CUSTOM', showTotal: true })
      toast.success('Bahagian ditambah')
    },
  })

  const deleteSectionMut = useMutation({
    mutationFn: (sid) => reportLayoutApi.deleteSection(layoutId, sid),
    onSuccess: (_, sid) => {
      qc.invalidateQueries(['report-layouts', layoutId])
      setSectionOrder(prev => prev?.filter(id => id !== sid))
      toast.success('Bahagian dipadam')
    },
  })

  const handleSectionDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id || !sectionOrder) return
    const oldIdx = sectionOrder.indexOf(active.id)
    const newIdx = sectionOrder.indexOf(over.id)
    const reordered = arrayMove(sectionOrder, oldIdx, newIdx)
    setSectionOrder(reordered)
    try { await reportLayoutApi.reorderSections(layoutId, reordered) }
    catch { toast.error('Gagal susun semula') }
  }

  if (isLoading) return <div className="py-16 text-center text-sm text-gray-400">Memuatkan...</div>

  const sections = sectionOrder
    ? sectionOrder.map(id => layout?.sections?.find(s => s.id === id)).filter(Boolean)
    : layout?.sections ?? []

  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/laporan/layouts')}
          className="text-gray-400 hover:text-gray-700 p-1"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <InlineEdit
            value={layout?.name ?? ''}
            onSave={(name) => updateMut.mutate({ name, description: layout?.description })}
            className="text-xl font-bold text-gray-900"
          />
          {layout?.description && (
            <InlineEdit
              value={layout.description}
              onSave={(description) => updateMut.mutate({ name: layout.name, description })}
              className="text-xs text-gray-500 mt-0.5"
            />
          )}
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          {sections.length} bahagian
        </span>
      </div>

      {/* Sections — sortable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sectionOrder ?? sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sections.map((s) => (
              <SortableRow key={s.id} id={s.id}>
                <div className="flex-1 group">
                  <SectionEditor
                    layoutId={layoutId}
                    section={s}
                    onDelete={() => deleteSectionMut.mutate(s.id)}
                  />
                </div>
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add section */}
      {showAddSection ? (
        <div className="border border-purple-200 rounded-xl p-4 space-y-3 bg-purple-50">
          <p className="text-sm font-semibold text-purple-800">Bahagian Baru</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tajuk bahagian</label>
              <input
                autoFocus
                value={newSection.title}
                onChange={e => setNewSection(p => ({ ...p, title: e.target.value }))}
                placeholder="cth: PENERIMAAN"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Jenis</label>
              <select
                value={newSection.sectionType}
                onChange={e => setNewSection(p => ({ ...p, sectionType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="HASIL">Hasil</option>
                <option value="BELANJA">Belanja</option>
                <option value="CUSTOM">Tersuai</option>
                <option value="SEPARATOR">Pemisah</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={newSection.showTotal}
                onChange={e => setNewSection(p => ({ ...p, showTotal: e.target.checked }))}
                className="rounded" />
              Tunjuk jumlah
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAddSection(false)}>Batal</Button>
            <Button size="sm"
              disabled={!newSection.title.trim() || addSectionMut.isPending}
              onClick={() => addSectionMut.mutate(newSection)}>
              Tambah
            </Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddSection(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 hover:border-purple-300 text-sm text-gray-400 hover:text-purple-600 rounded-xl transition-colors">
          <Plus size={16} /> Tambah Bahagian
        </button>
      )}
    </div>
  )
}

// ─── Layout List ──────────────────────────────────────────────────────────────
function LayoutList() {
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newDesc,  setNewDesc]  = useState('')

  const { data: layouts = [], isLoading } = useQuery({
    queryKey: ['report-layouts'],
    queryFn:  reportLayoutApi.list,
  })

  const createMut = useMutation({
    mutationFn: () => reportLayoutApi.create({ name: newName.trim(), description: newDesc.trim() || null }),
    onSuccess: (layout) => {
      qc.invalidateQueries(['report-layouts'])
      setCreating(false); setNewName(''); setNewDesc('')
      navigate(`/laporan/layouts/${layout.id}`)
      toast.success('Layout berjaya dibina')
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id) => reportLayoutApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['report-layouts']); toast.success('Layout dipadam') },
  })

  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/laporan')} className="text-gray-400 hover:text-gray-700 p-1">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutTemplate size={20} className="text-purple-600" /> Layout Laporan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Urus format paparan laporan kewangan</p>
          </div>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus size={14} /> Layout Baru
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-purple-800">Layout Baru</p>
          <input
            autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Nama layout (cth: Laporan Kewangan Standard)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <input
            value={newDesc} onChange={e => setNewDesc(e.target.value)}
            placeholder="Penerangan (pilihan)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>Batal</Button>
            <Button size="sm" disabled={!newName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>
              Bina & Edit
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">Memuatkan...</div>
      ) : layouts.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <FolderOpen size={40} className="mx-auto text-gray-200" />
          <p className="text-sm text-gray-400">Belum ada layout. Bina yang pertama.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {layouts.map((l, i) => (
            <div key={l.id} className={`flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <LayoutTemplate size={16} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{l.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {l._count?.sections ?? 0} bahagian · Oleh {l.creator?.name}
                </p>
                {l.description && <p className="text-xs text-gray-400 truncate">{l.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => navigate(`/laporan/layouts/${l.id}`)}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => { if (confirm(`Padam layout "${l.name}"?`)) deleteMut.mutate(l.id) }}
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LaporanLayout() {
  const { id }     = useParams()
  const hasRole    = useAuthStore((s) => s.hasRole)
  const isFinance  = hasRole('finance_hod', 'finance')

  if (!isFinance) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        Hanya pengurusan kewangan boleh mengurus layout laporan.
      </div>
    )
  }

  return id ? <LayoutBuilder layoutId={Number(id)} /> : <LayoutList />
}
