import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, X, Search } from 'lucide-react'

/**
 * Searchable dropdown with server-side or client-side filtering.
 *
 * Props:
 *   value         — current selected value (id/string)
 *   onChange(val) — called with selected value
 *   options       — [{ value, label, sub? }]  (client-side mode)
 *   onSearch(q)   — async fn, if provided = server-side mode
 *   isLoading     — show spinner while loading
 *   placeholder
 *   disabled
 *   clearable     — show × to clear
 *   renderOption  — (opt) => ReactNode  custom row
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  onSearch,
  isLoading = false,
  placeholder = 'Pilih...',
  disabled = false,
  clearable = true,
  renderOption,
  className = '',
}) {
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState('')
  const [items, setItems]   = useState(options)
  const [searching, setSearching] = useState(false)
  const inputRef  = useRef(null)
  const wrapRef   = useRef(null)
  const debounce  = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync client-side options
  useEffect(() => {
    if (!onSearch) setItems(options)
  }, [options, onSearch])

  // Client-side filter
  useEffect(() => {
    if (onSearch) return
    if (!query.trim()) { setItems(options); return }
    const q = query.toLowerCase()
    setItems(options.filter(o =>
      o.label.toLowerCase().includes(q) || (o.sub ?? '').toLowerCase().includes(q)
    ))
  }, [query, options, onSearch])

  // Server-side search with debounce
  const runSearch = useCallback(async (q) => {
    if (!onSearch) return
    setSearching(true)
    try {
      const res = await onSearch(q)
      setItems(res)
    } finally {
      setSearching(false)
    }
  }, [onSearch])

  useEffect(() => {
    if (!onSearch) return
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => runSearch(query), 280)
    return () => clearTimeout(debounce.current)
  }, [query, runSearch, onSearch])

  function openDropdown() {
    if (disabled) return
    setOpen(true)
    // Load all on open (empty query)
    if (onSearch && !open) runSearch('')
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  function select(opt) {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  function clear(e) {
    e.stopPropagation()
    onChange(null)
    setQuery('')
  }

  const selected = options.find(o => String(o.value) === String(value))
  const busy = isLoading || searching

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        onClick={openDropdown}
        className={`flex items-center gap-2 w-full border rounded-md px-3 py-2 text-sm cursor-pointer select-none transition-colors
          ${disabled ? 'bg-gray-50 cursor-not-allowed border-gray-200 text-gray-400'
            : open ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
            : 'border-gray-300 bg-white hover:border-gray-400'}`}
      >
        <span className={`flex-1 truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        {clearable && selected && !disabled && (
          <button onClick={clear} className="text-gray-300 hover:text-gray-500 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
              placeholder="Cari..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {busy && (
              <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </div>

          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {items.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                {busy ? 'Mencari...' : 'Tiada rekod'}
              </li>
            ) : items.map(opt => (
              <li
                key={opt.value}
                onClick={() => select(opt)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                  ${String(opt.value) === String(value)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {renderOption ? renderOption(opt) : (
                  <div>
                    <div>{opt.label}</div>
                    {opt.sub && <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
