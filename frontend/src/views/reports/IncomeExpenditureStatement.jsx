import React from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData } from '../../hooks';
import { TButton } from '../../components/Core';
import { useIncomeExpenditureStatement } from '../../hooks/useIncomeExpediturreStatment';

function IncomeExpenditureStatement() {
  const { currentUser } = useStateContext();
  
  const { 
    dashboardData, 
    isLoading: loading, 
    error, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  const {
    // Data
    statementData,
    revenueTotal,
    expenditureTotal,
    netPosition,
    specialSavings,
    runningBalance,
    
    // Helpers
    formatCurrency,
    getBudgetYear,
    months,
    monthNames,
    
    // Event handlers
    handleRefresh,
    handlePrint,
    
    // States
    isLoading,
    hasError,
    
    // Config
    config
  } = useIncomeExpenditureStatement(dashboardData, refetch);

  if (loading || isLoading) {
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

  if (error || hasError) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="font-medium text-red-600 mb-3">Ralat memuat data</p>
          <TButton onClick={handleRefresh} color="primary" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Cuba Lagi
          </TButton>
        </div>
      </div>
    );
  }

  // Helper function to render a category section
  const renderCategorySection = (title, data, totals, bgColor = "bg-gray-100") => {
    if (!data || !data.length) return null;
    
    return (
      <>
        {/* Category Items */}
        {data.map((item, index) => (
          <tr key={`${title}-${index}`} className="hover:bg-gray-50 print:hover:bg-transparent">
            <td className="border border-gray-400 px-2 py-1 text-xs">
              {item.code}
            </td>
            <td className="border border-gray-400 px-2 py-1 text-xs">
              {item.description}
            </td>
            {months.map(month => (
              <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                {formatCurrency(item.monthly?.[month])}
              </td>
            ))}
          </tr>
        ))}
        
        {/* Category Total */}
        {totals && (
          <tr className={`${bgColor} font-semibold print:${bgColor}`}>
            <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs">
              JUMLAH {title}
            </td>
            {months.map(month => (
              <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                {formatCurrency(totals[month])}
              </td>
            ))}
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white print:bg-white">
      
      {/* Header with Print Button - Hidden in print */}
      <div className="p-4 border-b print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN BAGI TAHUN {getBudgetYear()}
            </h1>
          </div>
          <div className="flex space-x-2">
            <TButton onClick={handleRefresh} color="secondary" size="sm">
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
          RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN BAGI TAHUN {getBudgetYear()}
        </h1>
      </div>

      {/* Main Table */}
      <div className="p-4 print:p-2">
        <div className="overflow-x-auto statement-table">
          <table className="w-full border-collapse border border-gray-400 text-xs">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="border border-gray-400 px-2 py-1 text-center font-bold">
                  KOD BAJET
                </th>
                <th className="border border-gray-400 px-2 py-1 text-center font-bold">
                  PERIHAL
                </th>
                {monthNames.map(month => (
                  <th key={month} className="border border-gray-400 px-1 py-1 text-center font-bold">
                    {month}<br />RM
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              
              {/* PENDAPATAN HASIL */}
              {renderCategorySection(
                "PENDAPATAN HASIL", 
                statementData?.operatingRevenue, 
                revenueTotal?.operating,
                "bg-green-200"
              )}

              {/* PENDAPATAN LAIN-LAIN (BUKAN HASIL) */}
              {renderCategorySection(
                "PENDAPATAN LAIN-LAIN (BUKAN HASIL)", 
                statementData?.otherRevenue, 
                revenueTotal?.other,
                "bg-green-200"
              )}

              {/* PENDAPATAN SUMBER DANA */}
              {renderCategorySection(
                "PENDAPATAN SUMBER DANA", 
                statementData?.fundSources, 
                revenueTotal?.fund,
                "bg-green-200"
              )}

              {/* PENDAPATAN LUAR JANGKA */}
              {renderCategorySection(
                "PENDAPATAN LUAR JANGKA", 
                statementData?.extraordinaryRevenue, 
                revenueTotal?.extraordinary,
                "bg-green-200"
              )}

              {/* JUMLAH PENDAPATAN DARI SEMUA PUNCA */}
              <tr className="bg-green-400 font-bold print:bg-green-400">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  JUMLAH PENDAPATAN DARI SEMUA PUNCA
                </td>
                {months.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                    {formatCurrency(revenueTotal?.grand[month])}
                  </td>
                ))}
              </tr>

              {/* Empty spacer row */}
              <tr>
                <td colSpan={15} className="py-2"></td>
              </tr>

              {/* ASET BUKAN SEMASA */}
              {renderCategorySection(
                "ASET BUKAN SEMASA", 
                statementData?.nonCurrentAssets, 
                expenditureTotal?.nonCurrent,
                "bg-red-200"
              )}

              {/* ASET SEMASA */}
              {renderCategorySection(
                "ASET SEMASA", 
                statementData?.currentAssets, 
                expenditureTotal?.current,
                "bg-red-200"
              )}

              {/* BAYARAN HUTANG DAN FAEDAH */}
              {renderCategorySection(
                "BAYARAN HUTANG DAN FAEDAH", 
                statementData?.debtPayments, 
                expenditureTotal?.debt,
                "bg-red-200"
              )}

              {/* BELANJA OPERASI */}
              {renderCategorySection(
                "BELANJA OPERASI", 
                statementData?.operatingExpenses, 
                expenditureTotal?.operating,
                "bg-red-200"
              )}

              {/* EMOLUMEN & FAEDAH KAKITANGAN */}
              {renderCategorySection(
                "EMOLUMEN & FAEDAH KAKITANGAN", 
                statementData?.staffCosts, 
                expenditureTotal?.staff,
                "bg-red-200"
              )}

              {/* PERKHIDMATAN DAN PERBELANJAAN PEJABAT */}
              {renderCategorySection(
                "PERKHIDMATAN DAN PERBELANJAAN PEJABAT", 
                statementData?.officeExpenses, 
                expenditureTotal?.office,
                "bg-red-200"
              )}

              {/* SUMBANGAN DAN TAJAAN */}
              {renderCategorySection(
                "SUMBANGAN DAN TAJAAN", 
                statementData?.contributions, 
                expenditureTotal?.contributions,
                "bg-red-200"
              )}

              {/* PERBELANJAAN KHAS */}
              {renderCategorySection(
                "PERBELANJAAN KHAS", 
                statementData?.specialExpenses, 
                expenditureTotal?.special,
                "bg-red-200"
              )}

              {/* PERBELANJAAN LUAR JANGKA */}
              {renderCategorySection(
                "PERBELANJAAN LUAR JANGKA", 
                statementData?.extraordinaryExpenses, 
                expenditureTotal?.extraordinary,
                "bg-red-200"
              )}

              {/* JUMLAH KESELURUHAN PERBELANJAAN */}
              <tr className="bg-red-400 font-bold print:bg-red-400">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  JUMLAH KESELURUHAN PERBELANJAAN
                </td>
                {months.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                    {formatCurrency(expenditureTotal?.grand[month])}
                  </td>
                ))}
              </tr>

              {/* Empty spacer row */}
              <tr>
                <td colSpan={15} className="py-2"></td>
              </tr>

              {/* LEBIHAN /(KURANGAN) */}
              <tr className="bg-blue-300 font-bold print:bg-blue-300">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  LEBIHAN /(KURANGAN)
                </td>
                {months.map(month => {
                  const amount = netPosition?.[month] || 0;
                  return (
                    <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                      {amount < 0 ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}
                    </td>
                  );
                })}
              </tr>

              {/* BAKI AWAL */}
              <tr className="bg-gray-200 print:bg-gray-200">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  BAKI AWAL
                </td>
                <td className="border border-gray-400 px-1 py-1 text-right text-xs">
                  {formatCurrency(config?.openingBalance)}
                </td>
                {months.slice(1).map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                    -
                  </td>
                ))}
              </tr>

              {/* SIMPANAN TETAP */}
              <tr className="bg-purple-200 print:bg-purple-200">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  SIMPANAN TETAP
                </td>
                {months.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatCurrency(config?.fixedDepositAmounts?.[month])}
                  </td>
                ))}
              </tr>

              {/* TABUNGAN KHAS */}
              <tr className="bg-yellow-200 print:bg-yellow-200">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  TABUNGAN KHAS
                </td>
                {months.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {formatCurrency(specialSavings?.[month])}
                  </td>
                ))}
              </tr>

              {/* LEBIHAN /(KURANGAN) SELEPAS TABUNGAN & SIMPANAN TETAP */}
              <tr className="bg-indigo-400 font-bold print:bg-indigo-400">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  LEBIHAN /(KURANGAN) SELEPAS TABUNGAN & SIMPANAN TETAP
                </td>
                {months.map(month => {
                  const amount = runningBalance?.[month] || 0;
                  return (
                    <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                      {amount < 0 ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default IncomeExpenditureStatement;