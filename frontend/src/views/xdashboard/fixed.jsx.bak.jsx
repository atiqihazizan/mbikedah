// components/dashboard-new/updated/ApplicantDashboardFixed.jsx
import { Link } from "react-router-dom";
import { 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaPlus,
  FaEdit,
  FaEye
} from "react-icons/fa";
import { formatUtils, dashboardHelpers } from "../../../utils/formatUtils";

function ApplicantDashboardFixed({ data, onRefresh }) {
  // Safe data extraction dengan proper defaults
  const summary = dashboardHelpers.extractSafeData(data, 'summary', {});
  const myBillings = dashboardHelpers.extractSafeData(data, 'my_billings', []);
  const statusCounts = dashboardHelpers.extractSafeData(data, 'status_counts', {});
  const quickActions = dashboardHelpers.extractSafeData(data, 'quick_actions', {});

  // Stats cards data dengan safe formatting
  const statsCards = [
    {
      title: "Jumlah Permohonan",
      value: dashboardHelpers.getDisplayValue(summary.total_applications, '0'),
      icon: FaFileAlt,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Menunggu Kelulusan",
      value: dashboardHelpers.getDisplayValue(summary.pending_approvals, '0'),
      icon: FaClock,
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    },
    {
      title: "Draf",
      value: dashboardHelpers.getDisplayValue(summary.drafts, '0'),
      icon: FaEdit,
      color: "gray",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      borderColor: "border-gray-200"
    },
    {
      title: "Kadar Kejayaan",
      value: formatUtils.formatPercentage(summary.completion_rate),
      icon: FaCheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    }
  ];

  const getStatusBadge = (statusId) => {
    const config = formatUtils.getStatusConfig(statusId);
    return config;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tindakan Pantas</h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.can_create_new && (
            <Link
              to="/billing/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Permohonan Baru
            </Link>
          )}
          {formatUtils.safeNumber(quickActions.drafts_to_complete) > 0 && (
            <Link
              to="/billing?status=draft"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200"
            >
              <FaEdit className="w-4 h-4 mr-2" />
              Lengkapkan {quickActions.drafts_to_complete} Draf
            </Link>
          )}
          {formatUtils.safeNumber(quickActions.returned_to_fix) > 0 && (
            <Link
              to="/billing?status=returned"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              <FaTimesCircle className="w-4 h-4 mr-2" />
              Baiki {quickActions.returned_to_fix} Permohonan
            </Link>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">
              {dashboardHelpers.getDisplayValue(statusCounts.draft, '0')}
            </div>
            <div className="text-sm text-gray-600">Draf</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">
              {dashboardHelpers.getDisplayValue(statusCounts.pending, '0')}
            </div>
            <div className="text-sm text-yellow-600">Menunggu</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {dashboardHelpers.getDisplayValue(statusCounts.completed, '0')}
            </div>
            <div className="text-sm text-green-600">Selesai</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">
              {dashboardHelpers.getDisplayValue(statusCounts.rejected, '0')}
            </div>
            <div className="text-sm text-red-600">Ditolak</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">
              {dashboardHelpers.getDisplayValue(statusCounts.returned, '0')}
            </div>
            <div className="text-sm text-orange-600">Dikembalikan</div>
          </div>
        </div>
      </div>

      {/* Total Approved Amount */}
      {formatUtils.safeNumber(summary.total_approved_amount) > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Jumlah Keseluruhan Diluluskan</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatUtils.formatCurrency(summary.total_approved_amount)}
            </p>
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Permohonan Terkini</h3>
            <Link
              to="/billing"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="p-6">
          {myBillings.length > 0 ? (
            <div className="space-y-4">
              {myBillings.map((billing) => {
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
                        to={`/billing/${billing.id}`}
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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tiada permohonan terkini</p>
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

// components/dashboard-new/updated/HodDashboardFixed.jsx
import { Link } from "react-router-dom";
import { 
  FaCheckCircle, 
  FaClock, 
  FaBuilding,
  // FaTrendingUp,
  FaEye,
  FaThumbsUp,
  FaCalendarAlt,
  FaExclamationTriangle
} from "react-icons/fa";
import { formatUtils, dashboardHelpers } from "../../../utils/formatUtils";

function HodDashboardFixed({ data, onRefresh }) {
  const summary = dashboardHelpers.extractSafeData(data, 'summary', {});
  const needingApproval = dashboardHelpers.extractSafeData(data, 'needing_approval', []);
  const statusCounts = dashboardHelpers.extractSafeData(data, 'status_counts', {});
  const performance = dashboardHelpers.extractSafeData(data, 'performance', {});

  // Stats cards for HOD dengan safe formatting
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
      title: "Permohonan Jabatan",
      value: dashboardHelpers.getDisplayValue(summary.department_billings, '0'),
      icon: FaBuilding,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Kadar Selesai",
      value: formatUtils.formatPercentage(summary.completion_rate),
      icon: FaTrendingUp,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Jumlah Diluluskan",
      value: formatUtils.formatCurrency(summary.total_approved_amount),
      icon: FaCheckCircle,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    }
  ];

  const getPriorityConfig = (days) => {
    return formatUtils.getPriorityConfig(days);
  };

  const handleApprove = async (billingId) => {
    try {
      console.log('Approving billing:', billingId);
      // Implementation untuk approve
    } catch (error) {
      console.error('Error approving billing:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${stat.urgent ? 'ring-2 ring-red-200' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.urgent && formatUtils.safeNumber(summary.pending_approvals) > 0 && (
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

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestasi Jabatan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FaCalendarAlt className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Permohonan Bulan Ini</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {dashboardHelpers.getDisplayValue(performance.this_month, '0')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <FaTrendingUp className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Masa Purata Kelulusan</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {dashboardHelpers.getDisplayValue(performance.average_approval_time_display, 'Tiada data')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Draf</span>
              <span className="font-semibold text-gray-800">
                {dashboardHelpers.getDisplayValue(statusCounts.draft, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Menunggu HOD</span>
              <span className="font-semibold text-red-600">
                {dashboardHelpers.getDisplayValue(statusCounts.pending_hod, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dalam Kewangan</span>
              <span className="font-semibold text-blue-600">
                {dashboardHelpers.getDisplayValue(statusCounts.in_finance, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Selesai</span>
              <span className="font-semibold text-green-600">
                {dashboardHelpers.getDisplayValue(statusCounts.completed, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ditolak</span>
              <span className="font-semibold text-red-600">
                {dashboardHelpers.getDisplayValue(statusCounts.rejected, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dikembalikan</span>
              <span className="font-semibold text-orange-600">
                {dashboardHelpers.getDisplayValue(statusCounts.returned, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Approvals */}
      {formatUtils.safeNumber(summary.pending_approvals) > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">
              Permohonan Menunggu Kelulusan Anda
            </h3>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Terdapat {summary.pending_approvals} permohonan yang memerlukan kelulusan segera dari anda.
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
            <h3 className="text-lg font-semibold text-gray-900">Permohonan Perlu Kelulusan</h3>
            <Link
              to="/billing/pending-hod"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="p-6">
          {needingApproval.length > 0 ? (
            <div className="space-y-4">
              {needingApproval.map((billing) => {
                const priorityConfig = getPriorityConfig(billing.days_pending);
                return (
                  <div key={billing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-gray-900">{billing.running_no}</div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig.className}`}>
                          {formatUtils.formatDaysPending(billing.days_pending)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">{dashboardHelpers.getDisplayValue(billing.creator, 'Unknown')}</span> • {dashboardHelpers.getDisplayValue(billing.recipient, 'Unknown')}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {formatUtils.formatCurrency(billing.total_amount)} • {formatUtils.formatDate(billing.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/billing/${billing.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                      >
                        <FaEye className="w-4 h-4 mr-2" />
                        Lihat
                      </Link>
                      <button
                        onClick={() => handleApprove(billing.id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        <FaThumbsUp className="w-4 h-4 mr-2" />
                        Luluskan
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

export { ApplicantDashboardFixed, HodDashboardFixed };