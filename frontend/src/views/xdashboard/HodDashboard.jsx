import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  FaCheckCircle, 
  FaClock, 
  FaBuilding,
  FaEye,
  FaThumbsUp,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTradeFederation,
  FaFire,
  FaTimes
} from "react-icons/fa";
import { toast } from "react-toastify";
import { formatUtils, dashboardHelpers } from "../../utils/formatUtils";
import apiClient from "../../axios";

export default function HodDashboard({ data, onRefresh }) {
  const summary = dashboardHelpers.extractSafeData(data, 'summary', {});
  const needingApproval = dashboardHelpers.extractSafeData(data, 'needing_approval', []);
  const statusCounts = dashboardHelpers.extractSafeData(data, 'status_counts', {});
  const performance = dashboardHelpers.extractSafeData(data, 'performance', {});

  // State untuk approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Kira urgent approvals (melebihi 3 hari)
  const urgentApprovals = useMemo(() => {
    return needingApproval.filter(billing => billing.days_pending > 3);
  }, [needingApproval]);

  // Susun permohonan mengikut keutamaan (urgent first, kemudian mengikut hari)
  const sortedApprovals = useMemo(() => {
    return [...needingApproval].sort((a, b) => {
      // Urgent approvals first
      const aUrgent = a.days_pending > 3;
      const bUrgent = b.days_pending > 3;
      
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      
      // Kemudian susun mengikut hari (yang lama dulu)
      return b.days_pending - a.days_pending;
    });
  }, [needingApproval]);

  // Check if selected billing is urgent
  const isSelectedBillingUrgent = selectedBilling && selectedBilling.days_pending > 3;

  // Stats cards untuk HOD - focus pada urgent dan pending sahaja
  const statsCards = [
    {
      title: "Menunggu Kelulusan",
      value: dashboardHelpers.getDisplayValue(summary.pending_approvals, '0'),
      icon: FaClock,
      color: "red",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
      urgent: formatUtils.safeNumber(summary.pending_approvals) > 0
    },
    {
      title: "Permohonan Mendesak",
      subtitle: "Melebihi 3 Hari",
      value: urgentApprovals.length.toString(),
      icon: FaFire,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      urgent: urgentApprovals.length > 0
    }
  ];

  const getPriorityConfig = (days) => {
    return formatUtils.getPriorityConfig(days);
  };

  const handleApprove = async (billingId) => {
    try {
      // Cari billing data berdasarkan ID
      const billing = needingApproval.find(item => item.id === billingId);
      
      if (!billing) {
        console.error('Billing not found:', billingId);
        toast.error('Permohonan tidak dijumpai');
        return;
      }

      // Set selected billing dan tunjukkan modal
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
        
        // Reset form dan tutup modal
        setApprovalComment("");
        setShowApprovalModal(false);
        setSelectedBilling(null);
        
        // Refresh data jika callback tersedia
        if (onRefresh) {
          onRefresh();
        }
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

  const handleCloseModal = () => {
    if (!isApproving) {
      setShowApprovalModal(false);
      setSelectedBilling(null);
      setApprovalComment("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal Approval Khusus HOD */}
      {showApprovalModal && selectedBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black opacity-50"
            onClick={handleCloseModal}
          ></div>

          {/* Modal Content */}
          <div className={`relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ${isSelectedBillingUrgent ? 'ring-2 ring-red-500' : ''}`}>
            {/* Urgent Banner */}
            {isSelectedBillingUrgent && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Permohonan Mendesak
                    </p>
                    <p className="text-xs text-red-600">
                      Telah tertunggak selama {selectedBilling.days_pending} hari
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isSelectedBillingUrgent ? 'text-red-800' : 'text-gray-900'}`}>
                Kelulusan Ketua Jabatan
                {isSelectedBillingUrgent && <span className="text-red-600 ml-2">(Mendesak)</span>}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isApproving}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Billing Info */}
            <div className={`rounded-lg p-4 mb-4 ${isSelectedBillingUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">No. Rujukan:</span> {selectedBilling.running_no}
                </div>
                <div>
                  <span className="font-medium">Pemohon:</span> {selectedBilling.creator}
                </div>
                <div>
                  <span className="font-medium">Penerima:</span> {selectedBilling.recipient}
                </div>
                <div>
                  <span className="font-medium">Jumlah:</span> {formatUtils.formatCurrency(selectedBilling.total_amount)}
                </div>
                <div>
                  <span className="font-medium">Tarikh Permohonan:</span> {formatUtils.formatDate(selectedBilling.created_at)}
                </div>
                <div>
                  <span className="font-medium">Hari Tertunggak:</span> 
                  <span className={`ml-1 font-bold ${isSelectedBillingUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                    {selectedBilling.days_pending} hari
                  </span>
                </div>
              </div>
            </div>

            {/* Urgent Warning */}
            {isSelectedBillingUrgent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Amaran:</strong> Permohonan ini telah melebihi 3 hari dan memerlukan tindakan segera.
                </p>
              </div>
            )}

            {/* Comment Section */}
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${stat.urgent ? 'ring-2 ring-red-200' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mb-2">{stat.subtitle}</p>
                  )}
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.urgent && stat.title === "Permohonan Mendesak" && urgentApprovals.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">Memerlukan Tindakan Segera</p>
                  )}
                  {stat.urgent && stat.title === "Menunggu Kelulusan" && formatUtils.safeNumber(summary.pending_approvals) > 0 && (
                    <p className="text-xs text-red-600 mt-1 font-medium">Perlu Tindakan Segera</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Urgent Approvals Alert */}
      {urgentApprovals.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <FaFire className="w-6 h-6 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-orange-800">
              Permohonan Mendesak (Melebihi 3 Hari)
            </h3>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            Terdapat {urgentApprovals.length} permohonan yang telah tertunggak melebihi 3 hari dan memerlukan tindakan segera.
          </p>
          <div className="flex space-x-2">
            <Link
              to="/billing/pending-hod"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              <FaFire className="w-4 h-4 mr-2" />
              Lihat Permohonan Mendesak
            </Link>
          </div>
        </div>
      )}

      {/* General Urgent Approvals (if any remaining) */}
      {formatUtils.safeNumber(summary.pending_approvals) > urgentApprovals.length && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">
              Permohonan Menunggu Kelulusan Anda
            </h3>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Terdapat {summary.pending_approvals - urgentApprovals.length} permohonan lain yang memerlukan kelulusan dari anda.
          </p>
          <Link
            to="/billing/pending-hod"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <FaThumbsUp className="w-4 h-4 mr-2" />
            Proses Kelulusan
          </Link>
        </div>
      )}

      {/* Pending Approvals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Permohonan Perlu Kelulusan
              {urgentApprovals.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  {urgentApprovals.length} Mendesak
                </span>
              )}
            </h3>
            {/* <Link
              to="/billing/pending-hod"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Lihat Semua
            </Link> */}
          </div>
        </div>
        <div className="p-6">
          {sortedApprovals.length > 0 ? (
            <div className="space-y-4">
              {sortedApprovals.map((billing) => {
                const priorityConfig = getPriorityConfig(billing.days_pending);
                const isUrgent = billing.days_pending > 3;
                
                return (
                  <div 
                    key={billing.id} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${
                      isUrgent 
                        ? 'bg-orange-50 border border-orange-200 hover:bg-orange-100' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {isUrgent && <FaFire className="w-4 h-4 text-orange-600" />}
                        <div className="font-medium text-gray-900">{billing.running_no}</div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig.className}`}>
                          {formatUtils.formatDaysPending(billing.days_pending)}
                        </span>
                        {isUrgent && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-200 text-orange-800 rounded-full">
                            MENDESAK
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">{dashboardHelpers.getDisplayValue(billing.creator, 'Unknown')}</span> • {dashboardHelpers.getDisplayValue(billing.recipient, 'Unknown')}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {formatUtils.formatCurrency(billing.total_amount)} • {formatUtils.formatDate(billing.created_at)}
                      </div>
                      {isUrgent && (
                        <div className="mt-1 text-xs text-orange-600 font-medium">
                          ⚠️ Tertunggak {billing.days_pending} hari - Memerlukan tindakan segera
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/billing/${billing.id}/hod/show`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                      >
                        <FaEye className="w-4 h-4 mr-2" />
                        Lihat
                      </Link>
                      <button
                        onClick={() => handleApprove(billing.id)}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white border border-transparent rounded-md transition-colors duration-200 ${
                          isUrgent
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <FaThumbsUp className="w-4 h-4 mr-2" />
                        {isUrgent ? 'Luluskan Segera' : 'Luluskan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Tiada permohonan menunggu kelulusan</p>
              <p className="text-sm text-gray-500 mt-1">Semua permohonan telah diproses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}