import { useState, useEffect, useMemo, useCallback } from 'react';
import usePrintout from './usePrintout';

export const useIncomeExpenditureStatement = (dashboardData, refetch) => {
  const [statementData, setStatementData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Configuration
  const SPECIAL_SAVINGS_RATE = 0.03; // 3%
  const OPENING_BALANCE = 1021929.88;

  // Simulate API call for statement data
  const fetchStatementData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Data from the provided table - organized by category and month
      const apiResponse = {
        // Revenue categories
        operatingRevenue: [
          {
            code: "5001/000",
            description: "HASIL AKTIVITI PEMBALAKAN",
            monthly: {
              jan: 6575000.00, feb: 0, mar: 850000.00, apr: 0, may: 850000.00, jun: 1050000.00,
              jul: 1275000.00, aug: 0, sep: 1275000.00, oct: 0, nov: 1275000.00, dec: 0
            }
          },
          {
            code: "5002/000",
            description: "HASIL AKTIVITI PERLADANGAN",
            monthly: {
              jan: 754780.00, feb: 4398.33, mar: 238398.33, apr: 4398.33, may: 4398.33, jun: 4398.33,
              jul: 238398.33, aug: 4398.33, sep: 4398.33, oct: 4398.33, nov: 238398.33, dec: 4398.33
            }
          },
          {
            code: "5003/000",
            description: "HASIL AKTIVITI PERTANIAN",
            monthly: {
              jan: 979805.83, feb: 99526.09, mar: 60020.54, apr: 115074.34, may: 60020.54, jun: 60020.54,
              jul: 60020.54, aug: 60020.54, sep: 60020.54, oct: 60020.54, nov: 225020.54, dec: 60020.54
            }
          },
          {
            code: "5004/000",
            description: "HASIL AKTIVITI PERLOMBONGAN",
            monthly: {
              jan: 4171772.40, feb: 70000.00, mar: 3064069.00, apr: 70000.00, may: 70000.00, jun: 70000.00,
              jul: 318834.40, aug: 70000.00, sep: 158869.00, oct: 70000.00, nov: 70000.00, dec: 70000.00
            }
          },
          {
            code: "5005/000",
            description: "HASIL AKTIVITI KUARI",
            monthly: {
              jan: 948844.72, feb: 86000.00, mar: 76000.00, apr: 76000.00, may: 66000.00, jun: 66000.00,
              jul: 69034.50, aug: 56000.00, sep: 56000.00, oct: 56000.00, nov: 56000.00, dec: 229810.22
            }
          },
          {
            code: "5006/000",
            description: "HASIL AKTIVITI PENGIKLANAN",
            monthly: {
              jan: 33250.00, feb: 0, mar: 0, apr: 11083.25, may: 0, jun: 0,
              jul: 0, aug: 11083.25, sep: 0, oct: 0, nov: 0, dec: 11083.50
            }
          },
          {
            code: "5009/000",
            description: "HASIL AKTIVITI TELEKOMUNIKASI",
            monthly: {
              jan: 748740.00, feb: 2920.00, mar: 356620.00, apr: 2920.00, may: 2920.00, jun: 2920.00,
              jul: 2920.00, aug: 362920.00, sep: 2920.00, oct: 2920.00, nov: 2920.00, dec: 2920.00
            }
          },
          {
            code: "5010/000",
            description: "HASIL AKTIVITI TENAGA",
            monthly: {
              jan: 8400.00, feb: 8400.00, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "5016/000",
            description: "HASIL AKTIVITI PEMBANGUNAN HARTANAH",
            monthly: {
              jan: 1361400.00, feb: 5000.00, mar: 5000.00, apr: 5000.00, may: 5000.00, jun: 5000.00,
              jul: 1306400.00, aug: 5000.00, sep: 5000.00, oct: 5000.00, nov: 5000.00, dec: 5000.00
            }
          }
        ],
        
        otherRevenue: [
          {
            code: "5101/000",
            description: "FAEDAH DAN DIVIDEN",
            monthly: {
              jan: 2217316.41, feb: 3842.14, mar: 2527.07, apr: 196094.00, may: 1212.00, jun: 2527.07,
              jul: 1001212.00, aug: 1212.00, sep: 2527.07, oct: 1212.00, nov: 1212.00, dec: 1001212.00
            }
          },
          {
            code: "5104/000",
            description: "PENERIMAAN DARIPADA JUALAN ASET",
            monthly: {
              jan: 9480000.00, feb: 1600000.00, mar: 30000.00, apr: 7850000.00, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "5105/000",
            description: "PENERIMAAN DARI AGENSI & PENGHUTANG",
            monthly: {
              jan: 6118652.94, feb: 354652.94, mar: 222000.00, apr: 1052000.00, may: 322000.00, jun: 322000.00,
              jul: 922000.00, aug: 312000.00, sep: 912000.00, oct: 900000.00, nov: 200000.00, dec: 600000.00
            }
          },
          {
            code: "5106/000",
            description: "PENERIMAAN SEKURITY DEPOSIT",
            monthly: {
              jan: 818058.66, feb: 268000.00, mar: 460626.00, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 89432.66, oct: 0, nov: 0, dec: 0
            }
          }
        ],

        fundSources: [
          {
            code: "5202/000",
            description: "PENERIMAAN DANA KERPAN",
            monthly: {
              jan: 530111.15, feb: 230000.00, mar: 0, apr: 0, may: 300111.15, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          }
        ],

        extraordinaryRevenue: [
          {
            code: "5300/100",
            description: "PENERIMAAN BAYARAN PREMIUM (LH-BALAK)",
            monthly: {
              jan: 600000.00, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 600000.00
            }
          },
          {
            code: "5300/500",
            description: "PENERIMAAN /PENDAPATAN LAIN-LAIN",
            monthly: {
              jan: 840540.00, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 400000.00, dec: 135340.00
            }
          }
        ],

        // Expenditure categories
        nonCurrentAssets: [
          {
            code: "2001/000",
            description: "TANAH DAN PEMBAIKAN TANAH",
            monthly: {
              jan: 1069231.30, feb: 1000.00, mar: 1000.00, apr: 0, may: 0, jun: 0,
              jul: 257417.10, aug: 120269.30, sep: 191965.00, oct: 299091.70, nov: 0, dec: 198488.20
            }
          },
          {
            code: "2003/000",
            description: "KENDERAAN",
            monthly: {
              jan: 100000.00, feb: 0, mar: 0, apr: 0, may: 100000.00, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "2004/000",
            description: "ALATAN KELENGKAPAN PEJABAT",
            monthly: {
              jan: 27260.00, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 27260.00, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "2006/000",
            description: "KOMPUTER DAN PERISIAN",
            monthly: {
              jan: 50900.00, feb: 0, mar: 0, apr: 11200.00, may: 39700.00, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          }
        ],

        currentAssets: [
          {
            code: "3001/000",
            description: "PELABURAN",
            monthly: {
              jan: 1225000.00, feb: 18750.00, mar: 518750.00, apr: 18750.00, may: 18750.00, jun: 518750.00,
              jul: 18750.00, aug: 18750.00, sep: 18750.00, oct: 18750.00, nov: 18750.00, dec: 18750.00
            }
          },
          {
            code: "3002/000",
            description: "PENDAHULUAN KEPADA ANAK SYARIKAT",
            monthly: {
              jan: 2817372.28, feb: 193822.75, mar: 261015.57, apr: 149881.26, may: 147164.31, jun: 125203.31,
              jul: 565840.23, aug: 172061.01, sep: 230725.96, oct: 228547.16, nov: 223121.21, dec: 266705.82
            }
          }
        ],

        debtPayments: [
          {
            code: "4001/000",
            description: "BAYARAN PINJAMAN",
            monthly: {
              jan: 363000.00, feb: 25000.00, mar: 25000.00, apr: 25000.00, may: 32000.00, jun: 32000.00,
              jul: 32000.00, aug: 32000.00, sep: 32000.00, oct: 32000.00, nov: 32000.00, dec: 32000.00
            }
          },
          {
            code: "4002/000",
            description: "BAYARAN HUTANG",
            monthly: {
              jan: 10060443.09, feb: 104643.15, mar: 118300.00, apr: 418300.00, may: 118300.00, jun: 4453499.15,
              jul: 358300.00, aug: 118300.00, sep: 117600.79, oct: 688300.00, nov: 1288300.00, dec: 1288300.00
            }
          }
        ],

        operatingExpenses: [
          {
            code: "9001/000",
            description: "KOS PENGURUSAN TANAH",
            monthly: {
              jan: 981592.00, feb: 12800.00, mar: 1750.00, apr: 1000.00, may: 1800.00, jun: 918642.00,
              jul: 3000.00, aug: 12800.00, sep: 1000.00, oct: 2000.00, nov: 12800.00, dec: 13000.00
            }
          },
          {
            code: "9002/000",
            description: "KOS LADANG HUTAN & ASAS TANI",
            monthly: {
              jan: 693240.00, feb: 0, mar: 500.00, apr: 2060.00, may: 560.00, jun: 375560.00,
              jul: 3000.00, aug: 500.00, sep: 300500.00, oct: 4060.00, nov: 500.00, dec: 5000.00
            }
          },
          {
            code: "9003/000",
            description: "KOS PEMBALAKAN",
            monthly: {
              jan: 2867000.00, feb: 0, mar: 0, apr: 3400.00, may: 300000.00, jun: 0,
              jul: 305100.00, aug: 0, sep: 1350000.00, oct: 5100.00, nov: 450000.00, dec: 453400.00
            }
          },
          {
            code: "9004/000",
            description: "KOS PENGIKLANAN",
            monthly: {
              jan: 58014.00, feb: 0, mar: 15556.00, apr: 17010.00, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 17010.00, nov: 0, dec: 0
            }
          },
          {
            code: "9005/000",
            description: "KOS PENGURUSAN ACARA",
            monthly: {
              jan: 187872.00, feb: 0, mar: 28650.00, apr: 9000.00, may: 42700.00, jun: 38252.00,
              jul: 49000.00, aug: 0, sep: 20270.00, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "9006/000",
            description: "KOS PERLOMBONGAN",
            monthly: {
              jan: 209800.00, feb: 0, mar: 0, apr: 19000.00, may: 1000.00, jun: 1000.00,
              jul: 19000.00, aug: 146800.00, sep: 1000.00, oct: 19000.00, nov: 1000.00, dec: 1000.00
            }
          }
        ],

        staffCosts: [
          {
            code: "9101/000",
            description: "GAJI",
            monthly: {
              jan: 3852000.00, feb: 321000.00, mar: 321000.00, apr: 321000.00, may: 321000.00, jun: 321000.00,
              jul: 321000.00, aug: 321000.00, sep: 321000.00, oct: 321000.00, nov: 321000.00, dec: 321000.00
            }
          },
          {
            code: "9103/000",
            description: "CARUMAN BERKANUN KAKITANGAN",
            monthly: {
              jan: 762840.00, feb: 63570.00, mar: 63570.00, apr: 63570.00, may: 63570.00, jun: 63570.00,
              jul: 63570.00, aug: 63570.00, sep: 63570.00, oct: 63570.00, nov: 63570.00, dec: 63570.00
            }
          },
          {
            code: "9105/000",
            description: "KEBAJIKAN DAN FAEDAH TETAP KAKITANGAN",
            monthly: {
              jan: 892084.00, feb: 24340.33, mar: 24340.33, apr: 624340.33, may: 24340.33, jun: 24340.33,
              jul: 24340.33, aug: 24340.33, sep: 24340.33, oct: 24340.33, nov: 24340.33, dec: 24340.33
            }
          },
          {
            code: "9106/000",
            description: "IMBUHAN TAHUNAN",
            monthly: {
              jan: 1133500.00, feb: 94458.33, mar: 94458.33, apr: 94458.33, may: 94458.33, jun: 94458.33,
              jul: 94458.33, aug: 94458.33, sep: 94458.33, oct: 94458.33, nov: 94458.33, dec: 94458.33
            }
          },
          {
            code: "9107/000",
            description: "BAYARAN ELAUN-ELAUN KHAS",
            monthly: {
              jan: 187800.00, feb: 14600.00, mar: 14600.00, apr: 14600.00, may: 18800.00, jun: 14600.00,
              jul: 14600.00, aug: 14600.00, sep: 18800.00, oct: 14600.00, nov: 14600.00, dec: 18800.00
            }
          },
          {
            code: "9108/000",
            description: "PERJALANAN, PENGINAPAN DAN SARA HIDUP KAKITANGAN",
            monthly: {
              jan: 347100.00, feb: 28925.00, mar: 28925.00, apr: 28925.00, may: 28925.00, jun: 28925.00,
              jul: 28925.00, aug: 28925.00, sep: 28925.00, oct: 28925.00, nov: 28925.00, dec: 28925.00
            }
          },
          {
            code: "9109/000",
            description: "HONORARIUM",
            monthly: {
              jan: 105600.00, feb: 8800.00, mar: 8800.00, apr: 8800.00, may: 8800.00, jun: 8800.00,
              jul: 8800.00, aug: 8800.00, sep: 8800.00, oct: 8800.00, nov: 8800.00, dec: 8800.00
            }
          }
        ],

        officeExpenses: [
          {
            code: "9201/000",
            description: "BAYARAN CUKAI PENDAPATAN",
            monthly: {
              jan: 142300.00, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 142300.00, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "9202/000",
            description: "PERHUBUNGAN DAN UTILITI",
            monthly: {
              jan: 14640.00, feb: 1220.00, mar: 1220.00, apr: 1220.00, may: 1220.00, jun: 1220.00,
              jul: 1220.00, aug: 1220.00, sep: 1220.00, oct: 1220.00, nov: 1220.00, dec: 1220.00
            }
          },
          {
            code: "9203/000",
            description: "SEWAAN",
            monthly: {
              jan: 52932.00, feb: 4411.00, mar: 4411.00, apr: 4411.00, may: 4411.00, jun: 4411.00,
              jul: 4411.00, aug: 4411.00, sep: 4411.00, oct: 4411.00, nov: 4411.00, dec: 4411.00
            }
          },
          {
            code: "9204/000",
            description: "PENYELENGGARAAN DAN PEMBAIKAN",
            monthly: {
              jan: 88340.00, feb: 4320.00, mar: 4820.00, apr: 12320.00, may: 4820.00, jun: 12320.00,
              jul: 5820.00, aug: 4820.00, sep: 12320.00, oct: 4820.00, nov: 4820.00, dec: 4820.00
            }
          },
          {
            code: "9205/000",
            description: "PERKHIDMATAN IKTISAS DAN PERKHIDMATAN LAIN",
            monthly: {
              jan: 353516.00, feb: 0, mar: 0, apr: 0, may: 13000.00, jun: 340516.00,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "9206/000",
            description: "KERAIAN DAN HOSPITALITI",
            monthly: {
              jan: 45100.00, feb: 2883.33, mar: 2883.33, apr: 2883.33, may: 2883.33, jun: 2883.33,
              jul: 2883.33, aug: 2883.33, sep: 13383.33, oct: 2883.33, nov: 2883.33, dec: 2883.33
            }
          },
          {
            code: "9207/000",
            description: "KURSUS DAN SEMINAR",
            monthly: {
              jan: 214950.00, feb: 17912.50, mar: 17912.50, apr: 17912.50, may: 17912.50, jun: 17912.50,
              jul: 17912.50, aug: 17912.50, sep: 17912.50, oct: 17912.50, nov: 17912.50, dec: 17912.50
            }
          },
          {
            code: "9208/000",
            description: "BELANJA PEJABAT DAN LAIN-LAIN",
            monthly: {
              jan: 216840.00, feb: 9795.00, mar: 9795.00, apr: 37295.00, may: 30595.00, jun: 9795.00,
              jul: 41295.00, aug: 9795.00, sep: 29295.00, oct: 9795.00, nov: 9795.00, dec: 9795.00
            }
          },
          {
            code: "9209/000",
            description: "PROGRAM /ACARA KAKITANGAN",
            monthly: {
              jan: 142000.00, feb: 1000.00, mar: 1000.00, apr: 1000.00, may: 1000.00, jun: 1000.00,
              jul: 1000.00, aug: 1000.00, sep: 131000.00, oct: 1000.00, nov: 1000.00, dec: 1000.00
            }
          }
        ],

        contributions: [
          {
            code: "9301/000",
            description: "SUMBANGAN KEPADA KERAJAAN NEGERI",
            monthly: {
              jan: 720000.00, feb: 10000.00, mar: 10000.00, apr: 10000.00, may: 10000.00, jun: 10000.00,
              jul: 10000.00, aug: 10000.00, sep: 10000.00, oct: 10000.00, nov: 10000.00, dec: 610000.00
            }
          },
          {
            code: "9302/000",
            description: "SUMBANGAN DAN TAJAAN LAIN",
            monthly: {
              jan: 120000.00, feb: 10000.00, mar: 10000.00, apr: 10000.00, may: 10000.00, jun: 10000.00,
              jul: 10000.00, aug: 10000.00, sep: 10000.00, oct: 10000.00, nov: 10000.00, dec: 10000.00
            }
          },
          {
            code: "9303/000",
            description: "SUMBANGAN BANTUAN",
            monthly: {
              jan: 72000.00, feb: 6000.00, mar: 6000.00, apr: 6000.00, may: 6000.00, jun: 6000.00,
              jul: 6000.00, aug: 6000.00, sep: 6000.00, oct: 6000.00, nov: 6000.00, dec: 6000.00
            }
          },
          {
            code: "9304/000",
            description: "SUMBANGAN TAJAAN ANAK SYARIKAT",
            monthly: {
              jan: 80000.00, feb: 0, mar: 0, apr: 80000.00, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "9305/000",
            description: "SUMBANGAN KELAB KAKITANGAN MBI KEDAH",
            monthly: {
              jan: 24000.00, feb: 0, mar: 0, apr: 24000.00, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          }
        ],

        specialExpenses: [
          {
            code: "9401/000",
            description: "BAYARAN LAIN-LAIN AGENSI",
            monthly: {
              jan: 2109528.00, feb: 175794.00, mar: 175794.00, apr: 175794.00, may: 175794.00, jun: 175794.00,
              jul: 175794.00, aug: 175794.00, sep: 175794.00, oct: 175794.00, nov: 175794.00, dec: 175794.00
            }
          },
          {
            code: "9402/000",
            description: "BAYARAN SAHAM PESERTA KERPAN",
            monthly: {
              jan: 530111.15, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 265055.15, aug: 0, sep: 0, oct: 0, nov: 0, dec: 265056.00
            }
          }
        ],

        extraordinaryExpenses: [
          {
            code: "9501/000",
            description: "BAYARAN TUNTUTAN SAMAN/CIVIL",
            monthly: {
              jan: 589006.60, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 589006.60, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
            }
          },
          {
            code: "9503/000",
            description: "PREMIUM PEMBALAKAN (PENUKARAN LH-BALAK)",
            monthly: {
              jan: 600000.00, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 600000.00
            }
          },
          {
            code: "9503/000",
            description: "PEMULANGAN BAKI DANA PROJEK INSPEK",
            monthly: {
              jan: 49150.00, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
              jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 49150.00
            }
          }
        ],

        // Configuration
        config: {
          specialSavingsRate: SPECIAL_SAVINGS_RATE,
          openingBalance: OPENING_BALANCE,
          fixedDepositAmounts: {
            jan: 1000000.00, feb: 0, mar: 500000.00, apr: 0, may: 0, jun: 500000.00,
            jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
          }
        },

        meta: {
          year: 2025,
          currency: "RM",
          title: "RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN",
          lastUpdated: "2024-12-01T00:00:00Z"
        }
      };

      setStatementData(apiResponse);
      
    } catch (error) {
      console.error('Error fetching statement data:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchStatementData();
  }, [fetchStatementData]);

  // Helper function to get total for a category
  const getCategoryTotal = useCallback((category) => {
    if (!category || !category.length) return {};
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const totals = { total: 0 };
    
    months.forEach(month => {
      totals[month] = category.reduce((sum, item) => sum + (item.monthly?.[month] || 0), 0);
      totals.total += totals[month];
    });
    
    return totals;
  }, []);

  // Calculate totals for all revenue categories
  const revenueTotal = useMemo(() => {
    if (!statementData) return null;
    
    const operatingTotal = getCategoryTotal(statementData.operatingRevenue);
    const otherTotal = getCategoryTotal(statementData.otherRevenue);
    const fundTotal = getCategoryTotal(statementData.fundSources);
    const extraordinaryTotal = getCategoryTotal(statementData.extraordinaryRevenue);
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    
    months.forEach(month => {
      grandTotal[month] = (operatingTotal[month] || 0) + (otherTotal[month] || 0) + 
                         (fundTotal[month] || 0) + (extraordinaryTotal[month] || 0);
      grandTotal.total += grandTotal[month];
    });
    
    return {
      operating: operatingTotal,
      other: otherTotal,
      fund: fundTotal,
      extraordinary: extraordinaryTotal,
      grand: grandTotal
    };
  }, [statementData, getCategoryTotal]);

  // Calculate totals for all expenditure categories
  const expenditureTotal = useMemo(() => {
    if (!statementData) return null;
    
    const nonCurrentTotal = getCategoryTotal(statementData.nonCurrentAssets);
    const currentTotal = getCategoryTotal(statementData.currentAssets);
    const debtTotal = getCategoryTotal(statementData.debtPayments);
    const operatingTotal = getCategoryTotal(statementData.operatingExpenses);
    const staffTotal = getCategoryTotal(statementData.staffCosts);
    const officeTotal = getCategoryTotal(statementData.officeExpenses);
    const contributionsTotal = getCategoryTotal(statementData.contributions);
    const specialTotal = getCategoryTotal(statementData.specialExpenses);
    const extraordinaryTotal = getCategoryTotal(statementData.extraordinaryExpenses);
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const grandTotal = { total: 0 };
    
    months.forEach(month => {
      grandTotal[month] = (nonCurrentTotal[month] || 0) + (currentTotal[month] || 0) + 
                         (debtTotal[month] || 0) + (operatingTotal[month] || 0) +
                         (staffTotal[month] || 0) + (officeTotal[month] || 0) +
                         (contributionsTotal[month] || 0) + (specialTotal[month] || 0) +
                         (extraordinaryTotal[month] || 0);
      grandTotal.total += grandTotal[month];
    });
    
    return {
      nonCurrent: nonCurrentTotal,
      current: currentTotal,
      debt: debtTotal,
      operating: operatingTotal,
      staff: staffTotal,
      office: officeTotal,
      contributions: contributionsTotal,
      special: specialTotal,
      extraordinary: extraordinaryTotal,
      grand: grandTotal
    };
  }, [statementData, getCategoryTotal]);

  // Calculate net position (surplus/deficit)
  const netPosition = useMemo(() => {
    if (!revenueTotal || !expenditureTotal) return null;
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const net = { total: 0 };
    
    months.forEach(month => {
      net[month] = (revenueTotal.grand[month] || 0) - (expenditureTotal.grand[month] || 0);
      net.total += net[month];
    });
    
    return net;
  }, [revenueTotal, expenditureTotal]);

  // Calculate special savings (3% of revenue)
  const specialSavings = useMemo(() => {
    if (!revenueTotal || !statementData?.config) return null;
    
    const rate = statementData.config.specialSavingsRate;
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const savings = { total: 0 };
    
    months.forEach(month => {
      savings[month] = (revenueTotal.grand[month] || 0) * rate;
      savings.total += savings[month];
    });
    
    return savings;
  }, [revenueTotal, statementData]);

  // Calculate running balance
  const runningBalance = useMemo(() => {
    if (!netPosition || !statementData?.config) return null;
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const fixedDeposits = statementData.config.fixedDepositAmounts;
    const balance = {};
    
    let currentBalance = statementData.config.openingBalance;
    
    months.forEach(month => {
      currentBalance += (netPosition[month] || 0);
      currentBalance -= (specialSavings?.[month] || 0);
      currentBalance -= (fixedDeposits[month] || 0);
      balance[month] = currentBalance;
    });
    
    return balance;
  }, [netPosition, specialSavings, statementData]);

  // Helper functions
  const formatCurrency = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  }, []);

  const getBudgetYear = useCallback(() => {
    return statementData?.meta?.year?.toString() || new Date().getFullYear().toString();
  }, [statementData]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    await fetchStatementData();
    if (refetch) {
      refetch();
    }
  }, [fetchStatementData, refetch]);

  // Print functionality
  const { printElement } = usePrintout({
    title: `RINGKASAN ANGGARAN PENERIMAAN DAN PEMBAYARAN ${getBudgetYear() || '2025'}`,
    orientation: 'landscape',
    paperSize: 'a4',
    margins: { top: 0.3, right: 0.3, bottom: 0.3, left: 0.3 },
    customPrintStyles: 'table * { font-size: 8px !important; }'
  });

  const handlePrint = useCallback(() => {
    printElement('.overflow-x-auto');
  }, [printElement, getBudgetYear]);

  // Get all months array
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return {
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
    getCategoryTotal,
    months,
    monthNames,
    
    // Event handlers
    handleRefresh,
    handlePrint,
    
    // States
    isLoading,
    hasError,
    
    // Config
    config: statementData?.config
  };
};