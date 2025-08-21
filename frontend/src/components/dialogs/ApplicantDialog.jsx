import { useEffect, useState, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaPlus, FaEdit, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { formatCurrency } from "../../config/format";
import Pulse from "../Core/Pulse";
import FormC from "../FormContext";
import TButton from "../Core/TButton";
import RecipientDialog from "./RecipientDialog";
import BillingHistory from "../../views/billing/BillingHistory"; // Import component baru
import apiClient from "../../utils/axios";
import Select from "react-select";
import ApplicantDetailsRows from "./ApplicantDetailsRows";

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
      const url = selectedRecipient ? `/billing-recipients/${selectedRecipient.id}` : '/billing-recipients';
      const method = selectedRecipient ? 'put' : 'post';

      await apiClient[method](url, recipientData);
      
      toast.success(selectedRecipient ? 'Penerima berjaya dikemaskini' : 'Penerima baru berjaya ditambah');
      
      await fetchRecipients();
      setShowRecipientDialog(false);
      
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
        const {data:budgetResponse} = await apiClient.get(`/budgets/bydepartment/${currentUser?.department_id}`); // Get budgets by department
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
                    // View Mode - Read Only Display
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Maklumat Permohonan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Rujukan</label>
                            <p className="text-sm text-gray-900 font-semibold">{petition.running_no || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                              petition.status_name === 'Semakan Kewangan' ? 'bg-blue-100 text-blue-800' :
                              petition.status_name === 'Permohonan Dibayar' ? 'bg-green-100 text-green-800' :
                              petition.status_name === 'Draf' ? 'bg-gray-100 text-gray-800' :
                              petition.status_name === 'Menunggu Kelulusan' ? 'bg-yellow-100 text-yellow-800' :
                              petition.status_name === 'Ditolak' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {petition.status_name || 'Tidak Diketahui'}
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Memohon</label>
                            <p className="text-sm text-gray-900">{petition.issued_at ? new Date(petition.issued_at).toLocaleDateString('ms-MY') : '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No Pesanan</label>
                            <p className="text-sm text-gray-900">{petition.no_project || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                            <p className="text-sm text-gray-900">{petition.department || '-'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Penerima</label>
                            <p className="text-sm text-gray-900">{petition.recipient || '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Creator Information */}
                      {petition.creator && (
                        <div className="bg-blue-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Maklumat Pemohon</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                              <p className="text-sm text-gray-900">{petition.creator.name}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Jawatan</label>
                              <p className="text-sm text-gray-900">{petition.creator.position || '-'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Cipta</label>
                              <p className="text-sm text-gray-900">{new Date(petition.created_at).toLocaleDateString('ms-MY', { 
                                day: 'numeric', month: 'long', year: 'numeric', 
                                hour: '2-digit', minute: '2-digit' 
                              })}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Details Table */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Butiran Permohonan</h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kod Bajet</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama Bajet</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Perkara</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kuantiti</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Harga</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {(petition?.details || []).map((detail, i) => (
                                <tr key={i}>
                                  <td className="px-4 py-3 text-sm text-gray-900">{detail.budget_code}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{detail.budget_name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{detail.description}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-center">{detail.quantity}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(detail.price)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(detail.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr>
                                <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-900">Jumlah Keseluruhan</td>
                                <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">{formatCurrency(petition?.total_amount || '0.00')}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Enhanced History using new BillingHistory component */}
                      {petition.history && petition.history.length > 0 && (
                        <BillingHistory history={petition.history}currentUser={currentUser}billing={petition}compact={false}/>
                      )}

                    </div>
                  ) : (
                    // Edit/Create Mode - Form Display
                    <form onSubmit={onSubmit}>
                      <FormC data={petition} setValue={setPetition} error={error} disabled={!canEdit}>
                        <div className="grid gap-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormC.LDate 
                              field={"issued_at"} 
                              text={"Tarikh Memohon"} 
                              onChange={(e) => {
                                const newDate = e.target.value;
                                setPetition(prev => ({...prev,issued_at: newDate,payment_due: getPaymentDueDate(newDate)}));
                              }}
                              option={{ disabled: !canEdit }}
                            />
                            <FormC.LText field={"no_project"} text={"No Pesanan"} option={{ readOnly: !canEdit }} />
                          </div>

                          <div className="flex items-center gap-2">
                            <FormC.label text="Individu/Syarikat" />
                            <div className="flex flex-col w-full">
                              <div className="flex flex-row gap-2.5">
                                <Select
                                  isDisabled={!canEdit}
                                  value={recipients.find(rec => rec.id === parseInt(petition.recipient_id)) || null}
                                  onChange={(selectedOption) => setPetition(prev => ({...prev, recipient_id: selectedOption ? selectedOption.id : ""}))}
                                  options={recipients}
                                  getOptionLabel={(option) => option.name}
                                  getOptionValue={(option) => option.id.toString()}
                                  placeholder="Pilih Penerima"
                                  className="react-select-container w-full"
                                  classNamePrefix="react-select"
                                />
                                {canEdit && (
                                  <>
                                    <TButton color="light" onClick={handleAddRecipient} className="!py-1" title="Tambah Penerima Baru">
                                      <FaPlus className="w-4 h-4" />
                                    </TButton>
                                    {petition.recipient_id && (
                                      <TButton 
                                        color="light" 
                                        onClick={() => {
                                          const recipient = recipients.find(r => r.id === parseInt(petition.recipient_id));
                                          if (recipient) handleEditRecipient(recipient);
                                        }} 
                                        className="p-2" 
                                        title="Kemaskini Penerima"
                                      >
                                        <FaEdit className="w-4 h-4" />
                                      </TButton>
                                    )}
                                  </>
                                )}
                              </div>
                              {error?.recipient_id && (
                                <span className="text-xs mt-2 text-red-600">{error.recipient_id}</span>
                              )}
                            </div>
                          </div>

                          {/* Details Table */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left pl-4 py-3 text-xs font-medium text-gray-500 uppercase">Kod Bajet</th>
                                  <th className="text-left pl-4 py-3 text-xs font-medium text-gray-500 uppercase">Perkara</th>
                                  <th className="text-left pl-4 py-3 text-xs font-medium text-gray-500 uppercase">Rujukan</th>
                                  <th className="text-center pl-4 py-3 text-xs font-medium text-gray-500 uppercase">Kuantiti</th>
                                  <th className="text-right pl-4 py-3 text-xs font-medium text-gray-500 uppercase">Harga</th>
                                  <th className="text-right pl-4 py-3 text-xs font-medium text-gray-500 uppercase">Amaunt</th>
                                  <th className="pl-4 py-3"></th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {(petition?.details || []).map((d, i) => (
                                  <ApplicantDetailsRows key={i} FormC={FormC} data={d} def={defaultDetail}idx={i} setChange={setPetition} budgets={budgets} error={error} dataLen={petition?.details?.length-1}/>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-900">Jumlah</td>
                                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(petition?.total_amount || '0.00')}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                            {error?.details && (
                              <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                                <span className="text-xs text-red-600">{error?.details}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </FormC>
                    </form>
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