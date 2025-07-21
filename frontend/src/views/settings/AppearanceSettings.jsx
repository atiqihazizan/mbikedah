import { FaMoon, FaSun } from "react-icons/fa";

const AppearanceSettings = ({ theme, isDark, onToggleTheme }) => (
  <div>
    <div className="mb-6">
      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Penampilan
      </h2>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Sesuaikan tema dan penampilan aplikasi
      </p>
    </div>

    <div className="space-y-4">
      <div className={`p-4 border rounded-lg ${
        isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isDark ? (
              <FaMoon className="w-5 h-5 mr-3 text-blue-400" />
            ) : (
              <FaSun className="w-5 h-5 mr-3 text-yellow-500" />
            )}
            <div>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Tema {isDark ? 'Gelap' : 'Cerah'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isDark ? 'Menggunakan tema gelap' : 'Menggunakan tema cerah'}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDark ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AppearanceSettings