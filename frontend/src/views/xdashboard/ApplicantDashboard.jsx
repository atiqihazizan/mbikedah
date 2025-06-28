import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash
} from "react-icons/fa";
import { toast } from "react-toastify";
import { formatUtils, dashboardHelpers } from "../../utils/formatUtils";
import apiClient from "../../axios";

export default function ApplicantDashboard({ data, onRefresh }) {
  // Safe data extraction dengan proper defaults
  const summary = dashboardHelpers.extractSafeData(data, 'summary', {});
  const myBillings = dashboardHelpers.extractSafeData(data, 'my_billings', []);
  const statusCounts = dashboardHelpers.extractSafeData(data, 'status_counts', {});
  const quickActions = dashboardHelpers.extractSafeData(data, 'quick_actions', {});

  // State untuk active tab
  const [activeTab, setActiveTab] = useState('draft');
  
  // State untuk delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats cards data dengan safe formatting - 3 cards sahaja
  const statsCards = [
    {
      id: 'draft',
      title: "Draf",
      value: dashboardHelpers.getDisplayValue(summary.drafts, '0'),
      icon: FaEdit,
      color: "gray",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      borderColor: "border-gray-200"
    },
    {
      id: 'pending',
      title: "Menunggu Kelulusan",
      value: dashboardHelpers.getDisplayValue(summary.pending_approvals, '0'),
      icon: FaClock,
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    },
    {
      id: 'all',
      title: "Jumlah Permohonan",
      value: dashboardHelpers.getDisplayValue(summary.total_applications, '0'),
      icon: FaFileAlt,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    }
  ];

  // Filter billings berdasarkan active tab
  const filteredBillings = useMemo(() => {
    if (activeTab === 'all') {
      return myBillings;
    } else if (activeTab === 'pending') {
      // Filter untuk status pending approvals (customize based on your status IDs)
      return myBillings.filter(billing => 
        [2, 3, 4, 5, 6].includes(billing.status_id) // Adjust status IDs as needed
      );
    } else if (activeTab === 'draft') {
      // Filter untuk draft status
      return myBillings.filter(billing => billing.status_id === 1); // Adjust status ID as needed
    }
    return myBillings;
  }, [myBillings, activeTab]);

  const getStatusBadge = (statusId) => {
    const config = formatUtils.getStatusConfig(statusId);
    return config;
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleDeleteDraft = (billing) => {
    setSelectedBilling(billing);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBilling) return;

    try {
      setIsDeleting(true);

      const response = await apiClient.delete(`/billings/${selectedBilling.id}`);

      if (response.success || response.status === 200) {
        toast.success('Draf berjaya dibuang');
        
        // Reset modal state
        setShowDeleteModal(false);
        setSelectedBilling(null);
        
        // Refresh data
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(response.data.message || 'Ralat tidak diketahui');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Ralat semasa membuang draf'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setSelectedBilling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black opacity-50"
            onClick={handleCloseDeleteModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Buang Draf
              </h3>
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Adakah anda pasti untuk membuang draf ini? Data ini tidak boleh dikembalikan setelah dibuang.
              </p>
              
              {/* Billing Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">No. Rujukan:</span> {selectedBilling.running_no}
                  </div>
                  <div>
                    <span className="font-medium">Penerima:</span> {selectedBilling.recipient || 'Belum ditetapkan'}
                  </div>
                  <div>
                    <span className="font-medium">Jumlah:</span> {formatUtils.formatCurrency(selectedBilling.total_amount)}
                  </div>
                  <div>
                    <span className="font-medium">Tarikh Dibuat:</span> {formatUtils.formatDate(selectedBilling.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Membuang...</span>
                  </>
                ) : (
                  <>
                    <FaTrash className="w-4 h-4" />
                    <span>Buang Draf</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards as Tabs */}
      <div className="grid grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          const isActive = activeTab === stat.id;
          return (
            <div 
              key={index} 
              onClick={() => handleTabClick(stat.id)}
              className={`${isActive ? stat.bgColor + ' ring-2 ring-' + stat.color + '-200' : 'bg-white hover:' + stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'all' && 'Semua Permohonan'}
              {activeTab === 'pending' && 'Permohonan Menunggu Kelulusan'}
              {activeTab === 'draft' && 'Draf Permohonan'}
              <span className="ml-2 text-sm text-gray-500">({filteredBillings.length})</span>
            </h3>
            <Link
              to="/billing/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Permohonan Baru
            </Link>
          </div>
        </div>
        <div className="p-6">
          {filteredBillings.length > 0 ? (
            <div className="space-y-4">
              {filteredBillings.map((billing) => {
                const status = getStatusBadge(billing.status_id);
                return (
                  <div key={billing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-gray-900">{billing.running_no}</div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {dashboardHelpers.getDisplayValue(billing.recipient, 'Unknown')} • {formatUtils.formatCurrency(billing.total_amount)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatUtils.formatDate(billing.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/billing/${billing.id}/view`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="Lihat"
                      >
                        <FaEye className="w-4 h-4" />
                      </Link>
                      {billing.can_edit && (
                        <Link
                          to={`/billing/${billing.id}/edit`}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>
                      )}
                      {billing.can_edit && billing.status_id === 1 && (
                        <button
                          onClick={() => handleDeleteDraft(billing)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          title="Buang Draf"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {activeTab === 'all' && 'Tiada permohonan terkini'}
                {activeTab === 'pending' && 'Tiada permohonan menunggu kelulusan'}
                {activeTab === 'draft' && 'Tiada draf permohonan'}
              </p>
              <Link
                to="/billing/create"
                className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Buat Permohonan Baru
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}