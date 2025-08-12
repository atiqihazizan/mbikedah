import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../utils/axios";

export const useBudgetArchive = () => {
  // State management
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
