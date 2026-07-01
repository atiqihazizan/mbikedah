import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import ApprovalPageBase from '@/components/ApprovalPageBase'
import { billingApi } from '@/lib/billing'

export default function PermohonanCeo() {
  const { id } = useParams()
  const { user } = useAuthStore()

  // Restrict access — CEO only
  const roleSlug = user?.role?.slug
  if (!['ceo', 'admin'].includes(roleSlug)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-900 font-medium">Tiada kebenaran untuk halaman ini</p>
        </div>
      </div>
    )
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['billing-ceo', id],
    queryFn: () => billingApi.ceoReview(id),
    retry: (count, err) => err?.response?.status !== 403 && err?.response?.status !== 404 && count < 2,
  })

  if (error?.response?.status === 403 || error?.response?.status === 404) {
    return <ApprovalPageBase billing={null} isLoading={false} title="Semakan Ketua Eksekutif" />
  }

  return (
    <ApprovalPageBase
      billing={data?.data}
      isLoading={isLoading}
      title="Semakan Ketua Eksekutif"
      actions={['APPROVE', 'RETURN', 'REJECT']}
    />
  )
}
