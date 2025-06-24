import React from 'react';
import { 
  FaTimes, 
  FaMoneyBillWave, 
  FaCheck 
} from 'react-icons/fa';
import { formatCurrency } from '../../config/format';

const FinanceViewDialog = ({
  isOpen,
  onClose,
  viewBilling,
  onActionClick
}) => {
  if (!isOpen || !viewBilling) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Detail Permohonan - {viewBilling.running_no}
          </h3>
          <button
            onClick={onClose}
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
                  viewBilling.status_name === 'Semakan Kewangan' ? 'bg-blue-100 text-blue-800' :
                  viewBilling.status_name === 'Verifikasi Kewangan' ? 'bg-orange-100 text-orange-800' :
                  viewBilling.status_name === 'Permohonan Dibayar' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {viewBilling.status_name}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Memohon</label>
                <p className="text-sm text-gray-900">{new Date(viewBilling.issued_at).toLocaleDateString('ms-MY')}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pemohon</label>
                <div>
                  <p className="text-sm text-gray-900 font-medium">{viewBilling.creator?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{viewBilling.creator?.position || ''}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kaedah Bayaran</label>
                <p className="text-sm text-gray-900 capitalize">{viewBilling.payment_method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <p className="text-sm text-gray-900">{viewBilling.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Projek</label>
                <p className="text-sm text-gray-900">{viewBilling.no_project || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Dibuat</label>
                <p className="text-sm text-gray-900">{new Date(viewBilling.created_at).toLocaleDateString('ms-MY')}</p>
              </div>
              {viewBilling.hod_approved_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Lulus HOD</label>
                  <p className="text-sm text-gray-900">{new Date(viewBilling.hod_approved_at).toLocaleDateString('ms-MY')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Amount Info */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMoneyBillWave className="w-5 h-5 mr-2 text-blue-600" />
              Maklumat Kewangan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Keseluruhan</label>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(viewBilling.total_amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penerima</label>
                <p className="text-lg text-gray-900">{viewBilling.recipient}</p>
              </div>
              {viewBilling.payment_due && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Perlu Bayar</label>
                  <p className="text-sm text-gray-900">{new Date(viewBilling.payment_due).toLocaleDateString('ms-MY')}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bil Dicetak</label>
                <p className="text-sm text-gray-900">{viewBilling.print_count} kali</p>
                {viewBilling.last_printed_at && (
                  <p className="text-xs text-gray-500">
                    Terakhir: {new Date(viewBilling.last_printed_at).toLocaleDateString('ms-MY')} 
                    {viewBilling.last_printed_by_name && ` oleh ${viewBilling.last_printed_by_name}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details Table */}
          {viewBilling.details && viewBilling.details.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Butiran Permohonan</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kod Bajet</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nama Bajet</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Perkara</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kuantiti</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Harga Unit</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Baki Bajet</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Rujukan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {viewBilling.details.map((detail, i) => (
                      <tr key={i}>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{detail.budget_code}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{detail.budget_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{detail.description}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-center">{detail.quantity}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(detail.price)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(detail.total)}</td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className={`font-medium ${
                            parseFloat(detail.budget_bal) < parseFloat(detail.total) 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {formatCurrency(detail.budget_bal)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{detail.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={5} className="py-3 px-4 text-right font-bold text-gray-900">Jumlah Keseluruhan</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600 text-lg">{formatCurrency(viewBilling.total_amount)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Tutup
          </button>
          
          {/* Action buttons based on status */}
          {viewBilling.status_id === 3 && !viewBilling.reviewed_at && (
            <button
              onClick={() => {
                onClose();
                onActionClick(viewBilling, 'review');
              }}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 border border-transparent rounded-xl shadow-sm hover:shadow-md transition-all duration-200 space-x-2"
            >
              <FaCheck className="w-4 h-4" />
              <span>Semak</span>
            </button>
          )}
          
          {viewBilling.status_id === 4 && !viewBilling.verified_at && (
            <button
              onClick={() => {
                onClose();
                onActionClick(viewBilling, 'verify');
              }}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 border border-transparent rounded-xl shadow-sm hover:shadow-md transition-all duration-200 space-x-2"
            >
              <FaCheck className="w-4 h-4" />
              <span>Verifikasi</span>
            </button>
          )}
          
          {viewBilling.status_id === 5 && !viewBilling.paid_at && (
            <button
              onClick={() => {
                onClose();
                onActionClick(viewBilling, 'payment');
              }}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 border border-transparent rounded-xl shadow-sm hover:shadow-md transition-all duration-200 space-x-2"
            >
              <FaMoneyBillWave className="w-4 h-4" />
              <span>Proses Bayaran</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceViewDialog;