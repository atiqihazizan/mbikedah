import React from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import { useStateContext } from '../../contexts/ContextProvider';
import { useUserData, usePrintout } from '../../hooks';
import { TButton } from '../../components/Core';
import useIncomeExpediturreStatment from '../../hooks/useIncomeExpediturreStatment';

function IncomeExpenditureStatement() {
  const { currentUser } = useStateContext();
  
  const { 
    dashboardData, 
    isLoading: userLoading, 
    error: userError, 
    refreshUserData: refetch 
  } = useUserData(currentUser);
  
  const {
    statementData,
    incomeData,
    expenditureData,
    summaryData,
    loading,
    error,
    dataSource,
    refetch: refetchStatement
  } = useIncomeExpediturreStatment();

  // Initialize printout hook with specific options for income expenditure statement
  const { printElement } = usePrintout({
    title: `RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN BAGI TAHUN ${summaryData?.budgetYear || new Date().getFullYear()}`,
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
      
      .print\\:bg-green-200 {
        background-color: #bbf7d0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-red-200 {
        background-color: #fecaca !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `
  });

  const isLoading = userLoading || loading;
  const hasError = userError || error;

  // Handle print function
  const handlePrint = () => {
    printElement('.income-expenditure-container');
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
          <TButton onClick={refetchStatement} color="primary" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Cuba Lagi
          </TButton>
        </div>
      </div>
    );
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  // Get months array
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Helper function to render a category section
  const renderCategorySection = (title, data, totals, bgColor = "bg-gray-100") => {
    if (!data || !data.length) return [];
    
    return [
      // Category Items
      ...data.map((item, index) => (
        <tr key={`${title}-${index}`} className={`hover:bg-gray-50 print:hover:bg-transparent ${item.isChild ? 'bg-gray-50' : ''}`}>
          <td className="border border-gray-400 px-2 py-1 text-xs text-center">
            {item.isChild && item.code}
          </td>
          <td className={`border border-gray-400 px-2 py-1 text-xs ${item.isChild ? 'pl-6' : 'font-bold'}`}>
            {item.isChild && <span className="text-gray-400 mr-2">&nbsp;</span>}
            {item.description}
          </td>
          {monthNames.map(month => (
            <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
              {item.isChild && formatCurrency(item.monthly?.[month] || 0)}
            </td>
          ))}
        </tr>
      )),
      
      // Category Total
      ...(totals ? [(
        <tr key={`${title}-total`} className={`${bgColor} font-semibold print:${bgColor}`}>
          <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs">
            JUMLAH {title}
          </td>
          {monthNames.map(month => (
            <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
              {formatCurrency(totals[month] || 0)}
            </td>
          ))}
        </tr>
      )] : [])
    ];
  };

  return (
    <div className="income-expenditure-container min-h-screen bg-white print:bg-white">
      
      {/* Header with Print Button - Hidden in print */}
      <div className="p-4 border-b print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN BAGI TAHUN {summaryData?.budgetYear}
            </h1>
          </div>
          <div className="flex space-x-2">
            <TButton onClick={refetchStatement} color="secondary" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
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
          RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN BAGI TAHUN {summaryData?.budgetYear}
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
                incomeData?.operatingRevenue, 
                incomeData?.operatingTotal,
                "bg-green-200"
              )}

              {/* PENDAPATAN LAIN-LAIN (BUKAN HASIL) */}
              {renderCategorySection(
                "PENDAPATAN LAIN-LAIN (BUKAN HASIL)", 
                incomeData?.otherRevenue, 
                incomeData?.otherTotal,
                "bg-green-200"
              )}

              {/* PENDAPATAN SUMBER DANA */}
              {renderCategorySection(
                "PENDAPATAN SUMBER DANA", 
                incomeData?.fundSources, 
                incomeData?.fundTotal,
                "bg-green-200"
              )}

              {/* PENDAPATAN LUAR JANGKA */}
              {renderCategorySection(
                "PENDAPATAN LUAR JANGKA", 
                incomeData?.extraordinaryRevenue, 
                incomeData?.extraordinaryTotal,
                "bg-green-200"
              )}

              {/* JUMLAH PENDAPATAN DARI SEMUA PUNCA */}
              <tr className="bg-green-400 font-bold print:bg-green-400">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  JUMLAH PENDAPATAN DARI SEMUA PUNCA
                </td>
                {monthNames.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                    {formatCurrency(incomeData?.grandTotal?.[month] || 0)}
                  </td>
                ))}
              </tr>

              {/* Empty spacer row */}
              <tr>
                <td colSpan={14} className="py-2"></td>
              </tr>

              {/* ASET BUKAN SEMASA */}
              {renderCategorySection(
                "ASET BUKAN SEMASA", 
                expenditureData?.nonCurrentAssets, 
                expenditureData?.nonCurrentTotal,
                "bg-red-200"
              )}

              {/* ASET SEMASA */}
              {renderCategorySection(
                "ASET SEMASA", 
                expenditureData?.currentAssets, 
                expenditureData?.currentTotal,
                "bg-red-200"
              )}

              {/* BAYARAN HUTANG DAN FAEDAH */}
              {renderCategorySection(
                "BAYARAN HUTANG DAN FAEDAH", 
                expenditureData?.debtPayments, 
                expenditureData?.debtTotal,
                "bg-red-200"
              )}

              {/* BELANJA OPERASI */}
              {renderCategorySection(
                "BELANJA OPERASI", 
                expenditureData?.operatingExpenses, 
                expenditureData?.operatingTotal,
                "bg-red-200"
              )}

              {/* EMOLUMEN & FAEDAH KAKITANGAN */}
              {renderCategorySection(
                "EMOLUMEN & FAEDAH KAKITANGAN", 
                expenditureData?.staffCosts, 
                expenditureData?.staffTotal,
                "bg-red-200"
              )}

              {/* PERKHIDMATAN DAN PERBELANJAAN PEJABAT */}
              {renderCategorySection(
                "PERKHIDMATAN DAN PERBELANJAAN PEJABAT", 
                expenditureData?.officeExpenses, 
                expenditureData?.officeTotal,
                "bg-red-200"
              )}

              {/* SUMBANGAN DAN TAJAAN */}
              {renderCategorySection(
                "SUMBANGAN DAN TAJAAN", 
                expenditureData?.contributions, 
                expenditureData?.contributionsTotal,
                "bg-red-200"
              )}

              {/* PERBELANJAAN KHAS */}
              {renderCategorySection(
                "PERBELANJAAN KHAS", 
                expenditureData?.specialExpenses, 
                expenditureData?.specialTotal,
                "bg-red-200"
              )}

              {/* PERBELANJAAN LUAR JANGKA */}
              {renderCategorySection(
                "PERBELANJAAN LUAR JANGKA", 
                expenditureData?.extraordinaryExpenses, 
                expenditureData?.extraordinaryTotal,
                "bg-red-200"
              )}

              {/* JUMLAH PERBELANJAAN DARI SEMUA PUNCA */}
              <tr className="bg-red-400 font-bold print:bg-red-400">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  JUMLAH PERBELANJAAN DARI SEMUA PUNCA
                </td>
                {monthNames.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                    {formatCurrency(expenditureData?.grandTotal?.[month] || 0)}
                  </td>
                ))}
              </tr>

              {/* Empty spacer row */}
              <tr>
                <td colSpan={14} className="py-2"></td>
              </tr>

              {/* LEBIHAN /(KURANGAN) */}
              <tr className="bg-blue-200 font-bold print:bg-blue-200">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  LEBIHAN /(KURANGAN)
                </td>
                {monthNames.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                    {formatCurrency(summaryData?.netPosition?.monthly?.[month] || 0)}
                  </td>
                ))}
              </tr>

              {/* BAKI AWAL */}
              <tr className="bg-white print:bg-white font-medium">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  BAKI AWAL
                </td>
                {monthNames.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {summaryData?.openingBalance?.[month] !== undefined && summaryData?.openingBalance?.[month] !== null
                      ? formatCurrency(summaryData?.openingBalance?.[month])
                      : '-'}
                  </td>
                ))}
              </tr>

              {/* SIMPANAN TETAP */}
              <tr className="bg-purple-100 print:bg-purple-100 font-medium">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  SIMPANAN TETAP
                </td>
                {monthNames.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {summaryData?.fixedDepositAmounts?.monthly?.[month] !== undefined && summaryData?.fixedDepositAmounts?.monthly?.[month] !== null
                      ? formatCurrency(summaryData?.fixedDepositAmounts?.monthly?.[month])
                      : '-'}
                  </td>
                ))}
              </tr>

              {/* TABUNGAN KHAS */}
              <tr className="bg-yellow-100 print:bg-yellow-100 font-medium">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  TABUNGAN KHAS
                </td>
                {monthNames.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs">
                    {summaryData?.specialSavings?.monthly?.[month] !== undefined && summaryData?.specialSavings?.monthly?.[month] !== null
                      ? formatCurrency(summaryData?.specialSavings?.monthly?.[month])
                      : '-'}
                  </td>
                ))}
              </tr>

              {/* LEBIHAN /(KURANGAN) SELEPAS TABUNGAN & SIMPANAN TETAP */}
              <tr className="bg-blue-200 font-bold print:bg-blue-200">
                <td colSpan="2" className="border border-gray-400 px-2 py-1 text-xs text-center">
                  LEBIHAN /(KURANGAN) SELEPAS TABUNGAN & SIMPANAN TETAP
                </td>
                {monthNames.map(month => (
                  <td key={month} className="border border-gray-400 px-1 py-1 text-right text-xs font-bold">
                    {formatCurrency(summaryData?.runningBalance?.monthly?.[month] || 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default IncomeExpenditureStatement;