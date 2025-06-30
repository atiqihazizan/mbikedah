import { 
  FaFileInvoiceDollar, 
  FaCheckCircle, 
  FaTimes,
  FaMoneyBillWave,
  FaThumbsUp
} from 'react-icons/fa';
import { formatCurrency } from '../../config/format';

function HodViewDialog({ 
  showModal, 
  viewBilling, 
  onCloseModal, 
  onApprove 
}) {
  if (!showModal || !viewBilling) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black opacity-50"
        onClick={onCloseModal}
      ></div>

      <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Detail Permohonan - {viewBilling.running_no}
          </h3>
          <button
            onClick={onCloseModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Maklumat Permohonan</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Rujukan</label>
                <p className="text-sm text-gray-900 font-semibold">{viewBilling.running_no}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  viewBilling.status_name === 'Menunggu Kelulusan' ? 'bg-orange-100 text-orange-800' :
                  viewBilling.status_name === 'Semakan Kewangan' ? 'bg-blue-100 text-blue-800' :
                  viewBilling.status_name === 'Permohonan Dibayar' ? 'bg-green-100 text-green-800' :
                  viewBilling.status_name === 'Draf' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {viewBilling.status_name}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Memohon</label>
                <p className="text-sm text-gray-900">{new Date(viewBilling.issued_at).toLocaleDateString('ms-MY')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No Pesanan</label>
                <p className="text-sm text-gray-900">{viewBilling.no_project || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kaedah Bayaran</label>
                <p className="text-sm text-gray-900 capitalize">{viewBilling.payment_method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <p className="text-sm text-gray-900">{viewBilling.department}</p>
              </div>
            </div>
            {viewBilling.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Penerangan</label>
                <p className="text-sm text-gray-900">{viewBilling.description}</p>
              </div>
            )}
          </div>

          {/* Creator & Recipient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Creator Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaFileInvoiceDollar className="w-5 h-5 mr-2 text-blue-600" />
                Maklumat Pemohon
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <p className="text-sm text-gray-900">{viewBilling.creator.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jawatan</label>
                  <p className="text-sm text-gray-900">{viewBilling.creator.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Cipta</label>
                  <p className="text-sm text-gray-900">{new Date(viewBilling.created_at).toLocaleDateString('ms-MY', { 
                    day: 'numeric', month: 'long', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}</p>
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaMoneyBillWave className="w-5 h-5 mr-2 text-green-600" />
                Maklumat Penerima
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
                  <p className="text-sm text-gray-900">{viewBilling.recipient}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Keseluruhan</label>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(viewBilling.total_amount)}</p>
                </div>
                {viewBilling.payment_due && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Akhir Bayaran</label>
                    <p className="text-sm text-gray-900">{new Date(viewBilling.payment_due).toLocaleDateString('ms-MY')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Butiran Permohonan</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kod Bajet</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nama Bajet</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Perkara</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Rujukan</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kuantiti</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Harga Unit</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewBilling.details?.map((detail, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{detail.budget_code}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{detail.budget_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{detail.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{detail.reference || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center">{detail.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(detail.price)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(detail.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-right font-bold text-gray-900">Jumlah Keseluruhan</td>
                    <td className="py-3 px-4 text-right font-bold text-green-600 text-lg">{formatCurrency(viewBilling.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Approval Status */}
          {(viewBilling.hod_approved_at || viewBilling.reviewed_at || viewBilling.verified_at || viewBilling.approved_at || viewBilling.paid_at) && (
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Status Kelulusan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {viewBilling.hod_approved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diluluskan HOD</label>
                    <p className="text-sm text-gray-900">{new Date(viewBilling.hod_approved_at).toLocaleDateString('ms-MY')}</p>
                  </div>
                )}
                {viewBilling.reviewed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disemak</label>
                    <p className="text-sm text-gray-900">{new Date(viewBilling.reviewed_at).toLocaleDateString('ms-MY')}</p>
                  </div>
                )}
                {viewBilling.verified_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disahkan</label>
                    <p className="text-sm text-gray-900">{new Date(viewBilling.verified_at).toLocaleDateString('ms-MY')}</p>
                  </div>
                )}
                {viewBilling.approved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diluluskan</label>
                    <p className="text-sm text-gray-900">{new Date(viewBilling.approved_at).toLocaleDateString('ms-MY')}</p>
                  </div>
                )}
                {viewBilling.paid_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dibayar</label>
                    <p className="text-sm text-gray-900">{new Date(viewBilling.paid_at).toLocaleDateString('ms-MY')}</p>
                  </div>
                )}
                {viewBilling.ceo_approved && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEO Approved</label>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Ya</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Print Information */}
          {viewBilling.print_count > 0 && (
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Maklumat Cetakan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Cetakan</label>
                  <p className="text-sm text-gray-900">{viewBilling.print_count} kali</p>
                </div>
                {viewBilling.last_printed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir Dicetak</label>
                    <p className="text-sm text-gray-900">{new Date(viewBilling.last_printed_at).toLocaleDateString('ms-MY', { 
                      day: 'numeric', month: 'long', year: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    })}</p>
                  </div>
                )}
                {viewBilling.last_printed_by_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dicetak Oleh</label>
                    <p className="text-sm text-gray-900">{viewBilling.last_printed_by_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onCloseModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Tutup
          </button>
          {viewBilling.status_id === 2 && (
            <button
              onClick={() => {
                onCloseModal();
                onApprove(viewBilling);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <FaThumbsUp className="w-4 h-4" />
              <span>Luluskan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HodViewDialog;