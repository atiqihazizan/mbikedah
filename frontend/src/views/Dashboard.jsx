import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../axios';
import ApplicantDashboard from './dashboard/ApplicantDashboard';
import HodDashboard from './dashboard/HodDashboard';
import FinanceDashboard from './dashboard/FinanceDashboard';
import { 
  FaSync, 
  FaCog, 
  FaExpand, 
  FaCompress
} from 'react-icons/fa';

// Utility Functions (imported from DefaultLayout context)
const getRoleMetadata2 = (role) => {
  const metadata = {
    'Pemohon': {
      icon: '📝',
      color: 'blue',
      description: 'Dashboard untuk pemohon',
      shortName: 'Pemohon',
      route: '/',
      matchPaths: ['/', '/billing/dashboard', '/billing/archive', '/billing/create', '/billing/edit']
    },
    'Ketua Jabatan': {
      icon: '👔',
      color: 'purple',
      description: 'Dashboard ketua jabatan',
      shortName: 'HOD',
      route: '/billing/hod',
      matchPaths: ['/billing/hod']
    },
    'Kewangan': {
      icon: '💰',
      color: 'green',
      description: 'Dashboard kewangan',
      shortName: 'Finance',
      route: '/billing/finance',
      matchPaths: ['/billing/finance']
    }
  };
  
  return metadata[role] || {
    icon: '👤',
    color: 'gray',
    description: 'Dashboard pengguna',
    shortName: role,
    route: '/',
    matchPaths: ['/']
  };
};

