import { useState } from "react";
import { FaChartLine, FaPiggyBank } from "react-icons/fa";

/**
 * Budget Settings Component (Finance Role Only)
 */
const BudgetSettings = ({ isDark, currentUser, onUnsavedChanges }) => {
  const [budgetData, setBudgetData] = useState({
    monthlyBudget: '',
    yearlyBudget: '',
    departmentBudget: '',
    projectBudget: '',
    emergencyFund: '',
    budgetCategory: 'operational'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setBudgetData(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  const handleSaveBudget = async () => {
    setIsLoading(true);
    try {
      // Implement API call to save budget data
      console.log('Saving budget data:', budgetData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Maklumat Budget
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Urus maklumat budget dan peruntukan kewangan
        </p>
      </div>

      <div className="space-y-6">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center">
              <FaChartLine className={`w-6 h-6 mr-3 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Budget Bulanan
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Peruntukan setiap bulan
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center">
              <FaPiggyBank className={`w-6 h-6 mr-3 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Dana Kecemasan
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Simpanan kecemasan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Budget Bulanan (RM)
            </label>
            <input
              type="number"
              value={budgetData.monthlyBudget}
              onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
              placeholder="0.00"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Budget Tahunan (RM)
            </label>
            <input
              type="number"
              value={budgetData.yearlyBudget}
              onChange={(e) => handleInputChange('yearlyBudget', e.target.value)}
              placeholder="0.00"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Budget Jabatan (RM)
            </label>
            <input
              type="number"
              value={budgetData.departmentBudget}
              onChange={(e) => handleInputChange('departmentBudget', e.target.value)}
              placeholder="0.00"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Budget Projek (RM)
            </label>
            <input
              type="number"
              value={budgetData.projectBudget}
              onChange={(e) => handleInputChange('projectBudget', e.target.value)}
              placeholder="0.00"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Budget Category */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Kategori Budget
          </label>
          <select
            value={budgetData.budgetCategory}
            onChange={(e) => handleInputChange('budgetCategory', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="operational">Operasi</option>
            <option value="capital">Modal</option>
            <option value="emergency">Kecemasan</option>
            <option value="development">Pembangunan</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveBudget}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </div>
            ) : (
              'Simpan Budget'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetSettings