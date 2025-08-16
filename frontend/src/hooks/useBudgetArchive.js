import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../utils/axios";

export const useBudgetArchive = () => {
  // State management
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [archiveYear, setArchiveYear] = useState(new Date().getFullYear() - 1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [budgets, setBudgets] = useState([]);

  // Generate years from 2024 to current year
  const years = useMemo(() => {
    const startYear = 2024;
    const endYear = currentYear;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [currentYear]);

  // Allocation dialog state
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const loadBudgetsForYear = async (year, showToast = false) => {
    try {
      const response = await apiClient.get(`/budgets/year/${year}`);
      const list = response.data || [];
      
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
    if (selectedYear) {
      loadBudgetsForYear(selectedYear, false); // Don't show toast for automatic loading
    }
  }, [selectedYear]); // Only depend on selectedYear

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

      if (response.success) {
        toast.success("Arkib berjaya! Data arkib telah diarchive dan dikemaskini untuk tahun baru.");
        setSelectedYear(archiveYear );
        loadBudgetsForYear(archiveYear, false); // Don't show toast for automatic loading
      } else {
        toast.error(response.message || "Arkib gagal");
      }
    } catch (error) {
      console.error("Archive error:", error);
      const msg = error.response?.message || "Ralat semasa arkib";
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

  return {
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
  };
};
