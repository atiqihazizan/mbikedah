import { useState } from 'react';
import { 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaEye,
  FaCheck,
  FaCalendarAlt,
  FaFire,
  FaTimes,
  FaUndo
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { RotateCcw } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData } from '../../hooks/useUserData';
import { formatCurrency, formatDate } from '../../config/format';
import TButton from '../../components/Core/TButton';
import apiClient from '../../utils/axios';
import UnifiedCard from '../../components/Core/UnifiedCard';
import UnifiedBillingTable from '../../components/Core/UnifiedBillingTable';
import HodApprovalDialog from '../../components/dialogs/HodApprovalDialog';
import HodRejectDialog from '../../components/dialogs/HodRejectDialog';
import HodReturnDialog from '../../components/dialogs/HodReturnDialog';
import HodViewDialog from '../../components/dialogs/HodViewDialog';

function BillingTableHOD() {
  const { currentUser } = useStateContext();
  
  // TanStack Query hook untuk get dashboard data - SAME AS APPLICANT
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);

  const [activeTab, setActiveTab] = useState('urgent'); // 'urgent', 'all'

  // Approval Modal States - Simplified (approval logic moved to dialog)
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);

  // Reject Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Return Modal States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewBilling, setViewBilling] = useState(null);

  // Extract data dari dashboardData - SAME PATTERN AS APPLICANT
  const hodData = dashboardData?.hod || {};
  const stats = hodData.summary || {};
  const needingApproval = hodData.needing_approval || [];
  const performance = hodData.performance || {};

  // Helper function to extract days from days_pending_display
  const extractDays = (daysPendingDisplay) => {
    if (!daysPendingDisplay) return 0;
    const match = daysPendingDisplay.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter untuk urgent (lebih 3 hari)
  const urgentApprovals = needingApproval.filter(billing => extractDays(billing.days_pending_display) > 3);
  
  // Get filtered billings based on active tab
  const getFilteredBillings = () => {
    switch (activeTab) {
      case 'urgent':
        return urgentApprovals;
      case 'all':
      default:
        return needingApproval;
    }
  };

  const filteredBillings = getFilteredBillings();

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'urgent':
        return 'Permohonan Urgent (Tunggakan > 3 Hari)';
      case 'all':
      default:
        return 'Semua Permohonan Menunggu Kelulusan';
    }
  };

  const getActiveTabIcon = () => {
    switch (activeTab) {
      case 'urgent':
        return <FaFire className="w-5 h-5 mr-3 text-red-500" />;
      case 'all':
      default:
        return <FaClock className="w-5 h-5 mr-3 text-orange-500" />;
    }
  };

  // Simplified approve handler - logic moved to HodApprovalDialog
  const handleApprove = async (billing) => {
    try {
      setSelectedBilling(billing);
      setShowApprovalModal(true);
    } catch (error) {
      console.error('Error preparing approval:', error);
      toast.error('Ralat semasa menyediakan kelulusan');
    }
  };

  const handleReject = async (billing) => {
    try {
      setSelectedBilling(billing);
      setShowRejectModal(true);
      setRejectComment("");
    } catch (error) {
      console.error('Error preparing rejection:', error);
      toast.error('Ralat semasa menyediakan penolakan');
    }
  };

  const handleReturn = async (billing) => {
    try {
      setSelectedBilling(billing);
      setShowReturnModal(true);
      setReturnComment("");
    } catch (error) {
      console.error('Error preparing return:', error);
      toast.error('Ralat semasa menyediakan pemulangan');
    }
  };

  // Callback untuk success approval dari dialog
  const handleApprovalSuccess = () => {
    refetch(); // Refresh data using TanStack Query
  };

  const handleView = async (billing) => {
    try {
      const {data} = await apiClient.get(`/billings/${billing.id}`);
      data.issued_at = formatDate(data.issued_at);
      data.days_pending_display = billing.days_pending_display;
      setViewBilling(data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error viewing billing:', error);
      toast.error('Ralat semasa melihat permohonan');
    }
  };

  // Simplified close handlers
  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedBilling(null);
  };

  const handleCloseRejectModal = () => {
    if (!isRejecting) {
      setShowRejectModal(false);
      setSelectedBilling(null);
      setRejectComment("");
    }
  };

  const handleCloseReturnModal = () => {
    if (!isReturning) {
      setShowReturnModal(false);
      setSelectedBilling(null);
      setReturnComment("");
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

  // Column configuration for UnifiedBillingTable
  const hodColumns = [
    {
      key: 'running_no',
      label: 'No. Rujukan',
      render: (item) => (
        <span className="font-medium text-gray-900">{item.running_no}</span>
      )
    },
    {
      key: 'creator',
      label: 'Pemohon',
      render: (item) => (
        <span className="text-gray-900">{item.creator?.name || item.creator}</span>
      )
    },
    {
      key: 'recipient',
      label: 'Penerima',
      className: 'text-gray-900'
    },
    {
      key: 'total_amount',
      label: 'Jumlah',
      type: 'currency',
      headerClassName: 'text-right',
      cellClassName: 'text-right'
    },
    {
      key: 'created_at',
      label: 'Tarikh',
      render: (item) => (
        <span className="text-gray-600 text-sm">{item.created_at}</span>
      )
    },
    {
      key: 'priority',
      label: 'Prioriti',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.priority_class}`}>
          {getPriorityIcon(item.priority)}
          <span className="ml-1">{item.priority}</span>
        </span>
      )
    },
    {
      key: 'days_pending_display',
      label: 'Tempoh',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (item) => (
        <span className={`text-sm font-medium ${
          extractDays(item.days_pending_display) > 7 
            ? 'text-red-600' 
            : extractDays(item.days_pending_display) > 3 
            ? 'text-orange-600' 
            : 'text-gray-600'
        }`}>
          {item.days_pending_display}
        </span>
      )
    }
  ];

  // Actions renderer for UnifiedBillingTable
  const hodRenderActions = (item) => (
    <div className="flex items-center justify-center space-x-2">
      <TButton color="light" onClick={() => handleView(item)} title="Lihat Permohonan" className="!p-2">
        <FaEye className="w-4 h-4" />
      </TButton>
      <TButton color="green" onClick={() => handleApprove(item)} title="Luluskan" className="!p-2">
        <FaCheck className="w-4 h-4" />
      </TButton>
    </div>
  );

  // Helper function untuk renderCell (sama seperti dalam UnifiedBillingTable)
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item, column);
    }
    
    const value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
    
    if (column.type === 'currency') {
      return <span className="font-medium text-gray-900">{formatCurrency(value)}</span>;
    }
    
    if (column.type === 'date') {
      return <span className="text-gray-500">{formatDate(value)}</span>;
    }
    
    if (column.type === 'status') {
      const statusClass = column.getStatusClass ? column.getStatusClass(value, item) : 'bg-gray-100 text-gray-800';
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
          {value}
        </span>
      );
    }
    
    return <span className={column.className || "text-gray-900"}>{value}</span>;
  };

  // Custom row renderer untuk HOD (dengan conditional styling)
  const hodRenderRow = (item, rowIndex) => (
    <tr 
      key={item.id || rowIndex} 
      className={`hover:bg-gray-50 ${
        activeTab === 'urgent' && extractDays(item.days_pending_display) > 7 
          ? 'bg-red-50 border-l-4 border-red-500' 
          : activeTab === 'urgent' && extractDays(item.days_pending_display) > 3
          ? 'bg-orange-50 border-l-4 border-orange-400'
          : ''
      }`}
    >
      {hodColumns.map((column, colIndex) => (
        <td key={colIndex} className={`px-6 py-4 ${column.cellClassName || ''}`}>
          {renderCell(item, column)}
        </td>
      ))}
      <td className="px-6 py-4 text-sm font-medium">
        {hodRenderActions(item)}
      </td>
    </tr>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Updated Approval Modal - Simplified props */}
      <HodApprovalDialog
        showModal={showApprovalModal}
        selectedBilling={selectedBilling}
        onCloseModal={handleCloseApprovalModal}
        onApprovalSuccess={handleApprovalSuccess}
      />

      {/* View Modal */}
      <HodViewDialog
        showModal={showViewModal}
        viewBilling={viewBilling}
        onCloseModal={handleCloseViewModal}
        onApprove={handleApprove}
      />

      {/* Header - SAME PATTERN AS APPLICANT */}
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
          <button
            onClick={refetch}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-white"
            title="Refresh Data"
          >
            <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statistics Grid - Interactive Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-8">
        <UnifiedCard
          icon={FaFire}
          title="Urgent"
          value={urgentApprovals.length || 0}
          color="bg-red-500"
          description="Tunggakan > 3 hari"
          tabKey="urgent"
          isActive={activeTab === 'urgent'}
          onClick={() => handleTabClick('urgent')}
          interactive={true}
          showActiveIndicator={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan urgent (tunggakan lebih 3 hari)"
        />
        <UnifiedCard
          icon={FaClock}
          title="Semua Pending"
          value={stats.pending_approvals || 0}
          color="bg-orange-500"
          description="Permohonan yang perlu diluluskan"
          tabKey="all"
          isActive={activeTab === 'all'}
          onClick={() => handleTabClick('all')}
          interactive={true}
          showActiveIndicator={true}
          useScaleEffect={true}
          ariaTitle="Lihat semua permohonan pending"
        />
        <UnifiedCard
          icon={FaCalendarAlt}
          title="Jumlah Bulan Ini"
          value={performance.this_month || 0}
          color="bg-blue-500"
          description="Permohonan bulan semasa"
          interactive={false}
        />
      </div>

      {/* UnifiedBillingTable - Replaces the old table implementation */}
      <UnifiedBillingTable
        data={filteredBillings}
        loading={loading}
        error={error}
        title={getActiveTabTitle()}
        titleIcon={getActiveTabIcon()}
        columns={hodColumns}
        renderRow={hodRenderRow} // Custom row rendering untuk urgent styling
        showActionsColumn={true}
        onRefresh={refetch}
        emptyIcon={FaCheckCircle}
        emptyTitle={activeTab === 'urgent' 
          ? 'Tiada permohonan urgent pada masa ini' 
          : 'Tiada permohonan menunggu kelulusan'
        }
        emptyDescription={activeTab === 'urgent' 
          ? 'Semua permohonan dalam tempoh yang wajar' 
          : activeTab === 'all'
          ? 'Semua permohonan telah diproses'
          : 'Cuba pilih tab lain untuk melihat permohonan lain'
        }
        showCount={true}
      />
    </div>
  );
}

export default BillingTableHOD;