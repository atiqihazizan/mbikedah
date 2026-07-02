import { useNavigate } from 'react-router-dom'

const COLOR = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   count: 'text-blue-700',   label: 'text-blue-600',   hover: 'hover:bg-blue-100' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', count: 'text-yellow-700', label: 'text-yellow-600', hover: 'hover:bg-yellow-100' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-100', count: 'text-orange-700', label: 'text-orange-600', hover: 'hover:bg-orange-100' },
  green:  { bg: 'bg-green-50',  border: 'border-green-100',  count: 'text-green-700',  label: 'text-green-600',  hover: 'hover:bg-green-100' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-100',   count: 'text-teal-700',   label: 'text-teal-600',   hover: 'hover:bg-teal-100' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', count: 'text-indigo-700', label: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', count: 'text-purple-700', label: 'text-purple-600', hover: 'hover:bg-purple-100' },
  gray:   { bg: 'bg-gray-50',   border: 'border-gray-100',   count: 'text-gray-600',   label: 'text-gray-500',   hover: 'hover:bg-gray-100' },
}

export default function SummaryCard({ vm }) {
  const navigate = useNavigate()
  if (!vm) return null
  const cls = COLOR[vm.color] ?? COLOR.gray

  return (
    <button
      onClick={() => navigate(vm.navigateTo)}
      className={`flex flex-col items-center justify-center p-5 rounded-xl border ${cls.bg} ${cls.border} ${cls.hover} transition-colors cursor-pointer text-center w-full`}
    >
      <span className={`text-3xl font-bold tabular-nums ${cls.count}`}>{vm.count}</span>
      <span className={`text-xs font-medium mt-1.5 ${cls.label}`}>{vm.label}</span>
    </button>
  )
}
