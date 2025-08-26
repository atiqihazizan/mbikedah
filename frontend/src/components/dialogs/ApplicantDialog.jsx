import { useEffect, useState, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { formatCurrency } from "../../config/format";
import Pulse from "../Core/Pulse";
import TButton from "../Core/TButton";
import RecipientDialog from "./RecipientDialog";
import apiClient from "../../utils/axios";
import ApplicantViewMode from "./ApplicantViewMode";
import ApplicantEditMode from "./ApplicantEditMode";

// Import TanStack Query hook
import { useBillingForm } from '../../hooks/useBillingForm';

export default function BillingFormDialog({ show, onClose, onSaved, billingId = null, mode = "create" }) {
  // TanStack Query hook untuk handle save operations
  const { saveForm: saveFormMutation, loading: mutationLoading, error: mutationError, setError } = useBillingForm();

  const { currentUser } = useStateContext();
  const [localLoading, setLocalLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [showRecipientDialog, setShowRecipientDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Combine both loading states
  const loading = mutationLoading || localLoading;
  const error = mutationError;

  const getPaymentDueDate = (issuedDate) => {
    const date = new Date(issuedDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  };

  const defaultDetail = useMemo(() => {
    return {
      budget_id: "",
      budget_code: "",
      description: "",
      reference: "",
      quantity: "0",
      price: "0.00",
      total: "0.00",
      unit: "",
      purpose: ""
    }
  }, []);

  const defaultPetition = useMemo(() => {
    return {
      issued_at: new Date().toISOString().slice(0, 10),
      no_project: "N/A",
      recipient_id: "",
      description: "",
      total_amount: "0.00",
      payment_method: "online",
      department_id: currentUser?.is_admin ? '0' : (currentUser?.department_id || '0'),
      running_no: "",
      payment_due: getPaymentDueDate(new Date()),
      status_id: 1,
      created_by: "",
      details: [defaultDetail],
    };
  }, [currentUser, defaultDetail]);

  const [petition, setPetition] = useState(defaultPetition);

  const handleAddRecipient = () => {
    setSelectedRecipient(null);
    setShowRecipientDialog(true);
  };

  const handleEditRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    setShowRecipientDialog(true);
  };

  const handleSaveRecipient = async (recipientData) => {
    try {
      // const url = selectedRecipient ? `/billing-recipients/${selectedRecipient.id}` : '/billing-recipients';
      // const method = selectedRecipient ? 'put' : 'post';

      // await apiClient[method](url, recipientData);
      
      toast.success(selectedRecipient ? 'Penerima berjaya dikemaskini' : 'Penerima baru berjaya ditambah');
      
      await fetchRecipients();
      // setShowRecipientDialog(false);
      
    } catch (error) {
      console.error('Ralat semasa simpan penerima:', error);
      toast.error(error.message || 'Ralat semasa menyimpan penerima. Sila cuba lagi.');
    }
  };

  const fetchRecipients = async () => {
    try {
      const {data:recipientsResponse} = await apiClient.get("/billing-recipients");
      if (recipientsResponse) setRecipients(recipientsResponse);
    } catch (error) {
      console.error('Ralat semasa mendapatkan penerima:', error);
      toast.error(error.message || 'Ralat mendapatkan penerima. Sila cuba sebentar lagi.');
    }
  };

  const checkValid = () => (
    petition?.recipient_id !== "" && 
    parseFloat(petition?.total_amount || 0) !== 0 && 
    (petition?.details || []).length !== 0
  );

  // Updated save functions menggunakan TanStack Query mutation
  const saveDraft = async () => {
    const result = await saveFormMutation(petition, billingId, 1);
    if (result.success && onSaved) onSaved(result.data);
  };

  const submitToHOD = async () => {
    const result = await saveFormMutation(petition, billingId, 2);
    if (result.success) {
      if (onSaved) onSaved(result.data);
      onClose(); // Close dialog selepas submit
    }
  };

  const handleClose = () => {
    setPetition(defaultPetition);
    setError(null);
    onClose();
  };

  function onSubmit(ev) {ev.preventDefault();}

  // Load initial data when dialog opens
  useEffect(() => {
    if (!show) return;

    let isSubscribed = true;

    const loadInitialData = async () => {
      if (!isSubscribed) return;
      setLocalLoading(true);
      
      try {
        const {data:budgetResponse} = await apiClient.get(`/budgets/application/${currentUser?.department_id}`); // Get budgets by department
        if (budgetResponse.success) {
          setBudgets(budgetResponse.data || []);
        } else {
          // Fallback for old API format
          setBudgets(budgetResponse.data || budgetResponse || []);
        }
        await fetchRecipients();
      } catch (error) {
        console.error('Ralat mendapatkan data:', error);
        toast.error(error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.');
      } finally {
        setLocalLoading(false);
      }
    };

    loadInitialData();

    return () => {isSubscribed = false;};
  }, [show]);

  // Load billing data for edit mode
  useEffect(() => {
    if (!show || !billingId) {
      setPetition(defaultPetition);
      return;
    }

    const initBilling = async () => {
      try {
        setLocalLoading(true);
        const {data} = await apiClient.get(`/billings/${billingId}`);
        if (data) {
          setPetition({
            ...data,
            issued_at: data.issued_at?.slice(0, 10),
            payment_due: data.payment_due?.slice(0, 10)
          });
        }
      } catch (error) {
        console.error('Ralat mendapatkan data billing:', error);
        toast.error('Ralat mendapatkan data permohonan.');
      } finally {
        setLocalLoading(false);
      }
    };

    initBilling();
  }, [show, billingId, defaultPetition]);

  const canEdit = [1, 9].includes(petition.status_id) && !isViewMode;

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClose}></div>
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="inline-block w-full max-w-7xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isCreateMode ? "Permohonan Bayaran Baru" : isEditMode ? "Kemaskini Permohonan" : "Lihat Permohonan"}
                </h3>
                {petition.running_no && <p className="text-sm text-gray-500 mt-1">No. Rujukan: {petition.running_no}</p>}
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              {loading && <Pulse />}
              {!loading && (
                <>
                  {isViewMode ? (
                    <ApplicantViewMode 
                      petition={petition}
                      currentUser={currentUser}
                    />
                  ) : (
                    <ApplicantEditMode 
                      petition={petition}
                      setPetition={setPetition}
                      recipients={recipients}
                      budgets={budgets}
                      error={error}
                      canEdit={canEdit}
                      defaultDetail={defaultDetail}
                      getPaymentDueDate={getPaymentDueDate}
                      handleAddRecipient={handleAddRecipient}
                      handleEditRecipient={handleEditRecipient}
                    />
                  )}
                </>
              )}
            </div>

            {/* Footer with Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                {petition.total_amount && parseFloat(petition.total_amount) > 0 && (
                  <span>
                    Jumlah: <span className="font-semibold text-gray-900">{formatCurrency(petition.total_amount)}</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {isViewMode ? (
                  // View Mode - Only Close Button
                  <TButton color="primary" onClick={handleClose}>Tutup</TButton>
                ) : (
                  // Edit/Create Mode - Full Action Buttons
                  <>
                    <TButton color="light" onClick={handleClose}>Batal</TButton>

                    {canEdit && (
                      <>
                        <TButton color="light" onClick={saveDraft} onChecking={loading}>Simpan Draf</TButton>
                        <TButton color="primary" onClick={submitToHOD} isDisable={!checkValid()} onChecking={loading}>Hantar ke Ketua Jabatan</TButton>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Modal */}
      <RecipientDialog show={showRecipientDialog} onClose={() => setShowRecipientDialog(false)} onSaved={handleSaveRecipient} recipient={selectedRecipient}/>
    </>
  );
}