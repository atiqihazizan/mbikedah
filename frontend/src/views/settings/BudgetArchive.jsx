import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaDatabase,
  FaExchangeAlt,
  FaSync,
  FaMoneyBillWave,
} from "react-icons/fa";
import apiClient from "../../utils/axios";
import TButton from "../../components/Core/TButton";
import { formatUtils } from "../../utils/formatUtils";
import BudgetAllocationDialog from "../../components/dialogs/BudgetAllocationDialog";
import DataTable from "../../components/DataTable";


export default function BudgetArchive({ isDark, onUnsavedChanges }) {
  const [years, setYears] = useState([]);
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [archiveYear, setArchiveYear] = useState(new Date().getFullYear() - 1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [budgets, setBudgets] = useState([]);

  // Allocation dialog state
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // Load distinct years for selection
  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await apiClient.get("/budgets/years");
        console.log("Available years:", res);
        const data = res.data || res?.data?.data || [];
        const arr = Array.isArray(res?.data) ? res.data : data;
        const y = (arr || []).filter((v) => !!v);
        setYears(y);
        
        // Set default selected year to current year if available, otherwise use first available year
        if (y.length > 0) {
          if (y.includes(currentYear)) {
            setSelectedYear(currentYear);
          } else {
            setSelectedYear(y[0]);
          }
        }
        
        // Set archive year to previous year (cannot archive current or future years)
        setArchiveYear(Math.max(currentYear - 7, Math.max(currentYear - 1, y.length > 0 ? y[0] : currentYear - 1)));
      } catch (e) {
        console.error("Error loading years:", e);
        toast.error("Ralat memuat senarai tahun");
      }
    };
    loadYears();
  }, []); // Remove currentYear dependency to prevent re-runs

  const loadBudgetsForYear = async (year, showToast = false) => {
    try {
      const response = await apiClient.get(`/budgets/year/${year}`);
      const list = response.data?.data || response.data || [];
      setBudgets(list);
      // Only show toast for manual refresh
      if (showToast) {
        toast.success(`Berjaya memuat ${list.length} rekod arkib untuk tahun ${year}`);
      }
    } catch (error) {
      console.error("Error loading budgets:", error);
      toast.error(`Ralat memuat data arkib bagi tahun ${year}`);
      setBudgets([]);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    if (selectedYear) {
      loadBudgetsForYear(selectedYear, true); // Show toast for manual refresh
    }
  };

  // Load budgets when selected year changes
  useEffect(() => {
    if (selectedYear && years.length > 0) {
      loadBudgetsForYear(selectedYear, false); // Don't show toast for automatic loading
    }
  }, [selectedYear, years.length]); // Only depend on selectedYear and years.length

  const filteredBudgets = useMemo(() => {
    return budgets;
  }, [budgets]);



  const handleAllocationBudget = (budget) => {
    setSelectedBudget(budget);
    setShowAllocationDialog(true);
  };

  const handleAllocationDialogClose = () => {
    setShowAllocationDialog(false);
    setSelectedBudget(null);
  };

  const handleSaveBudgetAllocation = async () => {
    // Refresh data after allocation update
    if (selectedYear) {
      loadBudgetsForYear(selectedYear, false);
    }
  };

  const handleArchive = async () => {
    if (archiveYear >= currentYear) {
      toast.error("Tidak boleh arkib budget untuk tahun sekarang dan ke atas");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiClient.post("/budgets/archive", {
        from_year: archiveYear,
      });

      if (response.data?.success) {
        toast.success("Arkib berjaya! Data arkib telah diarchive dan dikemaskini untuk tahun baru.");
        // Refresh data and years
        const yearsRes = await apiClient.get("/budgets/years");
        const yearsData = yearsRes.data || yearsRes?.data?.data || [];
        const yearsArr = Array.isArray(yearsRes?.data) ? yearsRes.data : yearsData;
        const y = (yearsArr || []).filter((v) => !!v);
        setYears(y);
        
        // Load budgets for the year after archive
        if (archiveYear + 1 <= currentYear) {
          setSelectedYear(archiveYear + 1);
          loadBudgetsForYear(archiveYear + 1, false); // Don't show toast for automatic loading
        }
      } else {
        toast.error(response.data?.message || "Arkib gagal");
      }
    } catch (error) {
      console.error("Archive error:", error);
      const msg = error.response?.data?.message || "Ralat semasa arkib";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(parseInt(year));
  };

  const handleArchiveYearChange = (year) => {
    const yearInt = parseInt(year);
    if (yearInt >= (currentYear - 7) && yearInt < currentYear) {
      setArchiveYear(yearInt);
    } else if (yearInt >= currentYear) {
      toast.warning(`Tahun ${yearInt} tidak boleh diarkib. Hanya tahun sebelum ${currentYear} yang dibenarkan.`);
      setArchiveYear(currentYear - 1);
    } else if (yearInt < (currentYear - 7)) {
      toast.warning(`Tahun ${yearInt} terlalu lama. Tahun minimum adalah ${currentYear - 7}.`);
      setArchiveYear(currentYear - 7);
    }
  };

  // Format date for display (shows only year)
  const formatYearForDisplay = (year) => {
    return `${year}`;
  };

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
          {value === 0 ? "Operasi" : value === 1 ? "Pendapatan" : "Perbelanjaan"}
        </span>
      )
    },
    {
      key: 'bdgtotal',
      label: 'Jumlah (RM)',
      textAlign: 'right',
      render: (value) => (
        <span className="font-mono">
          {formatUtils.formatCurrency(value || 0)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Tindakan',
      textAlign: 'center',
      render: (value, item) => (
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
      )
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
      <div className={`rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="p-4">
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
                  className={`px-3 py-1 border rounded-lg w-24 text-sm ${
                    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
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
                  className={`px-3 py-1 border rounded-lg w-24 text-sm ${
                    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {Array.from({ length: currentYear - (currentYear - 7) + 1 }, (_, i) => (currentYear - 7) + i).map((year) => (
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
          <DataTable 
            data={filteredBudgets} 
            columns={tableColumns} 
            itemsPerPage={8} 
            searchPlaceholder="Cari kod/nama arkib..." 
            isDark={isDark}
          />
        </div>
      </div>

      {/* Budget Allocation Dialog */}
      <BudgetAllocationDialog 
        isOpen={showAllocationDialog} 
        onClose={handleAllocationDialogClose} 
        selectedBudget={selectedBudget} 
        onSuccess={handleSaveBudgetAllocation}
      />
    </div>
  );
}