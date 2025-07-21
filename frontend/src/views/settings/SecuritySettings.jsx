import { FaKey } from "react-icons/fa";

/**
 * Security Settings Component
 */
const SecuritySettings = ({ isDark, onChangePassword }) => (
  <div>
    <div className="mb-6">
      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Keselamatan Akaun
      </h2>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Urus kata laluan dan tetapan keselamatan
      </p>
    </div>

    <div className="space-y-4">
      <div className={`p-4 border rounded-lg ${
        isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaKey className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Kata Laluan
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tukar kata laluan akaun anda
              </p>
            </div>
          </div>
          <button onClick={onChangePassword} className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Tukar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SecuritySettings