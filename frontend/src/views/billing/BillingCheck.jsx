import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import PageComponent from "../../components/PageComponent";
import apiClient from "../../axios";
import BillingCheckBank from "./BillingCheckBank";
import TButton from "../../components/Core/TButton";
import TLoadingSpinner from "../../components/Core/TLoadingSpinner";
import BillingCheckBudget from "./BillingCheckBudget";
import { formatDate } from "../../config/format";
import BillingCheckInfo from "./BillingCheckInfo";

export default function BillingCheck() {
  const { idBilling } = useParams();
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [banks, setBanks] = useState([]);
  const [processing, setProcessing] = useState(false);

  const fetchBilling = async () => {
    try {
      const { data } = await apiClient.get(`/billings/${idBilling}`);
      setBilling(data);
    } catch (error) {
      console.error("Error fetching billing:", error);
      toast.error("Gagal memuat data bil");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBudgets = async () => {
    try {
      const { data } = await apiClient.get("/budgets");
      setBudgets(data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Gagal memuat data bajet");
    }
  };

  const fetchBanks = async () => {
    try {
      const data = await apiClient.get("/banks");
      setBanks(data);
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error("Gagal memuat data bank");
    }
  };
  
  useEffect(() => {
    fetchBilling();
    fetchBudgets();
    fetchBanks();
  }, [idBilling]);

  if (loading) {
    return (<TLoadingSpinner position={TLoadingSpinner.Position.CENTER} />);
  }

  if (!billing) {
    return (
      <PageComponent>
        <div className="text-center py-12">
          <p className="text-gray-600">Bil tidak dijumpai</p>
          <TButton onClick={() => navigate("/billing/finance")} color="light" ><ChevronLeft className="w-4 h-4 mr-2" /> Kembali ke Senarai</TButton>
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
            <TButton onClick={() => window.print()} color="light" ><Printer className="w-4 h-4 mr-2" /> Cetak</TButton>
            <TButton onClick={() => navigate("/billing/finance")} color="primary-dark" ><ChevronLeft className="w-4 h-4 mr-2" /> Kembali</TButton>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 h-[calc(100vh-92px)] overflow-y-auto relative">
        <BillingCheckInfo billing={billing} />
        <BillingCheckBudget billing={billing} setBilling={setBilling} budgets={budgets} processing={processing} />
        <BillingCheckBank billing={billing} setBilling={setBilling} banks={banks} processing={processing} setProcessing={setProcessing} />
      </div>
    </div>
  );
}


// {
//   "id": 3,
//   "running_no": "INV008",
//   "no_project": "N/A",
//   "total_amount": "6.00",
//   "payment_method": "online",
//   "status_name": "Semakan Kewangan",
//   "department": "KEWANGAN & PERAKAUNAN",
//   "recipient": "Pejabat Tanah Langkawi",
//   "creator": {
//       "name": "NOORUL HUSNA BINTI HARUN",
//       "position": "EKSEKUTIF"
//   },
//   "created_at": "2025-05-13T03:38:41.000000Z",
//   "issued_at": "2025-05-13T00:00:00.000000Z",
//   "hod_approved_at": "2025-05-15T00:00:00.000000Z",
//   "reviewed_at": null,
//   "details": [
//       {
//           "description": "sadfsdf",
//           "budget_code": "2000/000",
//           "budget_id": 3,
//           "price": "3.00",
//           "quantity": 2,
//           "reference": null,
//           "total": "6.00",
//           "budget": {
//               "name": "ASET BUKAN SEMASA",
//               "code": "2000/000",
//               "balance": "1000.00"
//           }
//       }
//   ],
// }


// {
//   "id": 3,
//   "running_no": "INV008",
//   "no_project": "N/A",
//   "total_amount": "6.00",
//   "payment_method": "online",
//   "status_id": 3,
//   "status_name": "Semakan Kewangan",
//   "department": "KEWANGAN & PERAKAUNAN",
//   "recipient": "Pejabat Tanah Langkawi",
//   "creator": {
//       "id": 11,
//       "name": "NOORUL HUSNA BINTI HARUN",
//       "position": "EKSEKUTIF"
//   },
//   "created_at": "2025-05-13T03:38:41.000000Z",
//   "issued_at": "2025-05-13T00:00:00.000000Z",
//   "print_count": 0,
//   "last_printed_at": null,
//   "last_printed_by_name": null,
//   "hod_approved_at": "2025-05-15T00:00:00.000000Z",
//   "reviewed_at": null,
//   "verified_at": null,
//   "approved_at": null,
//   "paid_at": null,
//   "ceo_approved": false,
//   "details": [
//       {
//           "id": 19,
//           "description": "sadfsdf",
//           "budget_code": "2000/000",
//           "budget_id": 3,
//           "old_budget_id": 0,
//           "old_budget_code": null,
//           "price": "3.00",
//           "quantity": 2,
//           "reference": null,
//           "total": "6.00",
//           "budget": {
//               "id": 3,
//               "name": "ASET BUKAN SEMASA",
//               "code": "2000/000",
//               "balance": "1000.00"
//           }
//       }
//   ],
//   "transactions": []
// }