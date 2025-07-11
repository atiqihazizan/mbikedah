import { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, ChevronLeft, Printer, X, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from '@tanstack/react-query';
import { useStateContext } from "../../contexts/ContextProvider";
import { formatDate } from "../../config/format";
import TButton from "../Core/TButton";
import TSelect from "../Core/TSelect";
import TInput from "../Core/TInput";
import TLoadingSpinner from "../Core/TLoadingSpinner";
// import BillingPrint from "./BillingPrint";
import apiClient from "../../utils/axios";

const FinanceApprovalDialog = ({ isOpen, onClose, idBilling, onApprovalComplete, onPrint }) => {
  const queryClient = useQueryClient();
  const { currentUser } = useStateContext();
  const printRef = useRef(null);
  
  // Billing data states
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef(null);
  
  // Form states
  const [formData, setFormData] = useState({approver_name: "",approved_date: "",remarks: ""});
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [approverList, setApproverList] = useState([]);

  // Fetch billing data
  const fetchAllData = useCallback(async () => {
    if (!idBilling || !isOpen) return;
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    try {
      const {data} = await apiClient.post(`/status-validation/validate`, {billing_id: idBilling, status: 5, action:'process'});
      setBilling(data);
    } catch (error) {
      if (error.response) {
        console.error("Error fetching data:", error.response.data);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching data:", error);
        toast.error("Tiada maklumat untuk semakan");
      }
      onClose();
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [idBilling, isOpen, onClose]);

  // Fetch approvers
  const fetchApprovers = useCallback(async () => {
    if (!isOpen) return;
    
    try {
      const response = await apiClient.get('/users/finance-approval');
      if (response.success) {
        setApproverList(response.data);
      }
    } catch (error) {
      toast.error("Ralat mengambil senarai pengesah");
      setApproverList([]);
    }
  }, [isOpen]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.approver_name) newErrors.approver_name = "Sila pilih nama penyelaras";
    if (!formData.approved_date) newErrors.approved_date = "Sila masukkan tarikh kelulusan";
    // if (!formData.remarks || formData.remarks.trim().length === 0) newErrors.remarks = "Sila masukkan ulasan";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle approval
  const handleApproval = async () => {
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const payload = {
        approved_by: formData.approver_name,
        approved_date: formData.approved_date,
        remarks: formData.remarks
      };

      const response = await apiClient.post(`/billings/${billing.id}/finance-approve`, payload);

      if (response.success) {
        // Invalidate queries to refresh dashboard data
        await queryClient.invalidateQueries({queryKey: ['userData', currentUser?.id]});
        
        toast.success('Permohonan telah diluluskan');
        
        if (onApprovalComplete) onApprovalComplete('approve', response.data);
        
        // Reset form and close dialog
        setFormData({ approver_name: "", approved_date: "", remarks: ""});
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Ralat semasa memproses kelulusan");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle rejection
  const handleReject = async () => {
    if (!formData.remarks || formData.remarks.trim().length === 0) {
      setErrors({ remarks: "Sila masukkan sebab penolakan" });
      toast.error("Sila masukkan sebab penolakan");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        user_id: formData.approver_name,
        remarks: formData.remarks
      };

      const response = await apiClient.post(`/billings/${billing.id}/reject`, payload);

      if (response.success) {
        // Invalidate queries to refresh dashboard data
        await queryClient.invalidateQueries({queryKey: ['userData', currentUser?.id]});
        
        toast.success('Permohonan telah ditolak');
        
        if (onApprovalComplete) onApprovalComplete('reject', response.data);
        
        // Reset form and close dialog
        setFormData({approver_name: "",approved_date: "",remarks: ""});
        onClose();
      }
    } catch (error) {
      console.error("Error processing rejection:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Proses tidak berjaya");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Close dialog handler
  const handleClose = () => {
    // Reset form data when closing
    setFormData({approver_name: "",approved_date: "",remarks: ""});
    setErrors({});
    onClose();
  };

  // Effects
  useEffect(() => {
    if (isOpen && idBilling) {
      fetchAllData();
      fetchApprovers();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, idBilling, fetchAllData, fetchApprovers]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      {/* Dialog */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <TLoadingSpinner position={TLoadingSpinner.Position.CENTER} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pengesahan Bil #{billing?.running_no}</h1>
                  <p className="mt-1 text-sm text-gray-500">Dicipta pada: {formatDate(billing?.created_at)}</p>
                </div>
                <div className="flex space-x-3">
                  <TButton onClick={() => onPrint()} color="light" size="sm">
                    <Printer className="w-4 h-4 mr-2" /> Cetak
                  </TButton>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Info Banner */}
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center">
                  <div className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
                    <AlertTriangle />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-blue-900">Untuk mendapatkan pengesahan</h3>
                    <div className="text-sm text-blue-700">
                      <strong>Cetak dokumen dahulu untuk tandatangan manual kemudian lengkapkan borang di bawah untuk proses bayaran.</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
            <div className="p-6 max-h-[calc(90vh-400px)] overflow-y-auto">
              {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Borang Pengesahan</h3> */}
              
              {/* <BillingPrint ref={printRef} billingData={billing}/> */}
              <div className="space-y-6">
                {/* Billing Info Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Maklumat Permohonan</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">No. Bil:</span>
                        <span className="font-medium">#{billing?.running_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Jumlah:</span>
                        <span className="font-medium">RM {parseFloat(billing?.total_amount || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Jabatan:</span>
                        <span className="font-medium">{billing?.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Penerima:</span>
                        <span className="font-medium">{billing?.recipient}</span>
                      </div>
                    </div>
                  </div>

                  {/* Approver Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Penyelaras <span className="text-red-500">*</span>
                    </label>
                    <TSelect
                      field="approver_name"
                      setValue={setFormData}
                      data={formData}
                      list={approverList}
                      keyval="id,name,position"
                      maxLength={null}
                      error={errors}
                      placeholder="-- Pilih Penyelaras --"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Pilih nama pegawai yang memberikan kelulusan</p>
                  </div>

                  {/* Approval Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarikh Kelulusan <span className="text-red-500">*</span>
                    </label>
                    <TInput
                      field="approved_date"
                      setValue={setFormData}
                      data={formData}
                      type="date"
                      error={errors}
                      holder="Pilih tarikh kelulusan"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tarikh kelulusan diberikan</p>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ulasan / Catatan <span className="text-red-500">*</span>
                    </label>
                    <TInput
                      field="remarks"
                      setValue={setFormData}
                      data={formData}
                      multiline={true}
                      rows={3}
                      error={errors}
                      holder="Masukkan ulasan atau catatan berkaitan kelulusan ini..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Nyatakan sebarang ulasan atau syarat kelulusan</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                  <TButton color="red" size="lg" onClick={handleReject} onChecking={formLoading} isDisable={formLoading} className="w-full">
                    <XCircle className="w-5 h-5 mx-2" />
                    Tolak Permohonan
                  </TButton>
                  <TButton color="green" size="lg" onClick={handleApproval} onChecking={formLoading} isDisable={formLoading} className="w-full">
                    <CheckCircle className="w-5 h-5 mx-2" />
                    Luluskan Permohonan
                  </TButton>
                </div>

                {/* Additional Info */}
                {/* <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Nota:</strong> Setelah kelulusan dibuat, status permohonan akan dikemaskini secara automatik.
                    Permohonan yang diluluskan akan diteruskan ke peringkat seterusnya untuk pemprosesan bayaran.
                  </p>
                </div> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceApprovalDialog;