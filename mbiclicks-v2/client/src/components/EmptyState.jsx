import { FileText } from 'lucide-react'

export default function EmptyState({ icon: Icon = FileText, title = 'Tiada rekod', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
