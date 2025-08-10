import { useEffect, useMemo, useState, Fragment } from "react";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaDatabase,
  FaExchangeAlt,
  FaFilter,
  FaSave,
  FaSearch,
  FaSync,
} from "react-icons/fa";
import apiClient from "../../utils/axios";
import TButton from "../../components/Core/TButton";
import { formatUtils } from "../../utils/formatUtils";

const monthFields = [
  { key: "bdg1", label: "JAN" },
  { key: "bdg2", label: "FEB" },
  { key: "bdg3", label: "MAC" },
  { key: "bdg4", label: "APR" },
  { key: "bdg5", label: "MEI" },
  { key: "bdg6", label: "JUN" },
  { key: "bdg7", label: "JUL" },
  { key: "bdg8", label: "OGOS" },
  { key: "bdg9", label: "SEP" },
  { key: "bdg10", label: "OKT" },
  { key: "bdg11", label: "NOV" },
  { key: "bdg12", label: "DIS" },
];

export default function BudgetRollover({ isDark, onUnsavedChanges }) {
  const [years, setYears] = useState([]);
  const [fromYear, setFromYear] = useState(new Date().getFullYear());
  const [isProcessing, setIsProcessing] = useState(false);

  const [budgets, setBudgets] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [edited, setEdited] = useState({});
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Load distinct years for selection
  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await apiClient.get("/budgets/years");
        console.log(res);
        const data = res.data || res?.data?.data || [];
        const arr = Array.isArray(res?.data) ? res.data : data;
        const y = (arr || []).filter((v) => !!v);
        setYears(y);
        if (y.length > 0 && !y.includes(fromYear)) {
          setFromYear(y[0]);
        }
      } catch (e) {
        // ignore
      }
    };
    loadYears();
  }, []);

  const loadBudgetsForYear = async (year) => {
    try {
      const response = await apiClient.get(`/budgets/year/${year}`);
      console.log(response);
      const list = response.data?.data || response.data || [];
      setBudgets(list);
    } catch (error) {
      toast.error("Ralat memuat data budget bagi tahun");
    }
  };

  useEffect(() => {
    loadBudgetsForYear(fromYear + 1);
  }, [fromYear]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesText =
        !filter ||
        b.name?.toLowerCase().includes(filter.toLowerCase()) ||
        b.code?.toLowerCase().includes(filter.toLowerCase());
      const matchesType = typeFilter === "" || String(b.type) === String(typeFilter);
      return matchesText && matchesType;
    });
  }, [budgets, filter, typeFilter]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getEditValues = (b) => {
    if (edited[b.id]) return edited[b.id];
    const init = {};
    monthFields.forEach(({ key }) => {
      init[key] = Number(b[key] || 0);
    });
    return init;
  };

  const setEditValue = (id, key, value) => {
    setEdited((prev) => ({
      ...prev,
      [id]: { ...getEditValues({ id, [key]: value }), [key]: value },
    }));
  };

  const getTotal = (vals) => monthFields.reduce((sum, { key }) => sum + (Number(vals[key]) || 0), 0);

  const saveRow = async (b) => {
    try {
      const editVals = edited[b.id];
      if (!editVals) return;

      const payload = {
        id: b.id,
        ...editVals,
        bdgtotal: getTotal(editVals),
        balance: getTotal(editVals) - (b.acttotal || 0),
      };

      await apiClient.put(`/budgets/${b.id}`, payload);
      toast.success("Budget berjaya dikemaskini");
      
      // Refresh data
      loadBudgetsForYear(fromYear + 1);
      setEdited((prev) => {
        const newEdited = { ...prev };
        delete newEdited[b.id];
        return newEdited;
      });
    } catch (error) {
      toast.error("Ralat menyimpan budget");
    }
  };

  const handleRollover = async () => {
    setIsProcessing(true);
    try {
      const response = await apiClient.post("/budgets/rollover", {
        from_year: fromYear,
      });

      if (response.data?.success) {
        toast.success("Rollover berjaya! Data budget telah diarchive dan dikemaskini untuk tahun baru.");
        // Refresh data
        loadBudgetsForYear(fromYear + 1);
      } else {
        toast.error(response.data?.message || "Rollover gagal");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Ralat semasa rollover";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Rollover Budget Tahun
            </h2>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Proses tutup akaun tahun lama dan buka akaun tahun baru dengan bawa forward budget amounts.
            </p>
          </div>
          
          <TButton 
            variant="solid" 
            color="blue" 
            onClick={handleRollover} 
            onChecking={isProcessing} 
            isDisable={isProcessing}
          >
            <FaExchangeAlt className="w-4 h-4" />
            <span>Rollover Bajet</span>
          </TButton>
        </div>
      </div>

      {/* Budget Management Section */}
      <div className={`rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center ${isDark ? "text-white" : "text-gray-900"}`}>
              <FaDatabase className="mr-2" />
              <span className="font-semibold">Senarai Budget Tahun {fromYear + 1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TButton variant="outline" color="ghost" onClick={() => loadBudgetsForYear(fromYear + 1)}>
                <FaSync className="w-4 h-4" />
                <span>Refresh</span>
              </TButton>
              <div className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}>
                {filteredBudgets.length} rekod
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 opacity-60" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Cari kod/nama budget..."
                className={`w-full pl-9 pr-3 py-2 border rounded-lg ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center">
                <FaFilter className="mr-2 opacity-60" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Semua Jenis</option>
                  <option value="0">Operasi</option>
                  <option value="1">Pendapatan</option>
                  <option value="2">Perbelanjaan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? "border-gray-700" : "border-gray-200"} border-b-2`}>
                  <th className="text-left py-3 px-3">#</th>
                  <th className="text-left py-3 px-3">Kod</th>
                  <th className="text-left py-3 px-3">Nama</th>
                  <th className="text-left py-3 px-3">Jenis</th>
                  <th className="text-right py-3 px-3">Jumlah (RM)</th>
                  <th className="text-center py-3 px-3">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map((b, index) => (
                  <Fragment key={b.id}>
                    <tr className={`${isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} border-b`}>
                      <td className="py-3 px-3">{index + 1}</td>
                      <td className="py-3 px-3 font-mono">{b.code}</td>
                      <td className="py-3 px-3">{b.name}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          b.type === 0 ? "bg-blue-100 text-blue-800" :
                          b.type === 1 ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {b.type === 0 ? "Operasi" : b.type === 1 ? "Pendapatan" : "Perbelanjaan"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {formatUtils.formatCurrency(b.bdgtotal || 0)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <TButton
                            variant="outline"
                            color="ghost"
                            size="sm"
                            onClick={() => toggleExpand(b.id)}
                          >
                            {expanded[b.id] ? <FaChevronDown /> : <FaChevronRight />}
                            {expanded[b.id] ? "Tutup" : "Edit"}
                          </TButton>
                        </div>
                      </td>
                    </tr>
                    
                    {expanded[b.id] && (
                      <tr className={`${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <td colSpan="6" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            {monthFields.map(({ key, label }) => (
                              <div key={key} className="md:col-span-1">
                                <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                  {label}
                                </label>
                                <input
                                  type="number"
                                  value={getEditValues(b)[key] || 0}
                                  onChange={(e) => setEditValue(b.id, key, e.target.value)}
                                  className={`w-full px-2 py-1 text-sm border rounded ${
                                    isDark ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                                  }`}
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            ))}
                            
                            <div className="md:col-span-12 flex items-center justify-between pt-3 border-t">
                              <div className="text-sm">
                                <span className="font-medium">Jumlah: </span>
                                <span className="font-mono font-bold">
                                  {formatUtils.formatCurrency(getTotal(getEditValues(b)))}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <TButton
                                  variant="outline"
                                  color="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEdited((prev) => {
                                      const newEdited = { ...prev };
                                      delete newEdited[b.id];
                                      return newEdited;
                                    });
                                  }}
                                >
                                  Batal
                                </TButton>
                                <TButton
                                  variant="solid"
                                  color="blue"
                                  size="sm"
                                  onClick={() => saveRow(b)}
                                >
                                  <FaSave className="w-3 h-3 mr-1" />
                                  Simpan
                                </TButton>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


