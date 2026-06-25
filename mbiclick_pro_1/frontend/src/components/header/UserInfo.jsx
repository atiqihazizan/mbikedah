import { FaUserTie } from "react-icons/fa";

// Rest of components sama...
const UserInfo = ({ userDisplayInfo, currentActiveRole, isLoading, error, onRefresh, isDark }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center">
      <FaUserTie className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
      <div>
        <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {userDisplayInfo.name}
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {userDisplayInfo.department}
        </p>
      </div>
    </div>
    
    {/* Status Indicators */}
    <div className="flex items-center space-x-2">
      {isLoading && (
        <div className={`flex items-center text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          <div className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-2 ${
            isDark ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          Memuat...
        </div>
      )}
      
      {error && (
        <button
          onClick={onRefresh}
          className={`text-sm transition-colors ${
            isDark 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-red-600 hover:text-red-800'
          }`}
          title="Klik untuk cuba semula"
        >
          Ralat - Cuba semula
        </button>
      )}
    </div>
  </div>
);

export default UserInfo;
