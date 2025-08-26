import { formatCurrency } from "../../config/format";
import BillingHistory from "../../views/billing/BillingHistory";

export default function ApplicantViewMode({ petition, currentUser }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Maklumat Permohonan</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Rujukan</label>
            <p className="text-sm text-gray-900 font-semibold">{petition.running_no || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              petition.status_name === 'Semakan Kewangan' ? 'bg-blue-100 text-blue-800' :
              petition.status_name === 'Permohonan Dibayar' ? 'bg-green-100 text-green-800' :
              petition.status_name === 'Draf' ? 'bg-gray-100 text-gray-800' :
              petition.status_name === 'Menunggu Kelulusan' ? 'bg-yellow-100 text-yellow-800' :
              petition.status_name === 'Ditolak' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {petition.status_name || 'Tidak Diketahui'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Memohon</label>
            <p className="text-sm text-gray-900">{petition.issued_at ? new Date(petition.issued_at).toLocaleDateString('ms-MY') : '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No Pesanan</label>
            <p className="text-sm text-gray-900">{petition.no_project || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <p className="text-sm text-gray-900">{petition.department || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penerima</label>
            <p className="text-sm text-gray-900">{petition.recipient || '-'}</p>
          </div>
        </div>
      </div>

      {/* Creator Information */}
      {petition.creator && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Maklumat Pemohon</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <p className="text-sm text-gray-900">{petition.creator.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jawatan</label>
              <p className="text-sm text-gray-900">{petition.creator.position || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Cipta</label>
              <p className="text-sm text-gray-900">{new Date(petition.created_at).toLocaleDateString('ms-MY', { 
                day: 'numeric', month: 'long', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Details Table */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Butiran Permohonan</h4>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kod Bajet</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama Bajet</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Perkara</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kuantiti</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(petition?.details || []).map((detail, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-sm text-gray-900">{detail.budget_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{detail.budget_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{detail.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center">{detail.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(detail.price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(detail.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-900">Jumlah Keseluruhan</td>
                <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">{formatCurrency(petition?.total_amount || '0.00')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Enhanced History using BillingHistory component */}
      {petition.history && petition.history.length > 0 && (
        <BillingHistory 
          history={petition.history}
          currentUser={currentUser}
          billing={petition}
          compact={false}
        />
      )}
    </div>
  );
}
