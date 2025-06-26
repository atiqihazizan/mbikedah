import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaSync,
  FaEye,
  FaCheck,
  FaFire
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../config/format';
import TButton from '../../components/Core/TButton';
import apiClient from '../../axios';

function BillingTableFinance() {
  const { 
    dashboardData, 
    currentActiveRole,
    tabNotifications 
  } = useOutletContext();
  
  const [financeData, setFinanceData] = useState(dashboardData?.finance || {});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('review'); // 'all', 'review', 'verify', 'payment'

  // Action Modal States
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [actionType, setActionType] = useState(''); // 'review', 'verify', 'payment'
  const [actionComment, setActionComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewBilling, setViewBilling] = useState(null);

  // Update data when dashboardData changes
  useEffect(() => {
    if (dashboardData?.finance) {
      setFinanceData(dashboardData.finance);
    }
  }, [dashboardData]);

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

  const StatCard = ({ icon: Icon, title, value, color, description, tabKey, isActive, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all cursor-pointer hover:shadow-md ${
        isActive 
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} ${isActive ? 'ring-2 ring-white' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-lg font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
            {value}
          </p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {isActive && (
          <div className="ml-2">
            <FaCheckCircle className="w-5 h-5 text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  // const handleAction = async (billing, type) => {
  //   try {
  //     setSelectedBilling(billing);
  //     setActionType(type);
  //     setShowActionModal(true);
  //     setActionComment("");
  //   } catch (error) {
  //     console.error('Error preparing action:', error);
  //     toast.error('Ralat semasa menyediakan tindakan');
  //   }
  // };


  // const handleView = async (billing) => {
  //   try {
  //     const {data} = await apiClient.get(`/billings/${billing.id}`);
  //     console.log(data);
  //     setViewBilling(data);
  //     setShowViewModal(true);
  //   } catch (error) {
  //     console.error('Error viewing billing:', error);
  //     toast.error('Ralat semasa melihat permohonan');
  //   }
  // };

  // const handleCloseActionModal = () => {
  //   if (!isProcessing) {
  //     setShowActionModal(false);
  //     setSelectedBilling(null);
  //     setActionType('');
  //     setActionComment("");
  //   }
  // };

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

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">💰</span>Kewangan
            </h1>
            <p className="text-gray-600 mt-1">Pengurusan pembayaran dan verifikasi kewangan</p>
          </div>
          <TButton
            color="ghost"
            onClick={() => setLoading(!loading)}
            title="Refresh Data"
          >
            <FaSync className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </TButton>
        </div>
      </div>

      {/* Tab Navigation */}
      {/* <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => handleTabClick('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Semua ({allBillings.length})
          </button>
          <button
            onClick={() => handleTabClick('review')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'review'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Semakan ({stats.pending_review || 0})
          </button>
          <button
            onClick={() => handleTabClick('verify')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'verify'
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Verifikasi ({stats.pending_verify || 0})
          </button>
          <button
            onClick={() => handleTabClick('payment')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'payment'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Bayaran ({stats.pending_payment || 0})
          </button>
        </div>
      </div> */}

      {/* Statistics Grid - Now clickable tabs */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaClock}
          title="Menunggu Semakan"
          value={stats.pending_review || 0}
          color="bg-blue-500"
          description="Perlu disemak"
          tabKey="review"
          isActive={activeTab === 'review'}
          onClick={() => handleTabClick('review')}
        />
        <StatCard
          icon={FaExclamationTriangle}
          title="Menunggu Verifikasi"
          value={stats.pending_verify || 0}
          color="bg-orange-500"
          description="Perlu diverifikasi"
          tabKey="verify"
          isActive={activeTab === 'verify'}
          onClick={() => handleTabClick('verify')}
        />
        <StatCard
          icon={FaMoneyBillWave}
          title="Menunggu Pengesahan"
          value={stats.pending_approval || 0}
          color="bg-red-500"
          description="Perlu dihantar"
          tabKey="approval"
          isActive={activeTab === 'approval'}
          onClick={() => handleTabClick('approval')}
        />
        <StatCard
          icon={FaMoneyBillWave}
          title="Menunggu Bayaran"
          value={stats.pending_payment || 0}
          color="bg-red-500"
          description="Perlu dibayar"
          tabKey="payment"
          isActive={activeTab === 'payment'}
          onClick={() => handleTabClick('payment')}
        />
      </div>

      {/* Billing List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaMoneyBillWave className="w-5 h-5 mr-3 text-blue-500" />
            {getActiveTabTitle()}
            {filteredBillings.length > 0 && (
              <span className="ml-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                {filteredBillings.length}
              </span>
            )}
          </h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
          ) : filteredBillings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">No. Rujukan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">Pemohon</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">Penerima</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 uppercase text-xs">Jumlah</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase text-xs">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 uppercase text-xs">Prioriti</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 uppercase text-xs">Tempoh</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 uppercase text-xs">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBillings.map((billing) => (
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
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {billing.status}
                        </span>
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
                            color="check" 
                            to={`/billing/${billing.id}/${getActionPath(billing.status_id)}`} 
                            size="sm" 
                            title={getActionTitle(billing.status_id)}
                          >
                            {getActionIcon(billing.status_id)}
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
              <p className="text-lg">
                {activeTab === 'all' 
                  ? 'Tiada permohonan menunggu semakan' 
                  : `Tiada permohonan untuk ${getActiveTabTitle().toLowerCase()}`
                }
              </p>
              <p className="text-sm mt-2">
                {activeTab === 'all' 
                  ? 'Semua permohonan telah diproses' 
                  : 'Cuba pilih tab lain untuk melihat permohonan lain'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingTableFinance;