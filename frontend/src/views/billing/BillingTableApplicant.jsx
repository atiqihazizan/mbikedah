import { useState } from 'react';
import { FileText, Clock, Edit, Plus, RotateCcw, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData } from '../../hooks/useUserData';
import { formatCurrency, formatDate } from '../../config/format';
import BillingFormDialog from '../../components/dialogs/BillingFormDialog';
import UnifiedCard from '../../components/Core/UnifiedCard';
import UnifiedBillingTable from '../../components/Core/UnifiedBillingTable';
import TButton from '../../components/Core/TButton';

function BillingTableApplicant() {
  const { currentUser } = useStateContext();
  
  // TanStack Query hook untuk get dashboard data
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  const [activeTab, setActiveTab] = useState('pending');
  
  // Dialog states
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState(null);
  const [dialogMode, setDialogMode] = useState('create');
  
  // Extract data dari dashboardData
  const applicantData = dashboardData?.applicant || {};
  const stats = applicantData.summary || {};
  const applications = applicantData.my_billings || [];
  const statusCounts = applicantData.status_counts || {};
  const quickActions = applicantData.quick_actions || {};

  // Status mapping untuk filter
  const statusMapping = {
    'all': { statuses: [], label: 'Semua' },
    'pending': { statuses: ['Semakan Kewangan', 'Menunggu Kelulusan'], label: 'Menunggu' },
    'completed': { statuses: ['Permohonan Dibayar', 'Selesai'], label: 'Selesai' },
    'draft': { statuses: ['Draf'], label: 'Draf' },
    'rejected': { statuses: ['Ditolak'], label: 'Ditolak' }
  };

  // Filter applications berdasarkan active tab
  const filteredApplications = activeTab === 'all' 
    ? applications 
    : applications.filter(app => statusMapping[activeTab].statuses.includes(app.status));

  // Dialog handlers
  const handleCreateNew = () => {
    setSelectedBillingId(null);
    setDialogMode('create');
    setShowBillingDialog(true);
  };

  const handleEditBilling = (billingId) => {
    setSelectedBillingId(billingId);
    setDialogMode('edit');
    setShowBillingDialog(true);
  };

  const handleViewBilling = (billingId) => {
    setSelectedBillingId(billingId);
    setDialogMode('view');
    setShowBillingDialog(true);
  };

  const handleDialogClose = () => {
    setShowBillingDialog(false);
    setSelectedBillingId(null);
    setDialogMode('create');
  };

  // Callback ini akan dipanggil selepas save - data akan auto update melalui TanStack Query!
  const handleDialogSaved = (savedData) => {
    console.log('Billing saved:', savedData);
    // No need to manually refresh - TanStack Query mutation handles the cache update!
  };

  const handleTabChange = (tabKey) => setActiveTab(tabKey);

  // Helper functions
  const getStatusColor = (status, statusClass) => {
    if (statusClass) return statusClass;
    
    switch (status.toLowerCase()) {
      case 'semakan kewangan': return 'bg-blue-100 text-blue-800';
      case 'permohonan dibayar': return 'bg-green-100 text-green-800';
      case 'draf': return 'bg-gray-100 text-gray-800';
      case 'menunggu kelulusan': return 'bg-yellow-100 text-yellow-800';
      case 'ditolak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // UnifiedBillingTable configuration
  const applicantColumns = [
    {
      key: 'running_no',
      label: 'No. Rujukan',
      render: (item) => <div className="text-sm font-medium text-gray-900">{item.running_no}</div>
    },
    {
      key: 'recipient',
      label: 'Penerima',
      className: 'text-sm text-gray-900'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      getStatusClass: (status, item) => getStatusColor(status, item.status_class)
    },
    {
      key: 'total_amount',
      label: 'Jumlah',
      type: 'currency',
      cellClassName: 'text-sm text-gray-900 font-medium'
    },
    {
      key: 'created_at',
      label: 'Tarikh',
      type: 'date',
      cellClassName: 'text-sm text-gray-500'
    }
  ];

  const applicantRenderActions = (item) => (
    <div className="flex space-x-2">
      <TButton onClick={() => handleViewBilling(item.id)} variant="link" color="blue" size="sm" circle title="Lihat">
        <Eye className="w-4 h-4" />
      </TButton>
      {item.can_edit && (
        <TButton onClick={() => handleEditBilling(item.id)} variant="link" color="green" size="sm" circle title="Edit">
          <Edit className="w-4 h-4" />
        </TButton>
      )}
    </div>
  );

  const applicantEmptyAction = quickActions.can_create_new && activeTab === 'all' ? (
    <TButton onClick={handleCreateNew} color='primary' size='sm' title="Buat Permohonan Baru">
      <Plus className="w-4 h-4 mr-2" />
      Permohonan Baru
    </TButton>
  ) : null;

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📝</span>
              Permohonan 
            </h1>
            <p className="text-gray-600 mt-1">
              Senarai permohonan yang sedang dalam proses
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Kadar Selesai: <span className="font-semibold text-green-600">{stats.completion_rate}%</span>
              {stats.total_approved_amount && (
                <span className="ml-4">
                  Jumlah Diluluskan: <span className="font-semibold text-blue-600">
                    {formatCurrency(stats.total_approved_amount)}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            {quickActions.can_create_new && (
              <TButton onClick={handleCreateNew} color='primary' size='sm' title="Buat Permohonan Baru">
                <Plus className="w-4 h-4 mr-2" />
                Permohonan Baru
              </TButton>
            )}
            <TButton color="refresh" onClick={refetch} title="Refresh Data">
              <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </TButton>
          </div>
        </div>
      </div>

      {/* Statistics/Filter Tabs Grid - AKAN AUTO UPDATE SELEPAS SAVE! */}
      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
        <UnifiedCard
          icon={Edit}
          title="Draf"
          value={statusCounts.draft || 0}
          color="bg-gray-500"
          description="Belum dihantar"
          tabKey="draft"
          isActive={activeTab === 'draft'}
          onClick={() => handleTabChange('draft')}
          interactive={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan draf"
          showActiveIndicator={true}
        />
        <UnifiedCard
          icon={Clock}
          title="Menunggu"
          value={statusCounts.pending || 0}
          color="bg-yellow-500"
          description="Perlu kelulusan"
          tabKey="pending"
          isActive={activeTab === 'pending'}
          onClick={() => handleTabChange('pending')}
          interactive={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan menunggu"
          showActiveIndicator={true}
        />
        <UnifiedCard
          icon={CheckCircle}
          title="Selesai"
          value={statusCounts.completed || 0}
          color="bg-green-500"
          description="Permohonan selesai"
          tabKey="completed"
          isActive={activeTab === 'completed'}
          onClick={() => handleTabChange('completed')}
          interactive={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan selesai"
          showActiveIndicator={true}
        />
        <UnifiedCard
          icon={XCircle}
          title="Ditolak"
          value={statusCounts.rejected || 0}
          color="bg-red-500"
          description="Perlu tindakan"
          tabKey="rejected"
          isActive={activeTab === 'rejected'}
          onClick={() => handleTabChange('rejected')}
          interactive={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan ditolak"
          showActiveIndicator={true}
        />
      </div>

      {/* Quick Actions Alert */}
      {quickActions.returned_to_fix > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 w-5 h-5 mr-3" />
            <span className="text-red-800 font-medium">
              Terdapat {quickActions.returned_to_fix} permohonan yang perlu diperbaiki
            </span>
          </div>
        </div>
      )}

      {/* Applications Table - Updated to use UnifiedBillingTable */}
      <UnifiedBillingTable
        data={filteredApplications}
        loading={loading}
        error={error}
        title={activeTab === 'all' 
          ? `Senarai Semua Permohonan` 
          : `Senarai Permohonan ${statusMapping[activeTab].label}`
        }
        columns={applicantColumns}
        renderActions={applicantRenderActions}
        onRefresh={refetch}
        emptyTitle="Tiada permohonan pada masa ini"
        emptyAction={applicantEmptyAction}
        showCount={true}
      />

      <BillingFormDialog show={showBillingDialog} onClose={handleDialogClose} onSaved={handleDialogSaved} billingId={selectedBillingId} mode={dialogMode} />
    </div>
  );
}

export default BillingTableApplicant;