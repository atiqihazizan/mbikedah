import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaPlus, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import Pulse from "../../components/Core/Pulse";
import Card from "../../components/Card";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import PageComponent from "../../components/PageComponent";
import RecipientModal from "./RecipientModal"; // Modified import statement
import apiClient from "../../axios";
import Select from "react-select";
import BillingFormDetailsRows from "./BillingFormDetailsRows";
import { formatCurrency } from "../../config/format";

export default function BillingForm() {
  const navigate = useNavigate();
  const { idform } = useParams();
  const { currentUser } = useStateContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  
  const flagNew = idform == undefined ? true : false;

  const getPaymentDueDate = (issuedDate) => {
    const date = new Date(issuedDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  };
  const defaultDetail = {
    budget_id: "",           // ID bajet
    budget_code: "",         // Kod bajet
    description: "",         // Keterangan
    reference: "",          // No rujukan
    quantity: "0",          // Kuantiti (string untuk elak null)
    price: "0.00",          // Harga seunit
    total: "0.00",         // Jumlah (quantity * price)
    unit: "",                // Unit ukuran
    purpose: ""     
  }
  const defaultPetition = {
    issued_at: new Date().toISOString().slice(0, 10),    // Tarikh bil
    no_project: "N/A",                                    // No projek
    recipient_id: "",                                    // ID penerima
    description: "",                                     // Keterangan bayaran
    total_amount: "0.00",                                // Jumlah bayaran
    payment_method: "online",                            // Kaedah pembayaran (default: online)
    department_id: currentUser?.is_admin ? '0' : (currentUser?.department_id || '0'),  // ID jabatan berdasarkan user
    running_no: "",                                     // No rujukan bil
    payment_due: getPaymentDueDate(new Date()),         // Tarikh perlu dibayar (30 hari dari issued_at)
    status_id: 1,                                       // Status bil (default: draft)
    created_by: "",                                     // ID pengguna
    details: [defaultDetail],                                          // Senarai item bayaran
  };

  const [petition, setPetition] = useState(defaultPetition);

  const handleAddRecipient = () => {
    setSelectedRecipient(null);
    setShowRecipientModal(true);
  };

  const handleEditRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    setShowRecipientModal(true);
  };

  const handleSaveRecipient = async (recipientData) => {
    try {
      const url = selectedRecipient 
        ? `/billing-recipients/${selectedRecipient.id}`
        : '/billing-recipients';
      
      const method = selectedRecipient ? 'put' : 'post';

      await apiClient[method](url, recipientData);
      
      toast.success(selectedRecipient ? 'Penerima berjaya dikemaskini' : 'Penerima baru berjaya ditambah');
      
      await fetchRecipients();
      setShowRecipientModal(false);
      
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

  const checkValid = () => (petition?.recipient_id !== "" && parseFloat(petition?.total_amount || 0) !== 0 && (petition?.details || []).length !== 0);

  const saveForm = async (statusId, successMessage) => {
    setError(null);
    toast.dismiss();
    
    try {
      
      if (statusId !== 1) { // If not saving as draft, show loading and validate
        setLoading(true);
        if (!checkValid()) {
          setLoading(false);
          throw new Error("Sila lengkapkan semua maklumat yang diperlukan");
        }
      }

      const url = !idform ? "/billings" : `/billings/${idform}`;
      const method = !idform ? "post" : "put";
      const formData = {...petition, status_id: statusId};
      const {data} = await apiClient[method](url, formData);
      const newId = data?.id || idform;
      
      if (successMessage) {toast.success(successMessage)}
      
      if (statusId === 1 && flagNew) {
        navigate(`/billing/${newId}/edit`);
      } else if (statusId === 2) {
        navigate(`/billing/incomplete`, { replace: true });
      }
      
      return { success: true, data };
    } catch (error) {
      
      if(error?.response?.status === 403) {
        toast.error("Anda tidak mempunyai kebenaran untuk menghantar permohonan ini");
      } else if(error?.response?.status === 422) {
        const {data} = error?.response || {};
        setError(data?.errors);
      } else {
        if(error?.response?.data?.message) console.error(error?.response?.data?.message);
        toast.error(error.message || `Ralat semasa ${statusId === 1 ? 'menyimpan draf' : 'menghantar permohonan'}. Sila cuba lagi.`);
      }
      
      return { success: false, error };
    } finally {
      if (statusId !== 1) {setLoading(false)}
    }
  };
  
  const saveDraft = () => saveForm(1, "Permohonan berjaya disimpan sebagai draf");
  const submitToHOD = () => saveForm(2, "Permohonan berjaya dihantar kepada ketua jabatan");

  function onSubmit(ev) {ev.preventDefault()}

  useEffect(() => {
    let isSubscribed = true;

    const loadInitialData = async () => {
      if (!isSubscribed) return;
      setLoading(true);
      
      try {
        const {data:budgetResponse} = await apiClient.get("/budgets");
        if (budgetResponse) {setBudgets(budgetResponse)}
        await fetchRecipients();
      } catch (error) {
        console.error('Ralat mendapatkan data:', error);
        toast.error(error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    return () => {isSubscribed = false};
  }, []);

  // useEffect(() => {
  //   setPetition({...petition,department_id: currentUser?.is_admin ? '0' : (currentUser?.department_id || '0')});
  // }, [currentUser]);

  useEffect(() => {
    const initBilling = async () => {
      if (idform) {
        const {data} = await apiClient.get(`/billings/${idform}`);
        if (data) setPetition({...data,issued_at: data.issued_at?.slice(0, 10),payment_due: data.payment_due?.slice(0, 10)})
      } 
      else setPetition(defaultPetition);
    };

    initBilling();
  }, [idform]);

  const canEdit = [1,9].includes(petition.status_id);

  return (
    <PageComponent
      title={flagNew ? "Permohonan Bayaran" : "Kemaskini Permohonan"}
      buttons={!loading && (
        <div className="flex gap-2">
          {!flagNew && (<TButton color="light" to={'/billing/incomplete'}>Kembali</TButton>)}
          {canEdit && (
            <>
              <TButton color="light" onClick={saveDraft}>Simpan sebagai Draf</TButton>
              <TButton color="green" onClick={submitToHOD}>Hantar ke Ketua Jabatan</TButton>
            </>
          )}
        </div>
      )}
    >
      <div className="container-fixed py-5">
        <div className="grid gap-5 lg:gap-7.5 gow">
          {loading && <Pulse />}
          {!loading && (
            <Card>
              <form className="" onSubmit={(ev) => onSubmit(ev)}>
                <Card.Body oClass="flex flex-col gap-7.5">
                  <FormC data={petition} setValue={setPetition} error={error} disabled={!canEdit}>
                    <div className="grid gap-7 ">
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
                      <div className="flex items-center gap-2">
                        <div className="flex-grow">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <FormC.label text="Individu/Syarikat" />
                            <div className="flex flex-col w-full">
                              <Select
                                isDisabled={!canEdit}
                                value={recipients.find(rec => rec.id === parseInt(petition.recipient_id)) || null}
                                onChange={(selectedOption) => {setPetition(prev => ({...prev,recipient_id: selectedOption ? selectedOption.id : ""}));}}
                                options={recipients}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.id.toString()}
                                placeholder="Pilih Penerima"
                                className="react-select-container"
                                classNamePrefix="react-select"
                              />
                              {error?.recipient_id && (<span className="text-xs mt-2 text-red-600">{error.recipient_id}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {canEdit && (
                            <>
                              <TButton color="light" onClick={handleAddRecipient} className="p-2" title="Tambah Penerima Baru"><FaPlus className="w-4 h-4" /></TButton>
                              {petition.recipient_id && (
                                <TButton color="light" onClick={() => {
                                    const recipient = recipients.find(r => r.id === parseInt(petition.recipient_id));
                                    if (recipient) handleEditRecipient(recipient);
                                  }} className="p-2" title="Kemaskini Penerima">
                                  <FaEdit className="w-4 h-4" />
                                </TButton>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <RecipientModal show={showRecipientModal} onClose={() => setShowRecipientModal(false)} onSaved={handleSaveRecipient} recipient={selectedRecipient}/>
                    </div>
                    <div className="grid gap-7 mx-[-30px]">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="text-start !pl-7 !pr-2">Perkara</th>
                            <th className="text-center !px-2">Rujukan (Jika ada)</th>
                            <th className="text-center !px-2">Kuantiti</th>
                            <th className="text-end !px-2">Harga</th>
                            <th className="text-end !px-2 text-right">Amaunt</th>
                            <th className="text-start !px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(petition?.details || []).map((d, i) => (
                            <BillingFormDetailsRows 
                              key={i} 
                              FormC={FormC} 
                              data={d} 
                              def = {defaultDetail}
                              idx={i} 
                              setChange={setPetition} 
                              budgets={budgets} 
                              error={error} 
                              dataLen={petition?.details?.length-1}
                            />
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="text-right font-bold">Jumlah</td>
                            <td className="text-right font-bold !px-2">{formatCurrency(petition?.total_amount || '0.00')}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                      <span className="text-xs px-6 mt-2 text-red-600">{error?.details}</span>
                    </div>

                  </FormC>
                </Card.Body>
              </form>
            </Card>
          )}
        </div>
      </div>

      <RecipientModal show={showRecipientModal} onClose={() => setShowRecipientModal(false)} onSaved={handleSaveRecipient} recipient={selectedRecipient}/>
    </PageComponent>
  );
}
