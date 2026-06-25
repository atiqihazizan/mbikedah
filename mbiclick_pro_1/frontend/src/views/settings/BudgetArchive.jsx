import { useMemo } from "react";
import {
  FaCalendarAlt,
  FaDatabase,
  FaExchangeAlt,
  FaSync,
  FaMoneyBillWave,
} from "react-icons/fa";
import TButton from "../../components/Core/TButton";
import { formatUtils } from "../../utils/formatUtils";
import BudgetAllocationDialog from "../../components/dialogs/BudgetAllocationDialog";
import DataTable from "../../components/DataTable";
import { useBudgetArchive } from "../../hooks/useBudgetArchive";

export default function BudgetArchive({ isDark, onUnsavedChanges }) {
  const {
    // State
    years,
    currentYear,
    selectedYear,
    archiveYear,
    isProcessing,
    budgets,
    filteredBudgets,
    showAllocationDialog,
    selectedBudget,

    // Actions
    handleManualRefresh,
    handleAllocationBudget,
    handleAllocationDialogClose,
    handleSaveBudgetAllocation,
    handleArchive,
    handleYearChange,
    handleArchiveYearChange,
    formatYearForDisplay,

    // Setters
    setShowAllocationDialog,
    setSelectedBudget,
  } = useBudgetArchive();

  // DataTable columns configuration
  const tableColumns = [
    {
      key: 'code',
      label: 'Kod',
      render: (value) => (
        <code className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-600'}`}>
          {value}
        </code>
      )
    },
    {
      key: 'name',
      label: 'Nama',
      render: (value, item) => {
        // Calculate indent based on level (0 = root, 1 = child, 2 = grandchild, etc.)
        const indentLevel = item.level || 0;
        const indentSpaces = indentLevel * 20; // 20px per level
        
        return (
          <div className="flex items-center">
            {/* Indent spacing */}
            <div className="flex items-center" style={{ marginLeft: `${indentSpaces}px` }}>
              {indentLevel > 0 && (
                <div className="flex items-center mr-2">
                  <div className={`w-2 h-2 border-l border-b ${
                    isDark ? 'border-gray-500' : 'border-gray-400'
                  } mr-2`}></div>
                </div>
              )}
            </div>
            
            {/* Budget name */}
            <span className="font-medium">{value}</span>
          </div>
        );
      }
    },
    {
      key: 'type',
      label: 'Jenis',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${value === 2
            ? isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
            : value === 1
              ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
              : isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
          }`}>
          {value === 0 ? "Operasi" : value === 1 ? "Pendapatan" : "Perbelanjaan"}
        </span>
      )
    },
    {
      key: 'bdgtotal',
      label: 'Nilai Bajet (RM)',
      textAlign: 'right',
      render: (value) => (
        <span className="font-mono">
          {formatUtils.formatCurrency(value || 0, false)}
        </span>
      )
    },
    // {
    //   key: 'acttotal',
    //   label: 'Nilai Sebenar (RM)',
    //   textAlign: 'right',
    //   render: (value) => (
    //     <span className="font-mono">
    //       {formatUtils.formatCurrency(value || 0, false)}
    //     </span>
    //   )
    // },
    {
      key: 'actions',
      label: 'Tindakan',
      textAlign: 'center',
      render: (value, item) => {
        // Only show actions if child_count == 0 (single budget items)
        if (item.child_count !== 0) {
          return (
            <div className="flex items-center justify-center">
              <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Parent Budget
              </span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center">
            <TButton
              variant="outline"
              color="blue"
              size="sm"
              onClick={() => handleAllocationBudget(item)}
              title={`Edit allocation untuk ${item.name}`}
            >
              <FaMoneyBillWave className="w-4 h-4 mr-1" />
              Agihan
            </TButton>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Arkib Bajet Tahun
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Proses untuk arkib bajet mengikut tahun.
          </p>
        </div>
      </div>

      {/* Bahagian Pengurusan Arkib */}
      {/* <div className={`rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="p-4">
        </div>
      </div> */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isDark ? "text-white" : "text-gray-900"}`}>
            <FaDatabase className="mr-2" />
            <span className="font-semibold">Senarai Arkib Tahun</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className={`w-4 h-4 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className={`px-3 py-1 border rounded-lg w-24 text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaDatabase className={`w-4 h-4 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Tahun Arkib:</span>
            <select
              value={archiveYear}
              onChange={(e) => handleArchiveYearChange(e.target.value)}
              className={`px-3 py-1 border rounded-lg w-24 text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <TButton
            variant="solid"
            color="blue"
            onClick={handleArchive}
            onChecking={isProcessing}
            isDisable={isProcessing || archiveYear >= currentYear}
            size="sm"
          >
            <FaExchangeAlt className="w-4 h-4 mr-1" />
            <span>Arkib Bajet</span>
          </TButton>
          <TButton variant="outline" color="ghost" onClick={handleManualRefresh} size="sm">
            <FaSync className="w-4 h-4 mr-1" />
            <span>Refresh</span>
          </TButton>
          <div className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}>
            {filteredBudgets.length} rekod
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable data={filteredBudgets} columns={tableColumns} itemsPerPage={8} searchPlaceholder="Cari kod/nama bajet..." isDark={isDark} />

      {/* Budget Allocation Dialog */}
      <BudgetAllocationDialog isOpen={showAllocationDialog} onClose={handleAllocationDialogClose} selectedBudget={selectedBudget} onSuccess={handleSaveBudgetAllocation} selectedYear={selectedYear} />
    </div>
  );
}