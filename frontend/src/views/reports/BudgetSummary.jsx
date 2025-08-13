import React from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData } from '../../hooks';
import { TButton } from '../../components/Core';
import useBudgetSummary from '../../hooks/useBudgetSummary';
import { usePrintout } from '../../hooks';
import { formatUtils } from '../../utils/formatUtils';

const BudgetSummary = () => {
  const { currentUser } = useStateContext();
  
  const { 
    dashboardData, 
    isLoading: userLoading, 
    error: userError, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  const { data, loading, error, refreshData } = useBudgetSummary();

  // Initialize printout hook with specific options for budget summary
  const { printElement } = usePrintout({
    title: 'RINGKASAN ANGGARAN BAGI TAHUN 2025',
    orientation: 'landscape',
    paperSize: 'a4',
    includeStyles: true,
    showHeader: false,
    showFooter: true,
    headerText: 'RINGKASAN ANGGARAN BAGI TAHUN 2025',
    footerText: 'Dicetak pada: ' + new Date().toLocaleDateString('ms-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    margins: {
      top: 0.3,
      right: 0.3,
      bottom: 0.3,
      left: 0.3
    },
    customPrintStyles: `
      .statement-table {
        width: 100% !important;
        overflow: visible !important;
      }
      
      table {
        font-size: 0.6rem !important;
        line-height: 0.8rem !important;
      }
      
      th, td {
        padding: 0.1rem 0.2rem !important;
        border: 1px solid #333 !important;
      }
      
      .print\\:bg-green-400 {
        background-color: #4ade80 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-red-400 {
        background-color: #f87171 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-blue-200 {
        background-color: #93c5fd !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-yellow-100 {
        background-color: #fef3c7 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-purple-100 {
        background-color: #f3e8ff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `
  });

  const isLoading = userLoading || loading;
  const hasError = userError || error;

  // Handle print function
  const handlePrint = () => {
    printElement('.budget-summary-container');
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white ">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Memuat data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 bg-white ">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="font-medium text-red-600 mb-3">Ralat memuat data</p>
          <TButton onClick={refreshData} color="primary" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Cuba Lagi
          </TButton>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        Tiada data tersedia
      </div>
    );
  }

  const { revenueData, expenditureData, operationData } = data;
  const summaryData = operationData;
  const openingBalance = operationData.find(item => item.code === '0001');
  // const runningBalance = operationData.find(item => item.code === '0000000001');
  const specialSavings = operationData.find(item => item.code === '0002');
  const fixedDepositAmounts = operationData.find(item => item.code === '0003');

  return (
    <div className="budget-summary-container bg-white print:bg-white">
      
      {/* Header with Print Button - Hidden in print */}
      <div className="p-4 border-b print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              RINGKASAN ANGGARAN BAGI TAHUN 2025
            </h1>
          </div>
          <div className="flex space-x-2">
            <TButton onClick={refreshData} color="secondary" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Muat Semula
            </TButton>
            <TButton onClick={handlePrint} color="primary" size="sm">
              <Printer className="w-4 h-4 mr-1" />
              Cetak
            </TButton>
          </div>
        </div>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block text-center py-4">
        <h1 className="text-sm font-bold uppercase">
          RINGKASAN ANGGARAN BAGI TAHUN 2025
        </h1>
      </div>

      {/* Main Table */}
      <div className="p-4 print:p-2">
        <div className="overflow-x-auto statement-table">
          <table className="w-full border-collapse border border-gray-400 text-xs">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="border border-gray-400 px-2 py-1 text-center font-bold w-24">
                  KOD BAJET
                </th>
                <th className="border border-gray-400 px-2 py-1 text-center font-bold">
                  PERIHAL
                </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  SEBENAR<br />2023 RM
                </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  SEBENAR<br />2024 RM
                </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  BAJET<br />2023 RM
                </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  BAJET<br />2024 RM
                </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  BAJET<br />2025 RM
                </th>
              </tr>
            </thead>
            
            <tbody>
              {/* Revenue Section */}
              {Array.isArray(revenueData) && revenueData?.map((item, index) => (
                <tr key={`revenue-${index}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                  <td className="border border-gray-400 px-2 py-1 text-xs text-center">
                    {item.code}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-medium">
                    {item.name}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.actual2023 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.actual2024 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.budget2023 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.budget2024 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.budget2025 || 0)}
                  </td>
                </tr>
              )) || []}
              
              {/* Revenue Total */}
              <tr className="bg-green-400 font-bold print:bg-green-400">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  JUMLAH PENDAPATAN DARI SEMUA PUNCA
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.revenueTotal?.actual2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.revenueTotal?.actual2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.revenueTotal?.budget2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.revenueTotal?.budget2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.revenueTotal?.budget2025 || 0)}
                </td>
              </tr>

              {/* Empty spacer row */}
              <tr>
                <td colSpan={7} className="py-2"></td>
              </tr>

              {/* Expenditure Data */}
              {Array.isArray(expenditureData) && expenditureData?.map((item, index) => (
                <tr key={`expenditure-${index}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                  <td className="border border-gray-400 px-2 py-1 text-xs text-center">
                    {item.code}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-medium">
                    {item.name}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.actual2023 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.actual2024 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.budget2023 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.budget2024 || 0)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatUtils.formatCurrency(item.budget2025 || 0)}
                  </td>
                </tr>
              )) || []}

              {/* Expenditure Total */}
              <tr className="bg-red-400 font-bold print:bg-red-400">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  JUMLAH PERBELANJAAN DARI SEMUA PUNCA
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.expenditureTotal?.actual2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.expenditureTotal?.actual2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.expenditureTotal?.budget2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.expenditureTotal?.budget2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.expenditureTotal?.budget2025 || 0)}
                </td>
              </tr>

              {/* Empty spacer row */}
              <tr>
                <td colSpan={7} className="py-2"></td>
              </tr>

              {/* LEBIHAN /(KURANGAN) */}
              <tr className="bg-blue-200 font-bold print:bg-blue-200">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  LEBIHAN /(KURANGAN)
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.netPosition?.actual2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.netPosition?.actual2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.netPosition?.budget2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.netPosition?.budget2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.netPosition?.budget2025 || 0)}
                </td>
              </tr>

              {/* BAKI AWAL */}
              <tr className="bg-white print:bg-white font-medium">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  BAKI AWAL
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(openingBalance?.acttotalvalue[2] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(openingBalance?.acttotalvalue[1] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(openingBalance?.bdgttotalvalue[2] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(openingBalance?.bdgttotalvalue[1] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(openingBalance?.bdgttotalvalue[0] || 0)}
                </td>
              </tr>

              {/* LEBIHAN /(KURANGAN) SELEPAS TABUNGAN */}
              <tr className="bg-blue-200 font-bold print:bg-blue-200">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  LEBIHAN /(KURANGAN) SELEPAS TABUNGAN
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.runningBalance?.actual2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.runningBalance?.actual2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.runningBalance?.budget2023 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.runningBalance?.budget2024 || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                  {formatUtils.formatCurrency(summaryData?.runningBalance?.bdgtotal || 0)}
                </td>
              </tr>

              {/* (-)TABUNGAN KHAS (3%) */}
              <tr className="bg-yellow-100 print:bg-yellow-100 font-medium">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  (-)TABUNGAN KHAS (3%)
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(specialSavings?.acttotalvalue[2] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(specialSavings?.acttotalvalue[1] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(specialSavings?.bdgttotalvalue[2] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(specialSavings?.bdgttotalvalue[1] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(specialSavings?.bdgttotalvalue[0] || 0)}
                </td>
              </tr>

              {/* DEPOSIT SIMPANAN TETAP */}
              <tr className="bg-purple-100 print:bg-purple-100 font-medium">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  DEPOSIT SIMPANAN TETAP
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(fixedDepositAmounts?.acttotalvalue[2] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(fixedDepositAmounts?.acttotalvalue[1] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(fixedDepositAmounts?.bdgttotalvalue[2] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(fixedDepositAmounts?.bdgttotalvalue[1] || 0)}
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatUtils.formatCurrency(fixedDepositAmounts?.bdgttotalvalue[0] || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;