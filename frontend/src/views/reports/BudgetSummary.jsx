import React from 'react';
import { Printer, FileText, RefreshCw } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData, useBudgetSummary } from '../../hooks';
import { TButton } from '../../components/Core';

function BudgetSummary() {
  const { currentUser } = useStateContext();
  
  // TanStack Query hook untuk get dashboard data
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  // Custom hook untuk manage Budget Summary logic with dynamic calculations
  const {
    // Data values
    revenueData,
    expenditureData,
    revenueTotal,
    expenditureTotal,
    additionalBudgetLines,
    
    // Event handlers
    handleRefresh,
    handlePrint,
    
    // Helper functions
    formatCurrency,
    getBudgetYear,
    getCalculationSummary,
    
    // Loading states
    isLoading,
    hasError,
    
    // Configuration
    config
  } = useBudgetSummary(dashboardData, refetch);

  if (loading || isLoading) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Memuat data bajet...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || hasError) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Ralat memuat data bajet</p>
            <p className="text-sm mt-1">Sila cuba lagi atau hubungi pentadbir sistem</p>
          </div>
          <TButton onClick={handleRefresh} color="primary" size="sm" className="mt-3">
            <RefreshCw className="w-4 h-4 mr-2" />
            Cuba Lagi
          </TButton>
        </div>
      </div>
    );
  }

  const calculationSummary = getCalculationSummary();

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header - hidden in print */}
      <div className="p-6 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Ringkasan Bajet {getBudgetYear()}
            </h1>
            <p className="text-gray-600 mt-1">
              Ringkasan pendapatan dan perbelanjaan dengan pengiraan automatik
            </p>
          </div>
          <div className="flex space-x-3">
            <TButton onClick={handleRefresh} color="secondary" size="sm" title="Muat Semula Data">
              <RefreshCw className="w-4 h-4 mr-2" />
              Muat Semula
            </TButton>
            <TButton onClick={handlePrint} color="primary" size="sm" title="Cetak Ringkasan">
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </TButton>
          </div>
        </div>

      </div>

      {/* Print Content - Table Only */}
      <div className="print:p-4 print:text-black">
        {/* Simple Print Header - Only for print */}
        {/* <div className="text-center mb-4 print:block hidden">
          <h1 className="text-lg font-bold">RINGKASAN BAJET {getBudgetYear()}</h1>
        </div> */}

        {/* Main Budget Table - Print Only */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden print:shadow-none print:rounded-none mx-6 print:mx-0 print:bg-transparent">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400 print:text-sm">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th rowSpan="2" className="border border-gray-400 p-2 text-center font-bold">KOD AKAUN</th>
                  <th rowSpan="2" className="border border-gray-400 p-2 text-center font-bold">PERIHAL</th>
                  <th colSpan="2" className="border border-gray-400 p-2 text-center font-bold">SEBENAR</th>
                  <th colSpan="3" className="border border-gray-400 p-2 text-center font-bold">BAJET</th>
                </tr>
                <tr className="bg-gray-600 text-white">
                  <th className="border border-gray-400 p-2 text-center font-bold">2023 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2024 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2023 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2024 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2025 RM</th>
                </tr>
              </thead>
              
              <tbody>
                {/* Revenue Section */}
                {revenueData?.map((item, index) => (
                  <tr key={`revenue-${index}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="border border-gray-400 p-2 text-center">
                      {item.code}
                    </td>
                    <td className="border border-gray-400 p-2 font-medium">
                      {item.description}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.actual2023)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.actual2024)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.budget2023)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.budget2024)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.budget2025)}
                    </td>
                  </tr>
                ))}
                
                {/* Revenue Total */}
                <tr className="bg-gray-200 font-bold print:bg-gray-200">
                  <td colSpan="2" className="border border-gray-400 p-2 text-center">
                    JUMLAH PENDAPATAN DARI SEMUA PUNCA
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(revenueTotal?.actual2023)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(revenueTotal?.actual2024)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(revenueTotal?.budget2023)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(revenueTotal?.budget2024)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(revenueTotal?.budget2025)}
                  </td>
                </tr>

                {/* Expenditure Section Header */}
                <tr className="bg-gray-600 text-white">
                  <th className="border border-gray-400 p-2 text-center font-bold">KOD AKAUN</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">PERIHAL</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2023 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2024 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2023 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2024 RM</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">2025 RM</th>
                </tr>

                {/* Expenditure Data */}
                {expenditureData?.map((item, index) => (
                  <tr key={`expenditure-${index}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="border border-gray-400 p-2 text-center">
                      {item.code}
                    </td>
                    <td className="border border-gray-400 p-2 font-medium">
                      {item.description}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.actual2023)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.actual2024)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.budget2023)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.budget2024)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {formatCurrency(item.budget2025)}
                    </td>
                  </tr>
                ))}

                {/* Expenditure Total */}
                <tr className="bg-gray-200 font-bold print:bg-gray-200">
                  <td colSpan="3" className="border border-gray-400 p-2 text-center">
                    JUMLAH KESELURUHAN PERBELANJAAN
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(expenditureTotal?.actual2023)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(expenditureTotal?.actual2024)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(expenditureTotal?.budget2023)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(expenditureTotal?.budget2024)}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">
                    {formatCurrency(expenditureTotal?.budget2025)}
                  </td>
                </tr>

                {/* Dynamic Additional Budget Lines with calculated values */}
                {additionalBudgetLines?.map((line, index) => (
                  <tr key={`additional-${index}`} className={line.className || "bg-gray-100 print:bg-gray-100"}>
                    <td colSpan="3" className="border border-gray-400 p-2 text-center font-medium">
                      {line.description}
                      {line.type === 'deduction' && (
                        <span className="text-xs ml-2 text-gray-600 print:hidden">
                          (Tolakan)
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {line.actual2023 < 0 ? `(${formatCurrency(Math.abs(line.actual2023))})` : formatCurrency(line.actual2023)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {line.actual2024 < 0 ? `(${formatCurrency(Math.abs(line.actual2024))})` : formatCurrency(line.actual2024)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {line.budget2023 < 0 ? `(${formatCurrency(Math.abs(line.budget2023))})` : formatCurrency(line.budget2023)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {line.budget2024 < 0 ? `(${formatCurrency(Math.abs(line.budget2024))})` : formatCurrency(line.budget2024)}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {line.budget2025 < 0 ? `(${formatCurrency(Math.abs(line.budget2025))})` : formatCurrency(line.budget2025)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Footer - Hidden in Print */}
        <div className="mt-8 text-center text-sm text-gray-500 print:hidden">
          <p>Dicetak pada: {new Date().toLocaleDateString('ms-MY', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>

    </div>
  );
}

export default BudgetSummary;