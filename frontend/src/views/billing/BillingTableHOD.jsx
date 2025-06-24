import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaFileInvoiceDollar, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaSync,
  FaEye,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaThumbsUp,
  FaFire
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import TButton from '../../components/Core/TButton';
import { formatCurrency } from '../../config/format';
import apiClient from '../../axios';
import { RotateCcw } from 'lucide-react';

function BillingTableHOD() {
  const { 
    dashboardData, 
    currentActiveRole,
    tabNotifications 
  } = useOutletContext();

  const [hodData, setHodData] = useState(dashboardData?.hod || {});
  const [loading, setLoading] = useState(false);

  // Approval Modal States
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewBilling, setViewBilling] = useState(null);

  // Update data when dashboardData changes
  useEffect(() => {
    if (dashboardData?.hod) {
      setHodData(dashboardData.hod);
    }
  }, [dashboardData]);

  const stats = hodData.summary || {};
  const needingApproval = hodData.needing_approval || [];
  const performance = hodData.performance || {};

  const StatCard = ({ icon: Icon, title, value, color, description }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-700">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  const handleApprove = async (billing) => {
    try {
      setSelectedBilling(billing);
      setShowApprovalModal(true);
      setApprovalComment("");
    } catch (error) {
      console.error('Error preparing approval:', error);
      toast.error('Ralat semasa menyediakan kelulusan');
    }
  };

  const handleConfirmApproval = async () => {
    if (!selectedBilling) return;

    try {
      setIsApproving(true);

      const response = await apiClient.post(`/billings/${selectedBilling.id}/hod-approve`, {
        remarks: approvalComment.trim() || "Diluluskan oleh Ketua Jabatan"
      });

      if (response.data.success || response.status === 200) {
        toast.success('Permohonan berjaya diluluskan');
        
        setApprovalComment("");
        setShowApprovalModal(false);
        setSelectedBilling(null);
        
        // Refresh data
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Ralat tidak diketahui');
      }
    } catch (error) {
      console.error('Error approving billing:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Ralat semasa meluluskan permohonan'
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleView = async (billing) => {
    try {
      const {data} = await apiClient.get(`/billings/${billing.id}`);
      setViewBilling(data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error viewing billing:', error);
      toast.error('Ralat semasa melihat permohonan');
    }
  };

  const handleCloseApprovalModal = () => {
    if (!isApproving) {
      setShowApprovalModal(false);
      setSelectedBilling(null);
      setApprovalComment("");
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewBilling(null);
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'segera':
        return <FaExclamationTriangle className="w-4 h-4 text-red-500" />;
      case 'penting':
        return <FaClock className="w-4 h-4 text-orange-500" />;
      default:
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const isSelectedBillingUrgent = selectedBilling && selectedBilling.days_pending > 3;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Approval Modal */}
      {showApprovalModal && selectedBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black opacity-50"
            onClick={handleCloseApprovalModal}
          ></div>

          <div className={`relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ${isSelectedBillingUrgent ? 'ring-2 ring-red-500' : ''}`}>
            {isSelectedBillingUrgent && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Permohonan Mendesak</p>
                    <p className="text-xs text-red-600">
                      Telah tertunggak selama {selectedBilling.days_pending} hari
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isSelectedBillingUrgent ? 'text-red-800' : 'text-gray-900'}`}>
                Kelulusan Ketua Jabatan
                {isSelectedBillingUrgent && <span className="text-red-600 ml-2">(Mendesak)</span>}
              </h3>
              <button
                onClick={handleCloseApprovalModal}
                disabled={isApproving}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className={`rounded-lg p-4 mb-4 ${isSelectedBillingUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <div className="text-sm space-y-2">
                <div><span className="font-medium">No. Rujukan:</span> {selectedBilling.running_no}</div>
                <div><span className="font-medium">Pemohon:</span> {selectedBilling.creator}</div>
                <div><span className="font-medium">Penerima:</span> {selectedBilling.recipient}</div>
                <div><span className="font-medium">Jumlah:</span> {formatCurrency(selectedBilling.total_amount)}</div>
                <div><span className="font-medium">Tarikh Permohonan:</span> {selectedBilling.created_at}</div>
                <div>
                  <span className="font-medium">Hari Tertunggak:</span> 
                  <span className={`ml-1 font-bold ${isSelectedBillingUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                    {selectedBilling.days_pending_display}
                  </span>
                </div>
              </div>
            </div>

            {isSelectedBillingUrgent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Amaran:</strong> Permohonan ini telah melebihi 3 hari dan memerlukan tindakan segera.
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Kelulusan {isSelectedBillingUrgent ? '(Disyorkan untuk permohonan mendesak)' : '(pilihan)'}:
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder={isSelectedBillingUrgent ? "Sila nyatakan catatan untuk permohonan mendesak ini..." : "Masukkan catatan kelulusan jika perlu..."}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                disabled={isApproving}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseApprovalModal}
                disabled={isApproving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmApproval}
                disabled={isApproving}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                  isSelectedBillingUrgent 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <FaThumbsUp className="w-4 h-4" />
                    <span>{isSelectedBillingUrgent ? 'Luluskan Segera' : 'Luluskan'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black opacity-50"
            onClick={handleCloseViewModal}
          ></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Detail Permohonan - {viewBilling.running_no}
              </h3>
              <button
                onClick={handleCloseViewModal}
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
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Baki Bajet</th>
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
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatCurrency(detail.budget_bal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={6} className="py-3 px-4 text-right font-bold text-gray-900">Jumlah Keseluruhan</td>
                        <td className="py-3 px-4 text-right font-bold text-green-600 text-lg">{formatCurrency(viewBilling.total_amount)}</td>
                        <td></td>
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
                onClick={handleCloseViewModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Tutup
              </button>
              {viewBilling.status_id === 2 && (
                <button
                  onClick={() => {
                    handleCloseViewModal();
                    handleApprove(viewBilling);
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
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">👔</span>
              Ketua Jabatan
            </h1>
            <p className="text-gray-600 mt-1">
              Pengurusan kelulusan dan pemantauan permohonan billing
            </p>
          </div>
          <TButton
            color="ghost"
            onClick={() => setLoading(!loading)}
            title="Refresh Data"
            className="!p-2"
          >
            {/* <FaSync className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> */}
            <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </TButton>
        </div>
      </div>

      {/* Current Role Indicator */}
      {/* {currentActiveRole && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-purple-800 font-medium">
              Sedang menggunakan dashboard: {currentActiveRole}
            </span>
            {tabNotifications && Object.values(tabNotifications).reduce((a, b) => a + b, 0) > 0 && (
              <span className="ml-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {Object.values(tabNotifications).reduce((a, b) => a + b, 0)} notifikasi
              </span>
            )}
          </div>
        </div>
      )} */}

      {/* Statistics Grid - Simplified */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaClock}
          title="Jumlah Pending"
          value={stats.pending_approvals || 0}
          color="bg-orange-500"
          description="Permohonan yang perlu diluluskan"
        />
        <StatCard
          icon={FaCalendarAlt}
          title="Jumlah Bulan Ini"
          value={performance.this_month || 0}
          color="bg-blue-500"
          description="Permohonan bulan semasa"
        />
        {/* <StatCard
          icon={FaMoneyBillWave}
          title="Jumlah Diluluskan"
          value={stats.total_approved_amount ? formatCurrency(stats.total_approved_amount) : 'RM 0.00'}
          color="bg-green-500"
          description="Total amount yang diluluskan"
        /> */}
      </div>

      {/* Approval Queue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaClock className="w-5 h-5 mr-3 text-orange-500" />
            Senarai Permohonan Menunggu Kelulusan
            {needingApproval.length > 0 && (
              <span className="ml-3 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                {needingApproval.length}
              </span>
            )}
          </h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
          ) : needingApproval.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">No. Rujukan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">Pemohon</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">Penerima</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 uppercase text-xs">Jumlah</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">Tarikh</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 uppercase text-xs">Prioriti</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 uppercase text-xs">Tempoh</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 uppercase text-xs">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {needingApproval.map((billing) => (
                    <tr key={billing.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{billing.running_no}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">{billing.creator}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">{billing.recipient}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(billing.total_amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600 text-sm">{billing.created_at}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${billing.priority_class}`}>
                          {getPriorityIcon(billing.priority)}
                          <span className="ml-1">{billing.priority}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">{billing.days_pending_display}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <TButton
                            color="light"
                            onClick={() => handleView(billing)}
                            title="Lihat Permohonan"
                            className="!p-2"
                          >
                            <FaEye className="w-4 h-4" />
                          </TButton>
                          <TButton
                            color="green"
                            onClick={() => handleApprove(billing)}
                            title="Luluskan"
                            className="!p-2"
                          >
                            <FaCheck className="w-4 h-4" />
                          </TButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaCheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Tiada permohonan menunggu kelulusan</p>
              <p className="text-sm mt-2">Semua permohonan telah diproses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingTableHOD;