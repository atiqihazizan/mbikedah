

/**
 * Notification Settings Component
 */
const NotificationSettings = ({ isDark }) => (
  <div>
    <div className="mb-6">
      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Notifikasi
      </h2>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Urus keutamaan notifikasi anda
      </p>
    </div>
    
    <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      <FaBell className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Tetapan notifikasi akan datang tidak lama lagi</p>
    </div>
  </div>
);

export default NotificationSettings