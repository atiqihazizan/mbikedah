import { forwardRef } from 'react'

const V = {
  default:     'bg-green-600 text-white hover:bg-green-700 border-transparent shadow-sm',
  outline:     'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm',
  ghost:       'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  destructive: 'bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm',
  secondary:   'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent',
  success:     'bg-green-600 text-white hover:bg-green-700 border-transparent shadow-sm',
}
const S = {
  default: 'h-9 px-4 text-sm',
  sm:      'h-7 px-3 text-xs',
  lg:      'h-10 px-6 text-[15px]',
  icon:    'h-9 w-9 p-0',
}

export function Button({ variant = 'default', size = 'default', className = '', disabled, children, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none
        ${V[variant] ?? V.default} ${S[size] ?? S.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
export function CardHeader({ className = '', children, ...props }) {
  return <div className={`px-5 pt-5 pb-3 ${className}`} {...props}>{children}</div>
}
export function CardTitle({ className = '', children, ...props }) {
  return <h3 className={`font-semibold text-gray-900 text-[15px] ${className}`} {...props}>{children}</h3>
}
export function CardDescription({ className = '', children, ...props }) {
  return <p className={`text-sm text-gray-500 mt-0.5 ${className}`} {...props}>{children}</p>
}
export function CardContent({ className = '', children, ...props }) {
  return <div className={`px-5 pb-5 ${className}`} {...props}>{children}</div>
}

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900
        placeholder:text-gray-400 transition-colors
        focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
        disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
      {...props}
    />
  )
})

export function Label({ className = '', children, ...props }) {
  return (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
      {children}
    </label>
  )
}

const BC = {
  default: 'bg-gray-100 text-gray-600',
  blue:    'bg-blue-100 text-blue-700',
  green:   'bg-green-100 text-green-800',
  yellow:  'bg-yellow-100 text-yellow-800',
  red:     'bg-red-100 text-red-800',
  purple:  'bg-purple-100 text-purple-800',
  teal:    'bg-teal-100 text-teal-800',
}

export function Badge({ variant = 'default', className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${BC[variant] ?? BC.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function Dialog({ open, onClose, children, className = '' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md ${className}`}>{children}</div>
    </div>
  )
}
export function DialogContent({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-2xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  )
}
export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>
}
export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
}
export function DialogDescription({ children }) {
  return <p className="text-sm text-gray-500 mt-1">{children}</p>
}
export function DialogFooter({ children }) {
  return <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-gray-100">{children}</div>
}

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900
        focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
        disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
})

export function Spinner({ size = 16 }) {
  return (
    <svg className="animate-spin" style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

export function Separator({ className = '' }) {
  return <div className={`h-px bg-gray-100 ${className}`} />
}
