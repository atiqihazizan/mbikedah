import { useEffect, useState } from 'react';
import { FileText, Clock, Edit, Plus, RotateCcw, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import BillingFormDialog from '../../components/dialogs/BillingFormDialog';

function BillingTableActive() {
  const navigate = useNavigate();
  const { dashboardData, currentActiveRole, tabNotifications } = useOutletContext();
  
  const [applicantData, setApplicantData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Dialog states
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState(null);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  
  // Update applicantData when dashboardData changes
  useEffect(() => {
    if (dashboardData?.applicant) setApplicantData(dashboardData.applicant);
  }, [dashboardData]);
  
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

  const handleDialogSaved = (savedData) => {
    // Refresh the dashboard data or update local state
    // You might want to call a refresh function from the parent component
    // or update the local applications state
    console.log('Billing saved:', savedData);
    
    // For now, we'll just refresh the page or trigger a data reload
    // In a real application, you'd want to update the local state more efficiently
    window.location.reload(); // Simple approach, but you might want to implement proper state management
  };

  const TabCard = ({ icon: Icon, title, value, color, description, tabKey, isActive, onClick }) => (
    <div 
      className={`cursor-pointer transition-all duration-200 bg-white rounded-lg shadow-sm border-2 p-6 ${
        isActive 
          ? 'border-blue-500 shadow-md transform scale-105' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} ${isActive ? 'ring-2 ring-blue-200' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className={`text-lg font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
            {value}
          </p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

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

  const getUrgencyFromAmount = (amount) => {
    const numAmount = parseFloat(amount.replace(/[^\d.]/g, ''));
    if (numAmount > 2000) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Jumlah Besar
        </span>
      );
    }
    return null;
  };

  const formatCurrency = (amount) => {
    return `RM ${parseFloat(amount).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('ms-MY', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleTabChange = (tabKey) => setActiveTab(tabKey);

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
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Permohonan Baru
              </button>
            )}
            <button
              onClick={() => setLoading(!loading)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-white"
              title="Refresh Data"
            >
              <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics/Filter Tabs Grid */}
      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
        <TabCard
          icon={Edit}
          title="Draf"
          value={statusCounts.draft}
          color="bg-gray-500"
          description="Belum dihantar"
          tabKey="draft"
          isActive={activeTab === 'draft'}
          onClick={() => handleTabChange('draft')}
        />
        <TabCard
          icon={Clock}
          title="Menunggu"
          value={statusCounts.pending}
          color="bg-yellow-500"
          description="Perlu kelulusan"
          tabKey="pending"
          isActive={activeTab === 'pending'}
          onClick={() => handleTabChange('pending')}
        />
        <TabCard
          icon={CheckCircle}
          title="Selesai"
          value={statusCounts.completed}
          color="bg-green-500"
          description="Permohonan selesai"
          tabKey="completed"
          isActive={activeTab === 'completed'}
          onClick={() => handleTabChange('completed')}
        />
        <TabCard
          icon={XCircle}
          title="Ditolak"
          value={statusCounts.rejected}
          color="bg-red-500"
          description="Perlu tindakan"
          tabKey="rejected"
          isActive={activeTab === 'rejected'}
          onClick={() => handleTabChange('rejected')}
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

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === 'all' 
              ? `Senarai Semua Permohonan (${filteredApplications.length})`
              : `Senarai Permohonan ${statusMapping[activeTab].label} (${filteredApplications.length})`
            }
          </h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat data...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tiada permohonan pada masa ini</p>
            {quickActions.can_create_new && activeTab === 'all' && (
              <button
                onClick={handleCreateNew}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buat Permohonan Baru
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Rujukan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penerima
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarikh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {app.running_no}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.recipient}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status, app.status_class)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {formatCurrency(app.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBilling(app.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.can_edit && (
                          <button
                            onClick={() => handleEditBilling(app.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Billing Form Dialog */}
      <BillingFormDialog
        show={showBillingDialog}
        onClose={handleDialogClose}
        onSaved={handleDialogSaved}
        billingId={selectedBillingId}
        mode={dialogMode}
      />
    </div>
  );
}

export default BillingTableActive;