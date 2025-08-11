import { FaChartLine, FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaSitemap, FaFolderPlus, FaSearch } from "react-icons/fa";
import BudgetFormDialog from "../../components/dialogs/BudgetFormDialog";
import BudgetAllocationDialog from "../../components/dialogs/BudgetAllocationDialog";
import TButton from "../../components/Core/TButton";
import DataTable from "../../components/DataTable";
import { formatUtils } from "../../utils/formatUtils";
import { useBudgetSettings } from "../../hooks";

/**
 * Main Budget Settings Component (Finance Role Only) - Infrastructure Setup
 */
const BudgetSettings = ({ isDark, currentUser, onUnsavedChanges }) => {
  const {
    // State
    departments,
    selectedBudget,
    initialFormData,
    isLoading,
    showDialog,
    showAllocationDialog,
    budgets,
    hierarchicalBudgets,
    
    // Actions
    handleSaveBudget,
    handleSaveBudgetAllocation,
    handleDeleteBudget,
    handleEditBudget,
    handleNewBudget,
    handleAllocationBudget,
    handleAddChild,
    handleDialogClose,
    handleAllocationDialogClose,
    
    // Utility functions
    getBudgetTypeLabel,
    getDepartmentName,
    canHaveChildren,
    getChildrenCount
  } = useBudgetSettings();

  // DataTable columns configuration
  const tableColumns = [
    {
      key: 'code',
      label: 'Kod Budget',
      render: (value, item) => (
        <div className="flex items-center">
          <div className="flex items-center" style={{ marginLeft: `${item.displayLevel * 20}px` }}>
            {item.displayLevel > 0 && (
              <div className="flex items-center mr-2">
                <div className="w-2 h-2 border-l border-b border-gray-400 mr-2"></div>
              </div>
            )}
          </div>
          <code className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-600'}`}>
            {value}
          </code>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Nama Budget',
      render: (value) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'type',
      label: 'Jenis',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 2
            ? isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
            : value === 1 
            ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
            : isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
        }`}>
          {getBudgetTypeLabel(value)}
        </span>
      )
    },
    {
      key: 'department_id',
      label: 'Jabatan',
      render: (value) => (
        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {getDepartmentName(value)}
        </span>
      )
    },
    {
      key: 'children_count',
      label: 'Children',
      textAlign: 'center',
      render: (value, item) => (
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-xs ${
            getChildrenCount(item.id) > 0
              ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
              : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            {getChildrenCount(item.id)}
          </span>
        </div>
      )
    },
    {
      key: 'bdgtotal',
      label: 'Jumlah Bajet',
      textAlign: 'right',
      render: (value) => (
        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {formatUtils.formatDecimal(value, 2)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Tindakan',
      textAlign: 'center',
      render: (value, item) => (
        <div className="grid grid-cols-4 gap-1 justify-items-center">
          {/* Add Child Button - Position 1 */}
          <div className="w-8 h-8 flex items-center justify-center">
            {canHaveChildren(item) ? (
              <TButton variant="subtle" color="green" size="sm" circle onClick={() => handleAddChild(item)} className="transition-all duration-200" title={`Tambah child budget untuk ${item.name}`}>
                <FaPlus className="w-3 h-3" />
              </TButton>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>

          {/* Allocation Button - Position 2 */}
          <div className="w-8 h-8 flex items-center justify-center">
            {getChildrenCount(item.id) === 0 ? (
              <TButton variant="subtle" color="blue" size="sm" circle onClick={() => handleAllocationBudget(item)} className="transition-all duration-200" title={`Edit allocation untuk ${item.name}`}>
                <FaMoneyBillWave className="w-4 h-4" />
              </TButton>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>

          {/* Edit Button - Position 3 */}
          <div className="w-8 h-8 flex items-center justify-center">
            <TButton variant="subtle" color="blue" size="sm" circle onClick={() => handleEditBudget(item)} className="transition-all duration-200" title={`Edit ${item.name}`}>
              <FaEdit className="w-4 h-4" />
            </TButton>
          </div>
          
          {/* Delete Button - Position 4 */}
          <div className="w-8 h-8 flex items-center justify-center">
            <TButton variant="subtle" color="red" size="sm" circle onClick={() => handleDeleteBudget(item.id, item.name)} className="transition-all duration-200" title={`Padam ${item.name}`}>
              <FaTrash className="w-4 h-4" />
            </TButton>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Struktur Budget
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Urus struktur hierarki dan kategori budget organisasi
            </p>
          </div>
          <TButton variant="solid" color="blue" size="lg" onClick={handleNewBudget} className="shadow-lg hover:shadow-xl px-4 py-2">
            <FaPlus className="w-4 h-4" />
            <span>Tambah Budget</span>
          </TButton>
        </div>

      </div>

      {/* Budget Table */}
      {isLoading ? (
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Memuat data budget...
          </p>
        </div>
      ) : (
        <DataTable data={hierarchicalBudgets} columns={tableColumns} itemsPerPage={10} searchPlaceholder="Cari budget..." isDark={isDark}/>
      )}

      {/* Budget Form Dialog */}
      <BudgetFormDialog isOpen={showDialog} onClose={handleDialogClose} selectedBudget={selectedBudget} initialFormData={initialFormData} departments={departments} 
      budgets={budgets} isDark={isDark} onSave={handleSaveBudget} onUnsavedChanges={onUnsavedChanges}/>

      <BudgetAllocationDialog isOpen={showAllocationDialog} onClose={handleAllocationDialogClose} selectedBudget={selectedBudget} onSave={handleSaveBudgetAllocation}/>
    </>
  );
};

export default BudgetSettings;