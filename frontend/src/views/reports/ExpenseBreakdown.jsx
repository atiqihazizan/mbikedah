import React from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData, usePrintout } from '../../hooks';
import { TButton } from '../../components/Core';
import useExpenseBreakdown from '../../hooks/useExpenseBreakdown';

function ExpenseBreakdown() {
  const { currentUser } = useStateContext();
  
  const { 
    dashboardData, 
    isLoading: userLoading, 
    error: userError, 
    refreshUserData: refetch 
  } = useUserData(currentUser);

  const {
    expenseData,
    expenseTotal,
    budgetTotal,
    actualTotal,
    categorySections,
    formatCurrency,
    loading,
    error,
    dataSource,
    refetch: refetchExpense
  } = useExpenseBreakdown();

  // Initialize printout hook with specific options for expense breakdown
  const { printElement } = usePrintout({
    title: `BUTIRAN ANGGARAN PERBELANJAAN BAGI TAHUN ${new Date().getFullYear()}`,
    orientation: 'landscape',
    paperSize: 'a4',
    includeStyles: true,
    showHeader: false,
    showFooter: true,
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
    printElement('.expense-breakdown-container');
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white min-h-screen">
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
      <div className="p-6 bg-white min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="font-medium text-red-600 mb-3">Ralat memuat data</p>
          <TButton onClick={refetchExpense} color="primary" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Cuba Lagi
          </TButton>
        </div>
      </div>
    );
  }

  // Get months array
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="expense-breakdown-container min-h-screen bg-white print:bg-white">
      {/* Header with Print Button - Hidden in print */}
      <div className="p-4 border-b print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              BUTIRAN ANGGARAN PERBELANJAAN BAGI TAHUN {new Date().getFullYear()}
            </h1>
            {expenseData?.config?.organization && (
              <p className="text-sm text-gray-600 mt-1">{expenseData.config.organization}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <TButton onClick={refetchExpense} color="secondary" size="sm">
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
          BUTIRAN ANGGARAN PERBELANJAAN BAGI TAHUN {new Date().getFullYear()}
        </h1>
        {expenseData?.config?.organization && (
          <p className="text-xs mt-1">{expenseData.config.organization}</p>
        )}
      </div>

      {/* Main Table */}
      <div className="p-4 print:p-2">
        <div className="overflow-x-auto statement-table">
          <table className="w-full border-collapse border border-gray-400 text-xs">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="border border-gray-400 px-2 py-1 text-center font-bold">
                  KOD AKAUN
                </th>
                <th className="border border-gray-400 px-2 py-1 text-center font-bold">
                  PERIHAL
                </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  SEBENAR <br/> 2024 (RM)
                  </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  BAJET <br/> 2024 (RM)
                  </th>
                <th className="border border-gray-400 px-1 py-1 text-center font-bold">
                  BAJET <br/> 2025 (RM)
                  </th>
                {monthNames.map(month => (
                  <th key={month} className="border border-gray-400 px-1 py-1 text-center font-bold">
                    {month}<br />RM
                  </th>
                ))}
                </tr>
              </thead>
            <tbody>
              {/* Render all category sections */}
              {categorySections.map((section, index) => (
                <React.Fragment key={section.title}>
                  {/* Main Category */}
                  <tr className={section.bgColor}>
                    <td className="border border-gray-400 px-2 py-1 text-xs font-medium">
                      {section.data.code || '-'}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-xs font-medium">
                      {section.data.description}
                    </td>
                    <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                      {formatCurrency(section.data.actual2024)}
                    </td>
                    <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                      {formatCurrency(section.data.budget2024)}
                    </td>
                    <td className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                      {formatCurrency(section.data.budget2025)}
                    </td>
                    {months.map(month => (
                      <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                        {formatCurrency(section.data.monthly?.[month])}
                    </td>
                    ))}
                  </tr>
                  {/* Sub Categories */}
                  {section.subCategories.map((subCategory, subIndex) => (
                    <React.Fragment key={`${section.title}-sub-${subIndex}`}>
                      <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                        <td className="border border-gray-400 px-2 py-1 text-xs">
                          {subCategory.code || '-'}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-xs">
                          {subCategory.description}
                        </td>
                        <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                          {formatCurrency(subCategory.actual2024)}
                    </td>
                        <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                          {formatCurrency(subCategory.budget2024)}
                    </td>
                        <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                          {formatCurrency(subCategory.budget2025)}
                    </td>
                        {months.map(month => (
                          <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                            {formatCurrency(subCategory.monthly?.[month])}
                    </td>
                        ))}
                </tr>
                      {/* Details for subcategories */}
                      {subCategory.details?.map((detail, detailIndex) => (
                        <tr key={`${section.title}-sub-${subIndex}-detail-${detailIndex}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                          <td className="border border-gray-400 px-2 py-1 text-xs pl-4">
                            {detail.code || '-'}
                          </td>
                          <td className="border border-gray-400 px-2 py-1 text-xs pl-4">
                            {detail.description}
                          </td>
                          <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                            {formatCurrency(detail.actual2024)}
                    </td>
                          <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                            {formatCurrency(detail.budget2024)}
                    </td>
                          <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                            {formatCurrency(detail.budget2025)}
                    </td>
                          {months.map(month => (
                            <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                              -
                    </td>
                          ))}
                  </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default ExpenseBreakdown;
