import React from 'react';
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
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData,useBillingTableHOD } from '../../hooks';
import { formatCurrency } from '../../config/format';
import { HodApprovalDialog, HodRejectDialog, HodReturnDialog, HodViewDialog } from '../../components/dialogs';
import { TButton, UnifiedCard, UnifiedBillingTable } from '../../components/Core';

function BillingTableHOD() {
  const { currentUser } = useStateContext();
  
  // ==================== DATA FETCHING ====================
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);

  // ==================== MAIN BUSINESS LOGIC HOOK ====================
  const {
    // State values
    activeTab,
    showApprovalModal,
    showRejectModal,
    showReturnModal,
    showViewModal,
    selectedBilling,
    viewBilling,
    selectedBillingId, // Now used for ViewDialog
    
    // Data values
    filteredBillings,
    statistics,
    
    // Helper functions
    getActiveTabTitle,
    getActiveTabIcon,
    getPriorityIcon,
    getRowStyling,
    getDaysPendingColor,
    
    // Event handlers - Simplified, no more API calls in component
    handleTabClick,
    handleApprove,
    handleReject,
    handleReturn,
    handleView, // Now simplified - just sets ID and basic info
    
    // Success callbacks
    handleApprovalSuccess,
    handleRejectSuccess,
    handleReturnSuccess,
    
    // Modal handlers
    handleCloseApprovalModal,
    handleCloseRejectModal,
    handleCloseReturnModal,
    handleCloseViewModal,
    
    // Configuration objects
    emptyStateConfig
  } = useBillingTableHOD(dashboardData, refetch);

  // ==================== COLUMN CONFIGURATION ====================
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
      key: 'issued_at',
      label: 'Tarikh',
      render: (item) => (
        <span className="text-gray-600 text-sm">{item.issued_at}</span>
      )
    },
    {
      key: 'priority',
      label: 'Prioriti',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (item) => {
        const iconConfig = getPriorityIcon(item.priority);
        const IconComponent = iconConfig.name === 'FaExclamationTriangle' ? FaExclamationTriangle :
                              iconConfig.name === 'FaClock' ? FaClock : FaCheckCircle;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.priority_class}`}>
            <IconComponent className={iconConfig.className} />
            <span className="ml-1">{item.priority}</span>
          </span>
        );
      }
    },
    {
      key: 'days_pending_display',
      label: 'Tempoh',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (item) => (
        <span className={`text-sm font-medium ${getDaysPendingColor(item)}`}>
          {item.days_pending_display}
        </span>
      )
    }
  ];

  // ==================== ACTIONS RENDERER ====================
  const hodRenderActions = (item) => (
    <div className="flex items-center justify-center space-x-1">
      <TButton 
        color="light" 
        onClick={() => handleView(item)} 
        title="Lihat Permohonan" 
        className="!p-2"
      >
        <FaEye className="w-4 h-4" />
      </TButton>
      <TButton 
        color="green" 
        onClick={() => handleApprove(item)} 
        title="Luluskan" 
        className="!p-2"
      >
        <FaCheck className="w-4 h-4" />
      </TButton>
      <TButton 
        color="red" 
        onClick={() => handleReject(item)} 
        title="Tolak" 
        className="!p-2"
      >
        <FaTimes className="w-4 h-4" />
      </TButton>
      <TButton 
        color="orange" 
        onClick={() => handleReturn(item)} 
        title="Kembalikan" 
        className="!p-2"
      >
        <FaUndo className="w-4 h-4" />
      </TButton>
    </div>
  );

  // ==================== CELL RENDERER ====================
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item, column);
    }
    
    const value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
    
    if (column.type === 'currency') {
      return <span className="font-medium text-gray-900">{formatCurrency(value)}</span>;
    }
    
    return <span className={column.className || "text-gray-900"}>{value}</span>;
  };

  // ==================== ROW RENDERER ====================
  const hodRenderRow = (item, rowIndex) => (
    <tr 
      key={item.id || rowIndex} 
      className={`hover:bg-gray-50 ${getRowStyling(item)}`}
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

  // ==================== RENDER TAB ICON ====================
  const renderTabIcon = () => {
    const iconConfig = getActiveTabIcon();
    const IconComponent = iconConfig.name === 'FaFire' ? FaFire : FaClock;
    return <IconComponent className={iconConfig.className} />;
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* ==================== MODALS ==================== */}
      
      {/* Approval Modal - Self-contained logic */}
      <HodApprovalDialog
        showModal={showApprovalModal}
        selectedBilling={selectedBilling}
        onCloseModal={handleCloseApprovalModal}
        onApprovalSuccess={handleApprovalSuccess}
      />

      {/* View Modal - Now handles its own data fetching! */}
      <HodViewDialog
        showModal={showViewModal}
        billingId={selectedBillingId} // Pass ID instead of full data
        billingBasicInfo={viewBilling} // Basic info for loading display
        onCloseModal={handleCloseViewModal}
        onApprove={handleApprove}
        onReject={handleReject}
        onReturn={handleReturn}
      />

      {/* Reject Modal - Self-contained logic */}
      <HodRejectDialog
        showModal={showRejectModal}
        selectedBilling={selectedBilling}
        onCloseModal={handleCloseRejectModal}
        onRejectSuccess={handleRejectSuccess}
      />

      {/* Return Modal - Self-contained logic */}
      <HodReturnDialog
        showModal={showReturnModal}
        selectedBilling={selectedBilling}
        onCloseModal={handleCloseReturnModal}
        onReturnSuccess={handleReturnSuccess}
      />

      {/* ==================== HEADER ==================== */}
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
        </div>
      </div>

      {/* ==================== INTERACTIVE STATISTICS CARDS ==================== */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-8">
        <UnifiedCard
          icon={FaFire}
          title="Urgent"
          value={statistics.urgent}
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
          value={statistics.pending}
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
          value={statistics.thisMonth}
          color="bg-blue-500"
          description="Permohonan bulan semasa"
          interactive={false}
        />
      </div>

      {/* ==================== UNIFIED BILLING TABLE ==================== */}
      <UnifiedBillingTable
        data={filteredBillings}
        loading={loading}
        error={error}
        title={getActiveTabTitle()}
        titleIcon={renderTabIcon()}
        columns={hodColumns}
        renderRow={hodRenderRow}
        showActionsColumn={true}
        onRefresh={refetch}
        emptyIcon={FaCheckCircle}
        emptyTitle={emptyStateConfig.title}
        emptyDescription={emptyStateConfig.description}
        showCount={true}
      />
    </div>
  );
}

export default BillingTableHOD;