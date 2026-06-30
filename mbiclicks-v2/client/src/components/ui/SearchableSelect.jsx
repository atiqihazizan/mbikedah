import ReactSelect from 'react-select'

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    borderRadius: '6px',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59,130,246,0.2)' : 'none',
    '&:hover': { borderColor: '#9ca3af' },
    fontSize: '14px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px 0',
    maxHeight: '224px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f9fafb' : 'white',
    color: state.isSelected ? '#1d4ed8' : '#374151',
    fontWeight: state.isSelected ? 500 : 400,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '14px',
  }),
  placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '14px' }),
  singleValue: (base) => ({ ...base, color: '#111827', fontSize: '14px' }),
  input: (base) => ({ ...base, fontSize: '14px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#9ca3af', padding: '0 8px' }),
  clearIndicator: (base) => ({ ...base, color: '#9ca3af', padding: '0 4px' }),
  valueContainer: (base) => ({ ...base, padding: '2px 10px' }),
}

/**
 * Wrapper react-select dengan API yang sama seperti SearchableSelect asal.
 *
 * Props:
 *   value         — current selected value (id/string)
 *   onChange(val) — called with selected value (atau null jika clear)
 *   options       — [{ value, label, sub? }]
 *   onSearch(q)   — async fn → server-side search
 *   isLoading     — show spinner
 *   placeholder
 *   disabled
 *   clearable
 *   renderOption  — (opt) => ReactNode
 *   className
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
  const selected = options.find(o => String(o.value) === String(value)) ?? null

  async function handleInputChange(inputVal) {
    if (onSearch) await onSearch(inputVal)
  }

  return (
    <div className={className}>
      <ReactSelect
        value={selected}
        onChange={(opt) => onChange(opt ? opt.value : null)}
        options={options}
        isLoading={isLoading}
        isDisabled={disabled}
        isClearable={clearable}
        placeholder={placeholder}
        onInputChange={onSearch ? handleInputChange : undefined}
        filterOption={onSearch ? () => true : undefined}
        formatOptionLabel={renderOption
          ? (opt) => renderOption(opt)
          : (opt) => (
            <div>
              <div className="text-sm text-gray-800">{opt.label}</div>
              {opt.sub && <div className="text-xs text-gray-400">{opt.sub}</div>}
            </div>
          )
        }
        styles={customStyles}
        noOptionsMessage={() => 'Tiada rekod'}
        loadingMessage={() => 'Mencari...'}
      />
    </div>
  )
}
