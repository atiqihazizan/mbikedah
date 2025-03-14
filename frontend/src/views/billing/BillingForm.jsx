import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import Pulse from "../../components/Core/Pulse";
import Card from "../../components/Card";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import PageComponent from "../../components/PageComponent";
import PropTypes from "prop-types";
import RowTR from "./RowTR";
import RecipientModal from "./RecipientModal";
import { FaPlus, FaEdit } from "react-icons/fa";
import apiClient from "../../axios";

export default function BillingForm() {
  const { idform } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useStateContext();
  const dataFetchedRef = useRef(false);
  
  const [state, setState] = useState({
    loading: false,
    error: null,
    successMessage: '',
    recipients: [],
    departments: [],
    budgets: [],
    showRecipientModal: false,
    selectedRecipient: null
  });

  const [petition, setPetition] = useState({
    issued_at: new Date().toISOString().slice(0, 10),
    no_project: "N/A",
    recipient_id: "",
    description: "",
    total_amount: "0.00",
    payment_method: "online",
    department_id: currentUser?.is_admin ? '0' : (currentUser?.department_id || '0'),
    running_no: "",
    payment_due: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
    status_id: 1,
    created_by: "",
    details: []
  });

  const handleSubmit = async (isDraft = false) => {
    setState(prev => ({ ...prev, loading: true, error: null, successMessage: '' }));
    
    try {
      if (!isDraft && !checkValid()) {
        throw new Error("Please complete all required fields");
      }

      const submitData = {
        ...petition,
        status_id: isDraft ? 1 : 2
      };

      const url = idform ? `/billings/${idform}` : "/billings";
      const { data } = await apiClient[idform ? 'put' : 'post'](url, submitData);

      setState(prev => ({
        ...prev,
        successMessage: isDraft ? 'Draft saved' : 'Submitted to HOD'
      }));

      navigate(isDraft ? `/billing/${data.id}/edit` : '/billing/incomplete');
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Submission failed'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAddRecipient = () => {
    setState(prev => ({ ...prev, selectedRecipient: null, showRecipientModal: true }));
  };

  const handleEditRecipient = (recipient) => {
    setState(prev => ({ ...prev, selectedRecipient: recipient, showRecipientModal: true }));
  };

  const apiCalls = useMemo(() => ({
    budgets: () => apiClient.get("/budgets"),
    departments: () => apiClient.get("/departments"),
    recipients: () => apiClient.get("/billing-recipients"),
    formData: () => idform ? apiClient.get(`/billings/${idform}`) : Promise.resolve({ data: null })
  }), [idform]);

  const loadData = useCallback(async () => {
    if (dataFetchedRef.current) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [budgets, departments, recipients, formData] = await Promise.all([
        apiCalls.budgets(),
        apiCalls.departments(),
        apiCalls.recipients(),
        apiCalls.formData()
      ]);
      
      setState(prev => ({
        ...prev,
        budgets: budgets.data,
        departments: departments.data,
        recipients: recipients.data,
        loading: false
      }));

      if (formData?.data) {
        setPetition({
          ...formData.data,
          issued_at: formData.data.issued_at?.slice(0, 10),
          payment_due: formData.data.payment_due?.slice(0, 10)
        });
      }
      
      dataFetchedRef.current = true;
    } catch (error) {
      setState(prev => ({
        ...prev, 
        error: error.message || 'Error loading data',
        loading: false
      }));
    }
  }, [apiCalls]);

  const fetchRecipients = useCallback(async () => {
    try {
      const { data } = await apiCalls.recipients();
      setState(prev => ({
        ...prev,
        recipients: data
      }));
      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error loading recipients'
      }));
      return [];
    }
  }, [apiCalls]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecipientSaved = async (success, message) => {
    setState(prev => ({
      ...prev,
      showRecipientModal: false,
      successMessage: success ? message : '',
      error: !success ? message : null
    }));
    
    if (success) {
      await fetchRecipients();
    }
  };

  const checkValid = () => {
    return (
      petition?.recipient_id !== "" &&
      petition?.description !== "" &&
      parseFloat(petition?.total_amount || 0) !== 0 &&
      (petition?.details || []).length !== 0
    );
  };

  const canEdit = petition.status_id === 1;

  return (
    <PageComponent
      title={idform ? "Kemaskini Permohonan" : "Permohonan Baru"}
      buttons={!state.loading && (
        <div className="flex gap-2">
          {(idform && petition) && (
            <TButton color="light" to={'/billing/incomplete'}>Kembali</TButton>
          )}
          {canEdit && (
            <>
              <TButton 
                color="light" 
                onClick={() => handleSubmit(true)}
                isDisable={state.loading || !checkValid()}
              >
                Simpan sebagai Draf
              </TButton>
              <TButton 
                color="green" 
                onClick={() => handleSubmit(false)}
                isDisable={state.loading || !checkValid() }
              >
                Hantar ke Ketua Jabatan
              </TButton>
            </>
          )}
        </div>
      )}
    >
      <div className="container-fixed py-5">
        <div className="grid gap-5 lg:gap-7.5 gow">
          {state.loading && <Pulse />}
          {!state.loading && (
            <Card>
              <form className="" onSubmit={(ev) => ev.preventDefault()}>
                <Card.Body oClass="flex flex-col gap-7.5">
                  {state.error && (
                    <div className="text-red-500 mb-4">
                      <strong>Terjadi masalah:</strong> {state.error}
                    </div>
                  )}
                  {state.successMessage && (
                    <div className="text-green-500 mb-4">
                      <strong>Berjaya:</strong> {state.successMessage}
                    </div>
                  )}
                  {!canEdit && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Bil ini tidak boleh dikemaskini kerana status bukan lagi dalam draft.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <FormC data={petition} setValue={setPetition} error={state.error} disabled={!canEdit}>
                    <div className="grid gap-7 ">
                      <FormC.LDate 
                        field={"issued_at"} 
                        text={"Tarikh Memohon"} 
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setPetition(prev => ({
                            ...prev,
                            issued_at: newDate,
                            payment_due: new Date(newDate).setDate(new Date(newDate).getDate() + 30).toISOString().slice(0, 10)
                          }));
                        }}
                        option={{ disabled: !canEdit }}
                      />
                      <FormC.LText field={"no_project"} text={"No Pesanan"} option={{ readOnly: !canEdit }} />
                      <FormC.LSelect 
                        text="Jabatan"
                        field={"department_id"}
                        keyval="id,name"
                        listArr={state.departments}
                        option={{ disabled: !canEdit }}
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex-grow">
                          <FormC.LSelect 
                            text="Individu/Syarikat"
                            field={"recipient_id"}
                            keyval="id,name"
                            listArr={state.recipients}
                            option={{ disabled: !canEdit }}
                          />
                        </div>
                        <div className="flex gap-1">
                          {canEdit && (
                            <>
                              <TButton 
                                color="light" 
                                onClick={handleAddRecipient}
                                className="p-2"
                                title="Tambah Penerima Baru"
                              >
                                <FaPlus className="w-4 h-4" />
                              </TButton>
                              {petition.recipient_id && (
                                <TButton 
                                  color="light" 
                                  onClick={() => {
                                    const recipient = state.recipients.find(r => r.id === parseInt(petition.recipient_id));
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
                      </div>
                      <FormC.LText field={"description"} text={"Keterangan Bayaran"} option={{ readOnly: !canEdit }} />

                      <RecipientModal 
                        show={state.showRecipientModal}
                        onClose={() => setState(prev => ({ ...prev, showRecipientModal: false }))}
                        onSaved={handleRecipientSaved}
                        recipient={state.selectedRecipient}
                      />
                      <FormC.LDate field={"payment_due"} text={"Bayaran Perlu Dibuat Pada"} option={{ disabled: !canEdit }} />
                      <FormC.LText
                        field={"total_amount"}
                        text={"Jumlah Bayaran"}
                        option={{ readOnly: true }}
                      />
                    </div>
                    <div className="grid gap-7 mx-[-30px]">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="text-start !pl-7 !pr-2">Bajet</th>
                            <th className="text-start !px-2 w-[30%]">Perkara</th>
                            <th className="text-start !px-2">Rujukan</th>
                            <th className="text-start !px-2">Kuantiti</th>
                            <th className="text-start !px-2">Unit</th>
                            <th className="text-start !px-2">Harga</th>
                            <th className="text-start !px-2">Jumlah</th>
                            <th className="text-start !px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(petition?.details || []).map((d, i) => (
                            <RowTR
                              key={i}
                              FormC={FormC}
                              data={d}
                              idx={i}
                              setChange={setPetition}
                              budgets={state.budgets}
                            />
                          ))}
                          {canEdit && (
                            <RowTR FormC={FormC} setChange={setPetition} budgets={state.budgets} />
                          )}
                        </tbody>
                      </table>
                    </div>
                  </FormC>
                </Card.Body>
              </form>
            </Card>
          )}
        </div>
      </div>

      <RecipientModal
        show={state.showRecipientModal}
        onClose={() => setState(prev => ({ ...prev, showRecipientModal: false }))}
        onSaved={handleRecipientSaved}
        recipient={state.selectedRecipient}
      />
    </PageComponent>
  );
}
BillingForm.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  onFocus: PropTypes.func,
  currChange: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
};