// Utility Functions
const formatRelativeTime = (date) => {
  if (!date) return 'Tiada data';
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'Baru sahaja';
  if (diff < 3600) return `${Math.floor(diff / 60)} minit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
};

const getRoleMetadata = (role) => {
  const metadata = {
    'Pemohon': {
      icon: '📝',
      color: 'blue',
      description: 'Dashboard untuk pemohon',
      shortName: 'Pemohon'
    },
    'Ketua Jabatan': {
      icon: '👔',
      color: 'purple',
      description: 'Dashboard ketua jabatan',
      shortName: 'HOD'
    },
    'Kewangan': {
      icon: '💰',
      color: 'green',
      description: 'Dashboard kewangan',
      shortName: 'Finance'
    }
  };
  
  return metadata[role] || {
    icon: '👤',
    color: 'gray',
    description: 'Dashboard pengguna',
    shortName: role
  };
};

// Custom Hooks
const useDashboardRefresh = (fetchFunction) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  
  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchFunction(true);
      setLastRefreshTime(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return { refresh, isRefreshing, lastRefreshTime };
};

// Loading Component
const DashboardLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="absolute top-2 left-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
        </div>
      </div>
      <p className="text-gray-600">Memuat dashboard...</p>
    </div>
  </div>
);

// Error Component
const DashboardError = ({ error, onRetry }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-900 mb-2">Ralat Memuat Dashboard</h3>
      <p className="text-red-700 mb-4 text-sm">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        <FaSync className="w-4 h-4 mr-2" />
        Cuba Lagi
      </button>
    </div>
  </div>
);

// Dashboard Header Component
const DashboardHeader = ({ 
  role, 
  metadata, 
  onRefresh, 
  isRefreshing, 
  lastRefreshTime,
  onToggleFullscreen,
  isFullscreen,
  compactMode = false
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-full ${isFullscreen ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
          <span className="text-2xl">{metadata.icon}</span>
        </div>
        <div>
          <h1 className={`${compactMode ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
            Dashboard {role}
          </h1>
          <p className="text-gray-600 text-sm">
            {metadata.description}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Terakhir dikemaskini: {formatRelativeTime(lastRefreshTime)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 rounded-lg hover:bg-gray-100"
          title="Refresh Dashboard"
        >
          <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        
        <button
          onClick={onToggleFullscreen}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
          title={isFullscreen ? "Keluar Skrin Penuh" : "Skrin Penuh"}
        >
          {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
        </button>
        
        <button
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
          title="Tetapan Dashboard"
        >
          <FaCog className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
function Dashboard() {
  const location = useLocation();
  // Get context from DefaultLayout
  const { 
    dashboardData: contextDashboardData, 
    userRoles, 
    currentActiveRole,
    tabNotifications,
    refreshUserData
  } = useOutletContext();

  const [dashboardData, setDashboardData] = useState(contextDashboardData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Custom hooks
  const fetchDashboardData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        // Show refresh indicator
      } else {
        setLoading(true);
      }
      
      const response = await apiClient.get('/dashboard');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }

      setDashboardData(response.data || {});
      setError(null);
      
      // Also refresh user data in parent
      if (refreshUserData) {
        refreshUserData();
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.message || 'Error loading dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const { refresh, isRefreshing, lastRefreshTime } = useDashboardRefresh(fetchDashboardData);

  // Update local state when context changes
  useEffect(() => {
    setDashboardData(contextDashboardData || {});
  }, [contextDashboardData]);

  // Initial load if no context data
  useEffect(() => {
    if (!contextDashboardData || Object.keys(contextDashboardData).length === 0) {
      fetchDashboardData();
    }
  }, []);

  const rolesToDisplay = Array.isArray(userRoles) ? userRoles : [];

  // Function to get dashboard component based on role
  const getDashboardComponent = (role) => {
    const commonProps = { onRefresh: refresh };
    
    switch (role) {
      case 'Pemohon':
        return dashboardData.applicant ? (
          <ApplicantDashboard data={dashboardData.applicant} {...commonProps} />
        ) : <div className="text-center py-8 text-gray-500">Data dashboard pemohon tidak tersedia</div>;
        
      case 'Ketua Jabatan':
        return dashboardData.hod ? (
          <HodDashboard data={dashboardData.hod} {...commonProps} />
        ) : <div className="text-center py-8 text-gray-500">Data dashboard HOD tidak tersedia</div>;
        
      case 'Kewangan':
        return dashboardData.finance ? (
          <FinanceDashboard data={dashboardData.finance} {...commonProps} />
        ) : <div className="text-center py-8 text-gray-500">Data dashboard kewangan tidak tersedia</div>;
        
      default:
        return <div className="text-center py-8 text-gray-500">Dashboard tidak tersedia</div>;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Determine if we should show dashboard content
  const shouldShowDashboard = location.pathname === '/';
  const activeRole = currentActiveRole || (rolesToDisplay.length > 0 ? rolesToDisplay[0] : null);

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError error={error} onRetry={() => fetchDashboardData()} />;

  // Only render dashboard content for root path
  if (!shouldShowDashboard) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'bg-gray-50'} p-4`}
    >
      {/* Dashboard Content */}
      <div className='flex-1 overflow-hidden'>
        <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
          {activeRole ? (
            <div className="h-full p-6 overflow-y-auto">
              <DashboardHeader
                role={activeRole}
                metadata={getRoleMetadata(activeRole)}
                onRefresh={refresh}
                isRefreshing={isRefreshing}
                lastRefreshTime={lastRefreshTime}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                compactMode={false}
              />
              
              <div className="dashboard-content">
                {getDashboardComponent(activeRole)}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tiada Dashboard Tersedia</h3>
                <p className="text-gray-600">Tiada role yang ditetapkan untuk pengguna ini.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced footer info */}
      {!isFullscreen && activeRole && (
        <div className="bg-white px-4 py-2 border-t border-gray-200 rounded-b-lg shadow-sm mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>
                Dashboard aktif: <span className="font-medium text-gray-700">{activeRole}</span>
              </span>
              <span>•</span>
              <span>{rolesToDisplay.length} role tersedia</span>
              {Object.values(tabNotifications || {}).reduce((a, b) => a + b, 0) > 0 && (
                <>
                  <span>•</span>
                  <span className="text-red-600 font-medium">
                    {Object.values(tabNotifications || {}).reduce((a, b) => a + b, 0)} notifikasi
                  </span>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <span>Terakhir dikemaskini: {formatRelativeTime(lastRefreshTime)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;