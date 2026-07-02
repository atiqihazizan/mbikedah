import { Spinner } from '@/components/ui'

export default function LoadingState({ className = 'py-20' }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Spinner />
    </div>
  )
}
