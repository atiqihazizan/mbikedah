import { useState, useEffect } from "react";
import { FaChartLine, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import apiClient from "../../utils/axios"; // Adjust path as needed
import BudgetFormDialog from "../../components/dialogs/BudgetFormDialog"; // Import the separated dialog

/**
 * Main Budget Settings Component (Finance Role Only)
 */
const BudgetSettings = ({ isDark, currentUser, onUnsavedChanges }) => {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterType, setFilterType] = useState('');

  // Load data awal
  useEffect(() => {
    loadBudgets();
    loadDepartments();
  }, []);

  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/budgets');
      setBudgets(response.data || []);
    } catch (error) {
      showNotification('error', 'Ralat memuat senarai budget');
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiClient.get('/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSaveBudget = async (budgetData, isEdit) => {
    try {
      if (isEdit) {
        const res = await apiClient.put(`/budgets/${isEdit.id}`, budgetData);
        console.log(budgetData);
        return;
        showNotification('success', 'Budget berjaya dikemaskini');
      } else {
        await apiClient.post('/budgets', budgetData);
        showNotification('success', 'Budget baru berjaya disimpan');
      }
      
      await loadBudgets();
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || 'Ralat menyimpan budget';
      showNotification('error', errorMessage);
      throw error;
    }
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setShowDialog(true);
  };

  const handleNewBudget = () => {
    setSelectedBudget(null);
    setShowDialog(true);
  };

  const handleDeleteBudget = async (budgetId, budgetName) => {
    if (!confirm(`Adakah anda pasti untuk memadam budget "${budgetName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await apiClient.delete(`/budgets/${budgetId}`);
      showNotification('success', 'Budget berjaya dipadam');
      await loadBudgets();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ralat memadam budget';
      showNotification('error', errorMessage);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount || 0);
  };

  const getBudgetTypeLabel = (type) => {
    return type === 2 ? 'Kredit' : type === 1 ? 'Debit' : 'Operasi';
  };

  // Filter budgets based on search and filters
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !filterYear || budget.yearly.toString() === filterYear;
    const matchesType = filterType === '' || budget.type.toString() === filterType;
    
    return matchesSearch && matchesYear && matchesType;
  });

  // Get unique years for filter
  const availableYears = [...new Set(budgets.map(b => b.yearly))].sort((a, b) => b - a);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pengurusan Budget
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Urus maklumat budget dan peruntukan kewangan organisasi
            </p>
          </div>
          <button
            onClick={handleNewBudget}
            className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Tambah Budget
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Cari nama atau kod budget..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          {/* <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Semua Tahun</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Semua Jenis</option>
            <option value="0">Operasi</option>
            <option value="1">Debit</option>
            <option value="2">Kredit</option>
          </select> */}
        </div>
      </div>

      {/* Notification */}
      {notification.message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          notification.type === 'success' 
            ? isDark ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-700 border-green-200'
            : isDark ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-100 text-red-700 border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {notification.message}
          </div>
        </div>
      )}

      {/* Budget Table */}
      <div className={`rounded-xl border shadow-lg ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Senarai Budget ({filteredBudgets.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Memuat data budget...
              </p>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <FaChartLine className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h4 className="text-lg font-medium mb-2">
                {budgets.length === 0 ? 'Tiada Budget Dijumpai' : 'Tiada Hasil Carian'}
              </h4>
              <p className="mb-4">
                {budgets.length === 0 
                  ? 'Belum ada budget yang dibuat untuk organisasi ini.'
                  : 'Tiada budget yang sepadan dengan kriteria carian anda.'
                }
              </p>
              {budgets.length === 0 && (
                <button
                  onClick={handleNewBudget}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Tambah budget pertama
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Kod Budget
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Budget
                    </th>
                    <th className={`text-right py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Peruntukan
                    </th>
                    <th className={`text-center py-4 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBudgets.map((budget, index) => (
                    <tr key={budget.id} className={`border-b transition-colors ${
                      isDark 
                        ? 'border-gray-700 hover:bg-gray-750' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}>
                      <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <code className={`px-2 py-1 rounded text-sm font-mono ${
                          isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-600'
                        }`}>
                          {budget.code}
                        </code>
                      </td>
                      <td className={`py-4 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {budget.name}
                      </td>
                      {/* <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          budget.type === 2
                            ? isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                            : budget.type === 1 
                            ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                            : isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getBudgetTypeLabel(budget.type)}
                        </span>
                      </td> */}
                      <td className={`py-4 px-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(budget.bdgtotal)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDark 
                                ? 'text-blue-400 hover:bg-gray-700 hover:text-blue-300' 
                                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                            }`}
                            title="Edit Budget"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id, budget.name)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDark 
                                ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
                                : 'text-red-600 hover:bg-red-50 hover:text-red-800'
                            }`}
                            title="Padam Budget"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Budget Form Dialog */}
      <BudgetFormDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        selectedBudget={selectedBudget}
        departments={departments}
        isDark={isDark}
        onSave={handleSaveBudget}
        onUnsavedChanges={onUnsavedChanges}
      />
    </div>
  );
};

export default BudgetSettings;