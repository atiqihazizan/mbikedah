import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, ChevronLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDate } from "../../config/format";
import PageComponent from "../../components/PageComponent";
import TButton from "../../components/Core/TButton";
import BillingPrint from "./BillingPrint";
import TLoadingSpinner from "../../components/Core/TLoadingSpinner";
import BillingApprovalForm from "./BillingApprovalForm";
import apiClient from "../../utils/axios";

const BillingApproval = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const { idBilling } = useParams();

  const abortControllerRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    try {
      const {data} = await apiClient.post(`/status-validation/validate`, {
        billing_id: idBilling, 
        status: 5, 
        action:'process'
      });
      setBilling(data);
    } catch (error) {
      if (error.response) {
        console.error("Error fetching data:", error.response.data);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching data:", error);
        toast.error("Tiada maklumat untuk semakan");
      }
      navigate("/finance");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [idBilling]);

  const handleApprovalComplete = (action, responseData) => {
    setTimeout(() => {navigate("/finance")}, 1500);
  };
    
  useEffect(() => {
    fetchAllData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllData]); 


  if (loading) {
    return (
      <PageComponent title="Paparan Permohonan">
        <div className="flex items-center justify-center h-[calc(100vh-90px)]">
          <TLoadingSpinner position={TLoadingSpinner.Position.CENTER} />
        </div>
      </PageComponent>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengesahan Bil #{billing?.running_no}</h1>
            <p className="mt-1 text-sm text-gray-500">Dicipta pada: {formatDate(billing?.created_at)}</p>
          </div>
          <div className="flex space-x-3">
            <TButton onClick={() => printRef.current?.print()} color="light" ><Printer className="w-4 h-4 mr-2" /> Cetak</TButton>
            <TButton onClick={() => navigate("/finance")} color="light" ><ChevronLeft className="w-4 h-4 mr-2" /> Kembali</TButton>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center">
          <div className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"><AlertTriangle /></div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-900">Untuk mendapatkan pengesahan</h3>
            <div className="text-sm text-blue-700 mt-1">
              <strong>Cetak dokumen dahulu untuk tandatangan manual kemudian lengkapkan borang di bawah untuk proses bayaran.</strong>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-8 h-[calc(100vh-295px)] overflow-y-auto">
        {/* Billing Print Section */}
        <div className="mb-8">
          <BillingPrint ref={printRef} billingData={billing}/>
        </div>
        
        {/* Approval Form Section */}
        <BillingApprovalForm billingData={billing} onApprovalComplete={handleApprovalComplete}/>
      </div>
    </div>
  );
};

export default BillingApproval;