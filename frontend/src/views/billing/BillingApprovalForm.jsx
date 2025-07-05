import { useEffect, useState } from "react";
import { AlertTriangle, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from '@tanstack/react-query';
import { useStateContext } from "../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import TSelect from "../../components/Core/TSelect";
import TInput from "../../components/Core/TInput";
import TButton from "../../components/Core/TButton";
import apiClient from "../../utils/axios";

const BillingApprovalForm = ({ billingData, onApprovalComplete }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useStateContext();
  const [formData, setFormData] = useState({
    approver_name: "",
    approved_date: "",
    remarks: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [approverList, setApproverList] = useState([]);
  const [ fetchingApprovers, setFetchingApprovers] = useState(true);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setFetchingApprovers(true);
        const response = await apiClient.get('/users/finance-approval');
        if (response.success) {
          setApproverList(response.data);
        }
      } catch (error) {
        toast.error("Ralat mengambil senarai pengesah");
        setApproverList([]);
      } finally {
        setFetchingApprovers(false);
      }
    };

    fetchApprovers();
  }, []);


  const validateForm = () => {
    const newErrors = {};

    if (!formData.approver_name) {
      newErrors.approver_name = "Sila pilih nama penyelaras";
    }

    if (!formData.approved_date) {
      newErrors.approved_date = "Sila masukkan tarikh kelulusan";
    }

    if (!formData.remarks || formData.remarks.trim().length === 0) {
      newErrors.remarks = "Sila masukkan ulasan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApproval = async () => {
    if (!validateForm()) {
      toast.error("Sila lengkapkan semua maklumat yang diperlukan");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        approved_by: formData.approver_name,
        approved_date: formData.approved_date,
        remarks: formData.remarks
      };

      const response = await apiClient.post(`/billings/${billingData.id}/finance-approve`, payload);

      if (response.data.success) {
        // Invalidate queries to refresh dashboard data
        await queryClient.invalidateQueries({
          queryKey: ['userData', currentUser?.id]
        });
        
        toast.success('Permohonan telah diluluskan');
        if (onApprovalComplete) {
          onApprovalComplete('approve', response.data);
        }
        navigate("/finance");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Ralat semasa memproses kelulusan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!formData.remarks || formData.remarks.trim().length === 0) {
      setErrors({ remarks: "Sila masukkan sebab penolakan" });
      toast.error("Sila masukkan sebab penolakan");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: formData.approver_name,
        remarks: formData.remarks
      };

      const response = await apiClient.post(`/billings/${billingData.id}/reject`, payload);

      if (response.data.success) {
        // Invalidate queries to refresh dashboard data
        await queryClient.invalidateQueries({
          queryKey: ['userData', currentUser?.id]
        });
        
        toast.success('Permohonan telah ditolak');
        if (onApprovalComplete) {
          onApprovalComplete('reject', response.data);
        }
        navigate("/finance");
      }
    } catch (error) {
      console.error("Error processing rejection:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Proses tidak berjaya");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Billing Info Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Maklumat Permohonan</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">No. Bil:</span>
              <span className="ml-2 font-medium">#{billingData?.running_no}</span>
            </div>
            <div>
              <span className="text-gray-500">Jumlah:</span>
              <span className="ml-2 font-medium">RM {parseFloat(billingData?.total_amount || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-gray-500">Jabatan:</span>
              <span className="ml-2 font-medium">{billingData?.department}</span>
            </div>
            <div>
              <span className="text-gray-500">Penerima:</span>
              <span className="ml-2 font-medium">{billingData?.recipient}</span>
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
            rows={4}
            error={errors}
            holder="Masukkan ulasan atau catatan berkaitan kelulusan ini..."
          />
          <p className="text-xs text-gray-500 mt-1">Nyatakan sebarang ulasan atau syarat kelulusan</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
        <TButton
          color="green"
          size="lg"
          onClick={handleApproval}
          onChecking={loading}
          isDisable={loading}
          className="flex-1 sm:flex-none"
        >
          <CheckCircle className="w-5 h-5 mr-2 ml-4" />
          Luluskan Permohonan
        </TButton>

        <TButton
          color="red"
          size="lg"
          onClick={handleReject}
          onChecking={loading}
          isDisable={loading}
          className="flex-1 sm:flex-none"
        >
          <XCircle className="w-5 h-5 mr-2 ml-4" />
          Tolak Permohonan
        </TButton>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Nota:</strong> Setelah kelulusan dibuat, status permohonan akan dikemaskini secara automatik.
          Permohonan yang diluluskan akan diteruskan ke peringkat seterusnya untuk pemprosesan bayaran.
        </p>
      </div>
    </>
  );
};

export default BillingApprovalForm;