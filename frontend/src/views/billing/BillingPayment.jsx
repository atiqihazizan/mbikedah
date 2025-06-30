import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import { formatDate } from "../../config/format";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../utils/axios";
import TButton from "../../components/Core/TButton";
import TLoadingSpinner from "../../components/Core/TLoadingSpinner";
import BillingPaymentInfo from "./BillingPaymentInfo";
import BillingPaymentBank from "./BillingPaymentBank";

export default function BillingPayment() {
  const { idBilling } = useParams();
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState([]);

  const fetchAllData = useCallback(async () => {
    try {
      const [billingRes, banksRes] = await Promise.all([
        apiClient.post(`/status-validation/validate`,{billing_id: idBilling, status: 6, action:'process'}),
        apiClient.get("/banks")
      ]);
      setBilling(billingRes.data);
      setBanks(banksRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [idBilling]);
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (<TLoadingSpinner position={TLoadingSpinner.Position.CENTER} />);
  }

  if (!billing) {
    return (
      <PageComponent>
        <div className="text-center py-12">
          <p className="text-gray-600">Bil tidak dijumpai</p>
          <TButton onClick={() => navigate("/finance")} color="light" ><ChevronLeft className="w-4 h-4 mr-2" /> Kembali ke Senarai</TButton>
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
            <h1 className="text-2xl font-bold text-gray-900">Proses Bayaran Bil #{billing.running_no}</h1>
            <p className="mt-1 text-sm text-gray-500">Dicipta pada: {formatDate(billing.created_at)}</p>
          </div>
          <div className="flex space-x-3">
            <TButton onClick={() => navigate("/finance")} color="primary-dark" ><ChevronLeft className="w-4 h-4 mr-2" /> Kembali</TButton>
          </div>
        </div>
      </div>
      
      <div className="container h-[calc(100vh-90px)] overflow-y-auto">
        <BillingPaymentInfo billing={billing} />
        <BillingPaymentBank billing={billing} setBilling={setBilling} banks={banks} />
      </div>
    </div>
  );
}
