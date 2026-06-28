import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import ApprovalPageBase from '@/components/ApprovalPageBase'
import { billingApi } from '@/lib/billing'

export default function PermohonanHod() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Restrict access — HOD only
  const roleSlug = user?.role?.slug
  if (!['hod', 'finance_hod', 'admin'].includes(roleSlug)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-900 font-medium">Tiada kebenaran untuk halaman ini</p>
        </div>
      </div>
    )
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['billing-hod', id],
    queryFn: () => billingApi.get(`/billings/${id}/hod`).then(r => r.data),
    retry: (count, err) => err?.response?.status !== 403 && err?.response?.status !== 404 && count < 2,
  })

  if (error?.response?.status === 403 || error?.response?.status === 404) {
    return <ApprovalPageBase billing={null} isLoading={false} title="Semakan HOD" />
  }

  return (
    <ApprovalPageBase
      billing={data?.data}
      isLoading={isLoading}
      title="Semakan HOD"
      actions={['APPROVE', 'RETURN', 'REJECT']}
    />
  )
}
