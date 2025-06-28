import { Link } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaCheck } from "react-icons/fa";
import StatCard from './StatCard';
import { formatCurrency } from "../../config/format";

function FinanceDashboard({ data }) {
  // State untuk active tab
  const [activeTab, setActiveTab] = useState('pending_review');

  // Stats cards data dengan tab functionality
  const statsCards = [
    {
      id: 'pending_review',
      title: "Perlu Semakan", 
      value: data.status_counts.pending_review, 
      icon: "🔍", 
      color: "bg-yellow-100 text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      id: 'pending_verify',
      title: "Perlu Pengesahan", 
      value: data.status_counts.pending_verify, 
      icon: "📑", 
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      id: 'pending_payment',
      title: "Perlu Bayaran", 
      value: data.status_counts.pending_payment, 
      icon: "💸", 
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    }
  ];

  // Filter items berdasarkan active tab
  const filteredItems = data.needing_attention.filter(item => {
    switch(activeTab) {
      case 'pending_review':
        return item.status_id === 3;
      case 'pending_verify':
        return item.status_id === 4;
      case 'pending_payment':
        return item.status_id === 6;
      default:
        return true;
    }
  });

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const getStatusColor = (statusId) => {
    switch(statusId) {
      case 3: return 'bg-yellow-100 text-yellow-800'; // FINANCE_REVIEW
      case 4: return 'bg-orange-100 text-orange-800'; // FINANCE_VERIFY
      case 6: return 'bg-blue-100 text-blue-800'; // PROCESSING_PAYMENT
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Dashboard Kewangan</h2>
      
      {/* Stats Cards as Tabs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {statsCards.map((stat, index) => {
          const isActive = activeTab === stat.id;
          return (
            <div
              key={index}
              onClick={() => handleTabClick(stat.id)}
              className={`${isActive ? stat.bgColor + ' ring-2 ' + (stat.id === 'pending_review' ? 'ring-yellow-200' : stat.id === 'pending_verify' ? 'ring-orange-200' : 'ring-blue-200') : 'bg-white hover:' + stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-2xl ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">
          {activeTab === 'pending_review' && 'Permohonan Perlu Semakan'}
          {activeTab === 'pending_verify' && 'Permohonan Perlu Pengesahan'}
          {activeTab === 'pending_payment' && 'Permohonan Perlu Bayaran'}
          <span className="ml-2 text-sm text-gray-500">({filteredItems.length})</span>
        </h3>
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-900">{item.running_no}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_id)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">{item.creator}</span> • {item.department}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {formatCurrency(item.total_amount)}
                  </div>
                  {item.days_pending > 7 && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      ⚠️ Tertunggak {item.days_pending_display} - Memerlukan tindakan segera
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right mr-4">
                    <span className={`text-sm font-medium ${item.days_pending > 7 ? 'text-red-600' : 'text-gray-600'}`}>
                      {item.days_pending_display}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* View Button - Always visible */}
                    <Link
                      to={`/billing/${item.id}/view`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FaEye className="w-4 h-4 mr-2" />
                      Lihat
                    </Link>
                    
                    {/* Check Button - Status 3 (FINANCE_REVIEW) */}
                    {item.status_id === 3 && (
                      <Link
                        to={`/billing/${item.id}/check`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 transition-colors duration-200"
                      >
                        <FaCheck className="w-4 h-4 mr-2" />
                        Semak
                      </Link>
                    )}
                    
                    {/* Verify Button - Status 4 (FINANCE_VERIFY) */}
                    {item.status_id === 4 && (
                      <Link
                        to={`/billing/${item.id}/verify`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 transition-colors duration-200"
                      >
                        <FaCheck className="w-4 h-4 mr-2" />
                        Sahkan
                      </Link>
                    )}
                    
                    {/* Process Payment Button - Status 6 (PROCESSING_PAYMENT) */}
                    {item.status_id === 6 && (
                      <Link
                        to={`/billing/${item.id}/payment`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        <FaCheck className="w-4 h-4 mr-2" />
                        Proses
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            {activeTab === 'pending_review' && 'Tiada permohonan perlu semakan'}
            {activeTab === 'pending_verify' && 'Tiada permohonan perlu pengesahan'}
            {activeTab === 'pending_payment' && 'Tiada permohonan perlu bayaran'}
          </p>
        )}
      </div>
    </div>
  );
}

export default FinanceDashboard;