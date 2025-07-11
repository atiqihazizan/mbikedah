import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AlertTriangle, ChevronLeft, Printer, X, FileText, CheckCircle, XCircle, Check, PlusIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from '@tanstack/react-query';
import { useStateContext } from "../../contexts/ContextProvider";
import { formatDate, formatCurrency } from "../../config/format";
import TButton from "../../components/Core/TButton";
import TSelect from "../../components/Core/TSelect";
import TInput from "../../components/Core/TInput";
import TLoadingSpinner from "../../components/Core/TLoadingSpinner";
import TSpinner from "../../components/Core/TSpinner";
import FormC from "../../components/FormContext";
import apiClient from "../../utils/axios";

const BillingPaymentDialog = ({ isOpen, onClose, idBilling, onProcessComplete }) => {
  const queryClient = useQueryClient();
  const { currentUser } = useStateContext();
  const abortControllerRef = useRef(null);
  
  // Billing data states
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState([]);
  
  // Transaction states
  const [transactions, setTransactions] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [incomplete, setIncomplete] = useState(false);

  // Calculate totals
  const totalAmount = useMemo(() => 
    transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0), 
    [transactions]
  );
  
  const totalAccepted = useMemo(() => 
    billing?.details?.filter(detail => detail.accept === 1)
      .reduce((sum, detail) => sum + parseFloat(detail.total || 0), 0) || 0, 
    [billing?.details]
  );

  // Default transaction data
  const defaultTransactionData = {
    id: 0,
    bank_id: '',
    amount: '',
    balance: 0,
    paid_date: '',
    paid_ref: '',
  };

  // Validation effect
  useEffect(() => {
    if (transactions.length === 0) return setIncomplete(true);
    if (!transactions.every(tx => tx.bank_id && parseFloat(tx.amount || 0) > 0)) return setIncomplete(true);
    if (!transactions.every(tx => tx.paid_date && tx.paid_ref)) return setIncomplete(true);
    if (totalAccepted !== totalAmount) return setIncomplete(true);
    
    // Validate remarks (optional but show warning if empty)
    if (!remarks.trim()) {
      setRemarksError('Catatan disyorkan untuk rekod yang lebih baik');
    } else {
      setRemarksError('');
    }
    
    setIncomplete(false);
  }, [totalAccepted, totalAmount, transactions, remarks]);

  // Fetch billing data and banks
  const fetchAllData = useCallback(async () => {
    if (!idBilling || !isOpen) return;
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    try {
      const [billingRes, banksRes] = await Promise.all([
        apiClient.post(`/status-validation/validate`, {
          billing_id: idBilling, 
          status: 6, 
          action: 'process'
        }),
        apiClient.get("/banks")
      ]);
      
      setBilling(billingRes.data);
      setBanks(banksRes.data || banksRes);
      setTransactions(billingRes.data?.transactions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
      onClose();
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [idBilling, isOpen, onClose]);

  // Handle approval
  const handleApprove = async () => {
    if (incomplete) return toast.error("Sila pastikan semua bank dipilih dan jumlah credit dimasukkan");
    if (transactions?.length === 0) return toast.error("Maklumat pembayar belum dimasukkan");
    if (totalAmount !== totalAccepted) return toast.error("Jumlah bayaran tidak sama dengan jumlah permohonan");
    
    // Use the remarks from state instead of prompt
    const finalRemarks = remarks.trim() || "Tiada catatan tambahan";
  
    if (confirm) {
      try {
        setProcessing(true);
        const dataPost = { remarks: finalRemarks, transactions };
        await apiClient.post(`/billings/${billing.id}/process-payment`, dataPost);
        
        // Invalidate queries to refresh dashboard data
        await queryClient.invalidateQueries({ queryKey: ['userData', currentUser?.id] });
        
        toast.success("Bil berjaya diluluskan");
        
        if (onProcessComplete) onProcessComplete('payment', "Bil berjaya diluluskan");
        
        onClose();
      } catch (error) {
        console.error("Error approving billing:", error.response?.data?.message || error.message);
        toast.error(error.response?.data?.message || "Gagal meluluskan bil");
      } finally {
        setProcessing(false);
      }
    }
  };

  // Handle rejection
  const handleReject = async () => {
    const remarks = window.prompt("Sila nyatakan sebab penolakan:");
    if (remarks) {
      try {
        setProcessing(true);
        await apiClient.post(`/billings/${billing.id}/reject`, { remarks });
        
        // Invalidate queries to refresh dashboard data
        await queryClient.invalidateQueries({ queryKey: ['userData', currentUser?.id] });
        
        toast.success("Bil berjaya ditolak");
        
        if (onProcessComplete) onProcessComplete('reject', "Bil berjaya ditolak");
        
        onClose();
      } catch (error) {
        console.error("Error rejecting billing:", error);
        toast.error(error.response?.data?.message || "Gagal menolak bil");
      } finally {
        setProcessing(false);
      }
    }
  };

  // Handle add transaction
  const handleAddTransaction = () => {
    setTransactions([...transactions, defaultTransactionData]);
  };

  // Close dialog handler
  const handleClose = () => {
    setTransactions([]);
    setRemarks('');
    setRemarksError('');
    onClose();
  };

  // Effects
  useEffect(() => {
    if (isOpen && idBilling) {
      fetchAllData();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, idBilling, fetchAllData]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      {/* Dialog */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <TLoadingSpinner position={TLoadingSpinner.Position.CENTER} />
            </div>
          ) : !billing ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Bil tidak dijumpai</p>
              <TButton onClick={handleClose} color="light" className="mt-4">
                <X className="w-4 h-4 mr-2" /> Tutup
              </TButton>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Proses Bayaran Bil #{billing?.running_no}</h1>
                  <p className="mt-1 text-sm text-gray-500">Dicipta pada: {formatDate(billing?.created_at)}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
                <div className="p-6">
                  {/* Billing Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Maklumat Bil</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">No. Rujukan</dt>
                          <dd className="mt-1 text-sm text-gray-900">{billing.running_no}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tarikh Bil</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(billing.issued_at)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Kaedah Bayaran</dt>
                          <dd className="mt-1 text-sm text-gray-900">{billing.payment_method}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Nama Penerima</dt>
                          <dd className="mt-1 text-sm text-gray-900">{billing.recipient}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Jumlah Permohonan</dt>
                          <dd className="mt-1 text-sm text-green-600 font-bold">{formatCurrency(totalAccepted)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Butiran Pembayar</h3>
                    <div className="overflow-x-auto">
                      <FormC data={transactions}>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Bil</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Tarikh Bayaran</th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-48">No. Rujukan</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Jumlah (RM)</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                <TButton onClick={handleAddTransaction} color="primary" className="btn btn-sm m-auto">
                                  <PlusIcon className="w-5 h-5" />
                                </TButton>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction, index) => (
                              <RowTransaction 
                                key={index}
                                banks={banks} 
                                transactions={transactions} 
                                setTransactions={setTransactions} 
                                index={index} 
                                setIncomplete={setIncomplete}
                              />
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="4" className="text-right px-6 py-4 text-sm font-medium text-gray-900">Jumlah Bayaran</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                {formatCurrency(totalAmount)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </FormC>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Catatan / Ulasan</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Nyatakan sebarang catatan berkaitan pembayaran ini. Catatan ini akan direkodkan untuk rujukan masa hadapan.
                    </p>
                    
                    <div className="space-y-2">
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                          remarksError ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
                        }`}
                        rows={4}
                        placeholder="Contoh: Pembayaran telah disahkan melalui bank statement. Semua dokumen lengkap..."
                        maxLength={500}
                      />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          {remarksError && (
                            <p className="text-yellow-600 text-xs flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {remarksError}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {remarks.length}/500 aksara
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <TButton onClick={handleClose} isDisable={processing} color="light">
                  Tutup
                </TButton>
                <TButton onClick={handleApprove} isDisable={processing || incomplete} color="green">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Diluluskan 
                  {processing && <TSpinner className="-mr-1 ml-2" />}
                </TButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Transaction Row Component
const RowTransaction = ({ banks, transactions, setTransactions, index, setIncomplete }) => {
  const [errors, setErrors] = useState({
    bank: '',
    amount: '',
    paid_date: '',
    paid_ref: '',
  });

  const [preTransactions, setPreTransactions] = useState(transactions[index]);

  const validateFields = () => {
    let newErrors = {};
    
    if (!preTransactions.bank_id) newErrors.bank = 'Bank diperlukan';
    if (!preTransactions.amount || parseFloat(preTransactions.amount) <= 0) newErrors.amount = 'Jumlah diperlukan';
    if (!preTransactions.paid_date) newErrors.paid_date = 'Tarikh diperlukan';
    if (!preTransactions.paid_ref) newErrors.paid_ref = 'No. Rujukan diperlukan';
    
    setErrors(newErrors);
    setIncomplete(Object.keys(newErrors).length > 0);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateFields();
  }, [preTransactions]);

  const handleRemoveTransaction = () => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const handleChangeBank = (e) => {
    const selectedBank = banks?.find((bank) => bank.id === parseInt(e.target.value));
    
    const bankIds = transactions.map(tx => parseInt(tx.bank_id));
    const hasDuplicates = bankIds.some((id, i) => id === parseInt(e.target.value) && i !== index);

    if (hasDuplicates) {
      setErrors(prev => ({
        ...prev, 
        bank: `Bank '${selectedBank?.bank_name}' sudah digunakan dalam transaksi lain`
      }));
      setIncomplete(true);
    } else {
      setTransactions((prev) => {
        const updatedTransactions = [...prev];
        updatedTransactions[index] = { 
          ...prev[index], 
          bank_id: e.target.value, 
          balance: selectedBank?.amount || 0 
        };
        return updatedTransactions;
      });
      setPreTransactions((prev) => ({
        ...prev, 
        bank_id: e.target.value, 
        balance: selectedBank?.amount || 0
      }));
    }
  };

  const handleChangeInput = (e, type) => {
    const value = type === 'amount' ? parseFloat(e.target.value) : e.target.value;
    setPreTransactions((prev) => ({...prev, [type]: value}));
    setTransactions((prev) => {
      const updatedTransactions = [...prev];
      updatedTransactions[index] = { ...prev[index], [type]: value };
      return updatedTransactions;
    });
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top">
        <div className="space-y-2">
          <FormC.select 
            keyval="id,bank_name" 
            listArr={banks} 
            option={{
              value: preTransactions.bank_id, 
              onChange: handleChangeBank, 
              required: true
            }} 
          />
          {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank}</p>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <FormC.date 
          value={preTransactions?.paid_date || ''} 
          onChange={(e) => handleChangeInput(e, 'paid_date')} 
        />
        {errors.paid_date && <p className="text-red-500 text-xs mt-1">{errors.paid_date}</p>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <FormC.text 
          value={preTransactions?.paid_ref || ''} 
          onChange={(e) => handleChangeInput(e, 'paid_ref')} 
        />
        {errors.paid_ref && <p className="text-red-500 text-xs mt-1">{errors.paid_ref}</p>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <div className="space-y-2">
          <FormC.currency 
            value={preTransactions?.amount || '0.00'} 
            onChange={(e) => handleChangeInput(e, 'amount')} 
            option={{required: true}} 
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right align-top">
        <TButton 
          onClick={handleRemoveTransaction} 
          color="danger" 
          className="btn btn-sm m-auto"
        >
          <X className="w-5 h-5" />
        </TButton>
      </td>
    </tr>
  );
};

export default BillingPaymentDialog;