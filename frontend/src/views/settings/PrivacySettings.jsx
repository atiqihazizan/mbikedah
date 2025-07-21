

/**
 * Privacy Settings Component
 */
const PrivacySettings = ({ isDark }) => (
  <div>
    <div className="mb-6">
      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Privasi
      </h2>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Kawal maklumat peribadi dan privasi anda
      </p>
    </div>
    
    <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      <FaLock className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Tetapan privasi akan datang tidak lama lagi</p>
    </div>
  </div>
);

export default PrivacySettings