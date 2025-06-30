import { useState } from 'react';
import { 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaCheck,
  FaFire
} from 'react-icons/fa';
import { RotateCcw } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData } from '../../hooks/useUserData';
import TButton from '../../components/Core/TButton';
import UnifiedCard from '../../components/Core/UnifiedCard';
import UnifiedBillingTable from '../../components/Core/UnifiedBillingTable';

function BillingTableFinance() {
  const { currentUser } = useStateContext();
  
  // TanStack Query hook untuk get dashboard data - SAME AS APPLICANT
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  const [activeTab, setActiveTab] = useState('review'); // 'all', 'review', 'verify', 'payment'

  // Extract data dari dashboardData - SAME PATTERN AS APPLICANT
  const financeData = dashboardData?.finance || {};
  const stats = financeData.summary || {};
  const allBillings = financeData.needing_attention || [];
  
  // Filter billings based on active tab
  const getFilteredBillings = () => {
    if (activeTab === 'all') return allBillings;
    
    switch (activeTab) {
      case 'review':
        return allBillings.filter(billing => 
          billing.status === 'Semakan Kewangan' || billing.status_id === 3
        );
      case 'verify':
        return allBillings.filter(billing => 
          billing.status === 'Pengesahan Kewangan' || billing.status_id === 4
        );
      case 'approval':
        return allBillings.filter(billing => 
          billing.status === 'Menunggu Pengesahan' || billing.status_id === 5
        );
      case 'payment':
        return allBillings.filter(billing => 
          billing.status === 'Menunggu Bayaran' || billing.status_id === 6
        );
      default:
        return allBillings;
    }
  };

  const filteredBillings = getFilteredBillings();

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'sangat segera':
        return <FaFire className="w-4 h-4 text-red-500" />;
      case 'segera':
        return <FaExclamationTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getActionPath = (statusId) => {
    const paths = {
      3: 'check',
      4: 'verify',
      5: 'approval',
      6: 'payment',
    };
    return paths[statusId] || 'check'; // default to 'check' if status not mapped
  };

  const getActionIcon = (statusId) => {
    const paths = {
      3: <FaCheck className="w-3 h-3" />,
      4: <FaCheck className="w-3 h-3" />,
      5: <FaCheck className="w-3 h-3" />,
      6: <FaMoneyBillWave className="w-3 h-3" />,
    };
    return paths[statusId] || <FaCheck className="w-3 h-3" />;
  };

  const getActionTitle = (statusId) => {
    const titles = {
      3: 'Semak',
      4: 'Verifikasi',
      5: 'Pengesahan',
      6: 'Bayar',
    };
    return titles[statusId] || 'Semak';
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'review':
        return 'Menunggu Semakan';
      case 'verify':
        return 'Menunggu Verifikasi';
      case 'approval':
        return 'Menunggu Pengesahan';
      case 'payment':
        return 'Menunggu Bayaran';
      default:
        return 'Semua Permohonan';
    }
  };

  // Column configuration for UnifiedBillingTable
  const financeColumns = [
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
      className: 'text-gray-900'
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
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.status}
        </span>
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
        <span className="text-sm text-gray-600">{item.days_pending_display}</span>
      )
    }
  ];

  // Actions renderer for UnifiedBillingTable
  const financeRenderActions = (item) => (
    <div className="flex items-center justify-center space-x-2">
      <TButton 
        color="check" 
        to={`/finance/${item.id}/${getActionPath(item.status_id)}`} 
        size="sm" 
        title={getActionTitle(item.status_id)}
      >
        {getActionIcon(item.status_id)}
      </TButton>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">💰</span>Kewangan
            </h1>
            <p className="text-gray-600 mt-1">Pengurusan pembayaran dan verifikasi kewangan</p>
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

      <div className="grid grid-cols-4 md:grid-cols-4 gap-6 mb-8">
        <UnifiedCard
          icon={FaClock}
          title="Menunggu Semakan"
          value={stats.pending_review || 0}
          color="bg-blue-500"
          description="Perlu disemak"
          tabKey="review"
          isActive={activeTab === 'review'}
          onClick={() => handleTabClick('review')}
          interactive={true}
          showActiveIndicator={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan yang menunggu semakan"
        />
        <UnifiedCard
          icon={FaExclamationTriangle}
          title="Menunggu Verifikasi"
          value={stats.pending_verify || 0}
          color="bg-orange-500"
          description="Perlu diverifikasi"
          tabKey="verify"
          isActive={activeTab === 'verify'}
          onClick={() => handleTabClick('verify')}
          interactive={true}
          showActiveIndicator={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan yang menunggu verifikasi"
        />
        <UnifiedCard
          icon={FaMoneyBillWave}
          title="Menunggu Pengesahan"
          value={stats.pending_approval || 0}
          color="bg-red-500"
          description="Perlu dihantar"
          tabKey="approval"
          isActive={activeTab === 'approval'}
          onClick={() => handleTabClick('approval')}
          interactive={true}
          showActiveIndicator={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan yang menunggu pengesahan"
        />
        <UnifiedCard
          icon={FaMoneyBillWave}
          title="Menunggu Bayaran"
          value={stats.pending_payment || 0}
          color="bg-red-500"
          description="Perlu dibayar"
          tabKey="payment"
          isActive={activeTab === 'payment'}
          onClick={() => handleTabClick('payment')}
          interactive={true}
          showActiveIndicator={true}
          useScaleEffect={true}
          ariaTitle="Lihat permohonan yang menunggu bayaran"
        />
      </div>

      <UnifiedBillingTable
        data={filteredBillings}
        loading={loading}
        error={error}
        title={getActiveTabTitle()}
        titleIcon={<FaMoneyBillWave className="w-5 h-5 text-blue-500" />}
        columns={financeColumns}
        renderActions={financeRenderActions}
        onRefresh={refetch}
        emptyIcon={FaCheckCircle}
        emptyTitle={activeTab === 'all' 
          ? 'Tiada permohonan menunggu semakan' 
          : `Tiada permohonan untuk ${getActiveTabTitle().toLowerCase()}`
        }
        emptyDescription={activeTab === 'all' 
          ? 'Semua permohonan telah diproses' 
          : 'Cuba pilih tab lain untuk melihat permohonan lain'
        }
        showCount={true}
      />
    </div>
  );
}

export default BillingTableFinance;