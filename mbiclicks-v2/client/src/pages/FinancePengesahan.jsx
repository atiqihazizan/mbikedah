import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import ApprovalPageBase from '@/components/ApprovalPageBase'
import api from '@/lib/api'

export default function FinancePengesahan() {
  const { id } = useParams()
  const { user } = useAuthStore()

  // Restrict access — Finance only
  const roleSlug = user?.role?.slug
  if (!['finance', 'finance_hod', 'admin'].includes(roleSlug)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-900 font-medium">Tiada kebenaran untuk halaman ini</p>
        </div>
      </div>
    )
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['billing-finance-verify', id],
    queryFn: () => api.get(`/billings/${id}/pengesahan-kewangan`).then(r => r.data),
    retry: (count, err) => err?.response?.status !== 403 && err?.response?.status !== 404 && count < 2,
  })

  if (error?.response?.status === 403 || error?.response?.status === 404) {
    return <ApprovalPageBase billing={null} isLoading={false} title="Pengesahan Kewangan" />
  }

  return (
    <ApprovalPageBase
      billing={data?.data}
      isLoading={isLoading}
      title="Pengesahan Kewangan"
      actions={['APPROVE', 'RETURN', 'REJECT']}
    />
  )
}
