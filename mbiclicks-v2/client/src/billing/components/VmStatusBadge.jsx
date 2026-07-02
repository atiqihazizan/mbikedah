// ADR-021: Component hanya menerima ViewModel display object.
// ADR-008: Page tidak render badge secara manual.

const COLOR_CLS = {
  gray:   'bg-gray-100 text-gray-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  blue:   'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-800',
  purple: 'bg-purple-100 text-purple-800',
  green:  'bg-green-100 text-green-700',
  teal:   'bg-teal-100 text-teal-700',
  red:    'bg-red-100 text-red-700',
  rose:   'bg-rose-100 text-rose-700',
  amber:  'bg-amber-100 text-amber-700',
  cyan:   'bg-cyan-100 text-cyan-700',
}

export default function VmStatusBadge({ display, className = '' }) {
  if (!display) return null
  const cls = COLOR_CLS[display.color] ?? COLOR_CLS.gray
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {display.badge}
    </span>
  )
}
