import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from "../../config/format";
import { useStateContext } from "../../contexts/ContextProvider";
import PageComponent from "../../components/PageComponent.jsx";
import apiClient from "../../utils/axios";
import BillingCheckBank from "./BillingCheckBank";
import TButton from "../../components/Core/TButton";
import TLoadingSpinner from "../../components/Core/TLoadingSpinner";
import BillingCheckBudget from "./BillingCheckBudget";
import BillingCheckInfo from "./BillingCheckInfo";
import TAlertIcon from "../../components/Core/TAlertIcon";

export default function BillingCheck() {
  const { idBilling } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useStateContext();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [banks, setBanks] = useState([]);
  const [processing, setProcessing] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      const departmentId = currentUser?.department_id;
      const [billingRes, budgetsRes, banksRes] = await Promise.all([
        apiClient.post(`/status-validation/validate`,{billing_id: idBilling, status: 3, action:'process'}),
        // apiClient.get("/budgets?pagination_no=100"), // Get more budgets for selection
        apiClient.get(`/budgets/bydepartment/${departmentId}`), // Get budgets by department
        apiClient.get("/banks")
      ]);
      setBilling(billingRes.data);
      
      // Handle budget response format
      if (budgetsRes.data.success) {
        setBudgets(budgetsRes.data.data || []);
      } else {
        // Fallback for old API format
        setBudgets(budgetsRes.data.data || budgetsRes.data || []);
      }
      
      setBanks(banksRes);
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
    }
  }, [idBilling, navigate]);

  // Handle successful completion with real-time refresh
  const handleProcessComplete = useCallback(async (action, message) => {
    // Invalidate and refetch user data to update dashboard
    await queryClient.invalidateQueries({
      queryKey: ['userData', currentUser?.id]
    });
    
    // Show success message
    toast.success(message);  
    // Navigate back to finance page
    navigate("/finance");
  }, [queryClient, currentUser?.id, navigate]);
  
  useEffect(() => {
    fetchAllData();
  }, []);

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
            <h1 className="text-2xl font-bold text-gray-900">Semakan Bil #{billing.running_no}</h1>
            <p className="mt-1 text-sm text-gray-500">Dicipta pada: {formatDate(billing.created_at)}</p>
          </div>
          <div className="flex space-x-3">
            <TButton onClick={() => navigate("/finance")} color="light" ><ChevronLeft className="w-4 h-4 mr-2" /> Kembali</TButton>
          </div>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
        <div className="flex items-center">
          <div className="flex-shrink-0"><TAlertIcon /></div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Sila semak butiran bil di bawah</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Pastikan semua maklumat adalah betul sebelum meluluskan bil ini.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 h-[calc(100vh-298px)] overflow-y-auto">
        <BillingCheckInfo billing={billing} />
        <BillingCheckBudget billing={billing} setBilling={setBilling} budgets={budgets} processing={processing} />
        <BillingCheckBank 
          billing={billing} 
          setBilling={setBilling} 
          banks={banks} 
          processing={processing} 
          setProcessing={setProcessing}
          onProcessComplete={handleProcessComplete}
        />
      </div>
    </div>
  );
}