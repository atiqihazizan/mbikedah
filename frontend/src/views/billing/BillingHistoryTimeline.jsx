import { useMemo } from "react";
import { 
  FaCheck, 
  FaTimes, 
  FaUndo, 
  FaUser, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaPlay,
  FaStop,
  FaArrowRight
} from "react-icons/fa";

const BillingHistoryTimeline = ({ 
  billingId,
  history = [], 
  currentUser, 
  billing = {},
  variant = "full", // "full", "compact", "minimal", "dashboard"
  maxEntries = null,
  showFilters = true,
  className = ""
}) => {
  
  // Filter dan sort history berdasarkan user permissions
  const processedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const userRole = currentUser?.abilities?.[0] || '';
    const userDepartment = currentUser?.department_id;
    
    let filteredHistory = history.filter(entry => {
      // Pemohon - full history untuk billing mereka sendiri
      if (userRole === 'applicant') {
        return billing.created_by === currentUser.id;
      }
      
      // Ketua Jabatan - history untuk department mereka + HOD related
      if (userRole === 'hod') {
        const isOwnDepartment = billing.department_id === userDepartment;
        const isHodRelevant = [
          'Hantar ke Ketua Jabatan',
          'Ketua Jabatan Lulus', 
          'Ditolak oleh Ketua Jabatan',
          'Dikembalikan untuk Pembetulan'
        ].some(status => 
          entry.status?.includes(status) || 
          entry.status?.includes('Ketua Jabatan') ||
          entry.stage_sekarang?.includes('HOD')
        );
        
        return isOwnDepartment && (isHodRelevant || entry.stage_sekarang === 'Mula Mohon');
      }
      
      // Kewangan - semua history dengan focus pada finance processes
      if (userRole === 'finance') {
        return true; // Finance dapat lihat semua
      }
      
      // Admin - full access
      if (userRole === 'admin') {
        return true;
      }
      
      // Default - basic visibility
      return ['Mula Mohon', 'Hantar ke Ketua Jabatan', 'Selesai', 'Ditolak', 'Dibatalkan']
        .some(status => entry.status?.includes(status));
    });

    // Sort by date descending (newest first)
    filteredHistory = filteredHistory.sort((a, b) => 
      new Date(b.created_at_full || b.tarikh) - new Date(a.created_at_full || a.tarikh)
    );

    // Limit entries if specified
    if (maxEntries && maxEntries > 0) {
      filteredHistory = filteredHistory.slice(0, maxEntries);
    }

    return filteredHistory;
  }, [history, currentUser, billing, maxEntries]);

  // Get appropriate icon untuk setiap history entry
  const getHistoryIcon = (entry, index) => {
    const { transition_type, status, stage_sekarang } = entry;
    const isLatest = index === 0;
    
    const iconProps = {
      className: `w-4 h-4 ${isLatest ? 'animate-pulse' : ''}`,
    };
    
    switch (transition_type) {
      case 'approval':
        return <FaCheck {...iconProps} style={{color: '#10B981'}} />;
      case 'rejection':
        return <FaTimes {...iconProps} style={{color: '#EF4444'}} />;
      case 'return':
        return <FaUndo {...iconProps} style={{color: '#F59E0B'}} />;
      case 'cancellation':
        return <FaStop {...iconProps} style={{color: '#6B7280'}} />;
      default:
        if (status?.includes('Pembayaran') || status?.includes('Dibayar')) {
          return <FaMoneyBillWave {...iconProps} style={{color: '#10B981'}} />;
        }
        if (status?.includes('Kewangan')) {
          return <FaBuilding {...iconProps} style={{color: '#3B82F6'}} />;
        }
        if (status?.includes('Mula')) {
          return <FaPlay {...iconProps} style={{color: '#8B5CF6'}} />;
        }
        return <FaFileAlt {...iconProps} style={{color: '#6B7280'}} />;
    }
  };

  // Get status badge dengan enhanced styling
  const getStatusBadge = (entry, index) => {
    const { status_color, transition_type, is_final } = entry;
    const isLatest = index === 0;
    
    const baseClasses = `inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
      isLatest ? 'ring-2 ring-offset-1' : ''
    }`;
    
    const colorMap = {
      'green': `bg-green-100 text-green-800 ${isLatest ? 'ring-green-500' : ''}`,
      'red': `bg-red-100 text-red-800 ${isLatest ? 'ring-red-500' : ''}`,
      'yellow': `bg-yellow-100 text-yellow-800 ${isLatest ? 'ring-yellow-500' : ''}`,
      'blue': `bg-blue-100 text-blue-800 ${isLatest ? 'ring-blue-500' : ''}`,
      'orange': `bg-orange-100 text-orange-800 ${isLatest ? 'ring-orange-500' : ''}`,
      'purple': `bg-purple-100 text-purple-800 ${isLatest ? 'ring-purple-500' : ''}`,
      'indigo': `bg-indigo-100 text-indigo-800 ${isLatest ? 'ring-indigo-500' : ''}`,
      'teal': `bg-teal-100 text-teal-800 ${isLatest ? 'ring-teal-500' : ''}`,
      'gray': `bg-gray-100 text-gray-800 ${isLatest ? 'ring-gray-500' : ''}`
    };
    
    return `${baseClasses} ${colorMap[status_color] || colorMap.gray}`;
  };

  // Format tarikh untuk display
  const formatDate = (dateStr, format = "full") => {
    try {
      const date = new Date(dateStr);
      switch (format) {
        case "time":
          return date.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
        case "date":
          return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
        case "short":
          return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        default:
          return date.toLocaleDateString('ms-MY', { 
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          });
      }
    } catch {
      return dateStr;
    }
  };

  // Render variants
  const renderMinimal = () => (
    <div className="flex items-center space-x-2">
      {processedHistory.slice(0, 1).map((entry, i) => (
        <div key={i} className="flex items-center space-x-2">
          {getHistoryIcon(entry, i)}
          <span className={getStatusBadge(entry, i)}>
            {entry.stage_sekarang}
          </span>
        </div>
      ))}
    </div>
  );

  const renderCompact = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-gray-900">Sejarah Terkini</h5>
        <span className="text-xs text-gray-500">{processedHistory.length} entri</span>
      </div>
      {processedHistory.slice(0, 3).map((entry, i) => (
        <div key={i} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {getHistoryIcon(entry, i)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {entry.status}
            </p>
            <p className="text-xs text-gray-500">{entry.tarikh}</p>
          </div>
          <span className={getStatusBadge(entry, i)}>
            {entry.stage_sekarang}
          </span>
        </div>
      ))}
      {processedHistory.length > 3 && (
        <p className="text-xs text-gray-500 text-center pt-1">
          +{processedHistory.length - 3} lagi...
        </p>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaClock className="w-4 h-4 text-gray-400" />
          <h5 className="text-sm font-semibold text-gray-900">Activity Timeline</h5>
        </div>
        <span className="text-xs text-gray-500">#{billing.running_no}</span>
      </div>
      
      <div className="space-y-3">
        {processedHistory.slice(0, 5).map((entry, i) => (
          <div key={i} className="relative flex items-start space-x-3">
            {/* Timeline line */}
            {i < processedHistory.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-px bg-gray-200"></div>
            )}
            
            {/* Icon */}
            <div className="flex-shrink-0 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
              {getHistoryIcon(entry, i)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={getStatusBadge(entry, i)}>
                  {entry.stage_sekarang}
                </span>
                {entry.is_final && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    Final
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-900 font-medium">{entry.status}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">{entry.oleh}</span>
                <span className="text-xs text-gray-400">{entry.tarikh}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFull = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Sejarah Permohonan</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{processedHistory.length} entri</span>
          {showFilters && currentUser?.abilities?.[0] === 'finance' && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Full Access
            </span>
          )}
        </div>
      </div>

      {processedHistory.length === 0 ? (
        <div className="text-center py-8">
          <FaClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tiada sejarah untuk dipaparkan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {processedHistory.map((entry, i) => (
            <div key={i} className="relative">
              {/* Timeline line */}
              {i < processedHistory.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex space-x-4">
                {/* Enhanced Icon with status ring */}
                <div className={`flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 ${
                  i === 0 ? 'border-blue-200 shadow-lg' : 'border-gray-200'
                }`}>
                  {getHistoryIcon(entry, i)}
                </div>
                
                {/* Enhanced Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status badges dengan enhanced layout */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={getStatusBadge(entry, i)}>
                          {entry.stage_sekarang}
                        </span>
                        {entry.is_final && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Final
                          </span>
                        )}
                        {i === 0 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Terkini
                          </span>
                        )}
                      </div>
                      
                      {/* Action description dengan enhanced typography */}
                      <h5 className="text-base font-semibold text-gray-900 mb-2">
                        {entry.status}
                      </h5>
                      
                      {/* Remarks dengan better styling */}
                      {entry.catatan && entry.catatan !== '-' && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 italic">
                            "{entry.catatan}"
                          </p>
                        </div>
                      )}
                      
                      {/* User info dengan enhanced layout */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FaUser className="w-3 h-3" />
                          <span className="font-medium">{entry.oleh}</span>
                        </div>
                        {entry.jawatan && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">{entry.jawatan}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced Date dengan multiple formats */}
                    <div className="text-right text-sm text-gray-500 ml-4">
                      <div className="font-medium">{entry.tarikh}</div>
                      {entry.created_at_full && (
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(entry.created_at_full)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced contextual information */}
      <div className="mt-6 space-y-4">
        {/* Finance summary */}
        {currentUser?.abilities?.[0] === 'finance' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <FaBuilding className="w-4 h-4 text-blue-600" />
              <h5 className="text-sm font-semibold text-blue-900">Ringkasan Kewangan</h5>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Jumlah:</span>
                <div className="font-semibold text-blue-900">RM {billing.total_amount || '0.00'}</div>
              </div>
              <div>
                <span className="text-blue-700">Kaedah:</span>
                <div className="font-semibold text-blue-900 capitalize">
                  {billing.payment_method || 'Tidak dinyatakan'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOD action required */}
        {currentUser?.abilities?.[0] === 'hod' && billing.status_id === 2 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FaExclamationTriangle className="w-4 h-4 text-yellow-600" />
              <h5 className="text-sm font-semibold text-yellow-900">Tindakan Diperlukan</h5>
            </div>
            <p className="text-sm text-yellow-800">
              Permohonan ini menunggu kelulusan anda sebagai Ketua Jabatan.
            </p>
          </div>
        )}

        {/* Processing status untuk Finance */}
        {currentUser?.abilities?.[0] === 'finance' && [3, 4, 5, 6].includes(billing.status_id) && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FaArrowRight className="w-4 h-4 text-orange-600" />
              <h5 className="text-sm font-semibold text-orange-900">Dalam Proses</h5>
            </div>
            <p className="text-sm text-orange-800">
              Permohonan ini sedang dalam proses di Bahagian Kewangan.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Main render based on variant
  return (
    <div className={`billing-history-timeline ${className}`}>
      {variant === "minimal" && renderMinimal()}
      {variant === "compact" && renderCompact()}
      {variant === "dashboard" && renderDashboard()}
      {variant === "full" && renderFull()}
    </div>
  );
};

export default BillingHistoryTimeline;