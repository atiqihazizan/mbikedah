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
  FaFileAlt
} from "react-icons/fa";

const BillingHistory = ({ history = [], currentUser, billing = {}, compact = false }) => {
  
  // Filter history berdasarkan user role dan permissions
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    // const userRole = currentUser?.abilities?.[0] || '';
    const userRole = currentUser?.ability?.[0] || '';
    const userDepartment = currentUser?.department_id;
    
    return history.filter(entry => {
      // Pemohon - full history untuk billing mereka sendiri
      if (userRole === 'applicant') return billing.creator.id === currentUser.id;
      
      // Ketua Jabatan - history untuk department mereka sahaja + relevant transitions
      if (userRole === 'hod') {
        const isOwnDepartment = billing.department_id === userDepartment;
        const isHodRelevant = [
          'Hantar ke Ketua Jabatan',
          'Ketua Jabatan Lulus', 
          'Ditolak oleh Ketua Jabatan',
          'Dikembalikan untuk Pembetulan'
        ].some(status => entry.status?.includes(status) || entry.status?.includes('Ketua Jabatan'));
        
        return isOwnDepartment && (isHodRelevant || entry.stage_sekarang === 'Mula Mohon');
      }
      
      // Kewangan - semua history + focus pada finance-related transitions
      if (userRole === 'finance') return true;
      
      // Admin - full access
      if (userRole === 'admin') return true;
      
      // Default - basic history sahaja
      return ['Mula Mohon', 'Hantar ke Ketua Jabatan'].some(status => entry.status?.includes(status));
    }).sort((a, b) => new Date(b.created_at_full || b.tarikh) - new Date(a.created_at_full || a.tarikh));
  }, [history, currentUser, billing]);

  // Get appropriate icon for history entry
  const getHistoryIcon = (entry) => {
    const { transition_type, status } = entry;
    
    switch (transition_type) {
      case 'approval':
        return <FaCheck className="w-4 h-4 text-green-600" />;
      case 'rejection':
        return <FaTimes className="w-4 h-4 text-red-600" />;
      case 'return':
        return <FaUndo className="w-4 h-4 text-yellow-600" />;
      case 'cancellation':
        return <FaExclamationTriangle className="w-4 h-4 text-gray-600" />;
      default:
        if (status?.includes('Pembayaran') || status?.includes('Dibayar')) {
          return <FaMoneyBillWave className="w-4 h-4 text-green-600" />;
        }
        if (status?.includes('Kewangan')) {
          return <FaBuilding className="w-4 h-4 text-blue-600" />;
        }
        return <FaFileAlt className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get status badge styling
  const getStatusBadge = (entry) => {
    const { status_color, transition_type } = entry;
    
    const baseClasses = "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    
    const colorMap = {
      'green': 'bg-green-100 text-green-800',
      'red': 'bg-red-100 text-red-800', 
      'yellow': 'bg-yellow-100 text-yellow-800',
      'blue': 'bg-blue-100 text-blue-800',
      'orange': 'bg-orange-100 text-orange-800',
      'purple': 'bg-purple-100 text-purple-800',
      'indigo': 'bg-indigo-100 text-indigo-800',
      'teal': 'bg-teal-100 text-teal-800',
      'gray': 'bg-gray-100 text-gray-800'
    };
    
    return `${baseClasses} ${colorMap[status_color] || colorMap.gray}`;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ms-MY', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  // Enhanced compact view for smaller spaces
  if (compact) {
    return (
      <div className="space-y-2">
        <h5 className="text-sm font-semibold text-gray-900 mb-2">Sejarah Terkini</h5>
        {filteredHistory.slice(0, 3).map((entry, i) => (
          <div key={i} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            {getHistoryIcon(entry)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {entry.status}
              </p>
              <p className="text-xs text-gray-500">{entry.tarikh}</p>
            </div>
            <span className={getStatusBadge(entry)}>
              {entry.stage_sekarang}
            </span>
          </div>
        ))}
        {filteredHistory.length > 3 && (
          <p className="text-xs text-gray-500 text-center">
            +{filteredHistory.length - 3} lagi...
          </p>
        )}
      </div>
    );
  }

  // Full detailed view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Sejarah Permohonan</h4>
        <span className="text-sm text-gray-500">
          {filteredHistory.length} entri
        </span>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-8">
          <FaClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tiada sejarah untuk dipaparkan</p>
        </div>
      ) : (
        // <div className="space-y-4">
        <div className="">
          {filteredHistory.map((entry, i) => (
            <div key={i} className="relative">
              {/* Timeline line */}
              {i < filteredHistory.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                  {getHistoryIcon(entry)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status and Stage */}
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={getStatusBadge(entry)}>
                          {entry.stage_sekarang}
                        </span>
                        {entry.is_final && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Final
                          </span>
                        )}
                      </div>
                      
                      {/* Action Description */}
                      <h5 className="text-sm font-medium text-gray-900 mb-1">
                        {entry.status}
                      </h5>
                      
                      {/* Remarks */}
                      {entry.catatan && entry.catatan !== '-' && (
                        <p className="text-sm text-gray-600 mb-2 italic">
                          "{entry.catatan}"
                        </p>
                      )}
                      
                      {/* User and Position */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FaUser className="w-3 h-3" />
                          <span>{entry.oleh}</span>
                        </div>
                        {entry.jawatan && (
                          <span className="text-gray-400">•</span>
                        )}
                        {entry.jawatan && (
                          <span>{entry.jawatan}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Date */}
                    <div className="text-right text-xs text-gray-500 ml-4">
                      <div>{entry.tarikh}</div>
                      {entry.created_at_full && (
                        <div className="text-gray-400">
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

      {/* Summary untuk Kewangan */}
      {currentUser?.abilities?.[0] === 'finance' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-semibold text-blue-900 mb-2">Ringkasan Kewangan</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-blue-700">Jumlah Permohonan:</span>
              <div className="font-semibold text-blue-900">RM {billing.total_amount || '0.00'}</div>
            </div>
            <div>
              <span className="text-blue-700">Kaedah Bayaran:</span>
              <div className="font-semibold text-blue-900 capitalize">
                {billing.payment_method || 'Tidak dinyatakan'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Required untuk HOD */}
      {currentUser?.abilities?.[0] === 'hod' && billing.status_id === 2 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="w-4 h-4 text-yellow-600" />
            <h5 className="text-sm font-semibold text-yellow-900">Tindakan Diperlukan</h5>
          </div>
          <p className="text-sm text-yellow-800 mt-1">
            Permohonan ini menunggu kelulusan anda sebagai Ketua Jabatan.
          </p>
        </div>
      )}

      {/* Processing untuk Finance */}
      {currentUser?.abilities?.[0] === 'finance' && [3, 4, 5].includes(billing.status_id) && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaBuilding className="w-4 h-4 text-orange-600" />
            <h5 className="text-sm font-semibold text-orange-900">Dalam Proses Kewangan</h5>
          </div>
          <p className="text-sm text-orange-800 mt-1">
            Permohonan ini sedang dalam proses di Bahagian Kewangan.
          </p>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;