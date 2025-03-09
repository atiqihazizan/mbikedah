import { useEffect, useState } from "react";
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

export default function PaymentsForm() {
  const { idform } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useStateContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  
  const flagNew = idform == undefined ? true : false;

  // Fungsi untuk dapatkan tarikh 30 hari dari tarikh yang diberi
  const getPaymentDueDate = (issuedDate) => {
    const date = new Date(issuedDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  };

  // Default values untuk petition
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
    details: []                                          // Senarai item bayaran
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
      
      setSuccessMessage(selectedRecipient 
        ? 'Penerima berjaya dikemaskini'
        : 'Penerima baru berjaya ditambah');
      
      await fetchRecipients();
      setShowRecipientModal(false);
      
    } catch (error) {
      console.error('Ralat semasa simpan penerima:', error);
      setError(error.message || 'Ralat semasa menyimpan penerima. Sila cuba lagi.');
    }
  };

  const fetchRecipients = async () => {
    try {
      const {data:recipientsResponse} = await apiClient.get("/billing-recipients");
      if (recipientsResponse) {
        setRecipients(recipientsResponse);
      }
    } catch (error) {
      console.error('Ralat semasa mendapatkan penerima:', error);
      setError(error.message || 'Ralat mendapatkan penerima. Sila cuba sebentar lagi.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Dapatkan senarai budget
      const {data:budgetResponse} = await apiClient.get("/budgets");
      if (budgetResponse) {
        setBudgets(budgetResponse);
      }
      // Dapatkan senarai jabatan
      const {data:departmentsResponse} = await apiClient.get("/departments");
      if (departmentsResponse) {
        setDepartments(departmentsResponse);
      }

      // Dapatkan senarai penerima bil
      await fetchRecipients();

      // Jika update, dapatkan data bil
      if (idform) {
        const {data:billingResponse} = await apiClient.get(`/billings/${idform}`);
        if (billingResponse) {
          // Format data untuk form
          setPetition({
            ...billingResponse,
            // Pastikan tarikh dalam format YYYY-MM-DD
            issued_at: billingResponse.issued_at?.slice(0, 10),
            payment_due: billingResponse.payment_due?.slice(0, 10)
          });
        }
      }
    } catch (error) {
      console.error('Ralat mendapatkan data:', error);
      setError(error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Function untuk semak form lengkap
  const checkValid = () => {
    return (
      petition?.recipient_id !== "" &&
      petition?.description !== "" &&
      parseFloat(petition?.total_amount || 0) !== 0 &&
      (petition?.details || []).length !== 0
    );
  };

  // Function untuk simpan sebagai draft
  const saveDraft = async () => {
    setError(null);
    setSuccessMessage("");
    setLoading(true);

    try {
      // URL dan method berdasarkan create/update
      const url = !idform ? "/billings" : `/billings/${idform}`;
      const method = !idform ? "post" : "put";

      // Set status sebagai draft
      const draftData = {
        ...petition,
        status_id: 1 // Draft status
      };

      // Hantar data ke backend
      const {data} = await apiClient[method](url, draftData);
      const newId = data?.id || idform;
      
      setSuccessMessage("Permohonan bayaran berjaya disimpan sebagai draf");

      if (!idform) {
        // Reset form ke default dan navigate ke ID baru
        setPetition({
          ...defaultPetition,
          issued_at: new Date().toISOString().slice(0, 10),
          payment_due: getPaymentDueDate(new Date())
        });
        navigate(`/billing/${newId}/edit`);
      }
    } catch (error) {
      console.error('Ralat semasa simpan draf:', error.message);
      setError(error.message || "Ralat semasa menyimpan draf. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Function untuk submit kepada ketua jabatan
  const submitToHOD = async () => {
    setError(null);
    setSuccessMessage("");
    setLoading(true);

    try {
      // Semak validation
      if (!checkValid()) {
        throw new Error("Sila lengkapkan semua maklumat yang diperlukan");
      }

      // URL dan method berdasarkan create/update
      const url = !idform ? "/billings" : `/billings/${idform}`;
      const method = !idform ? "post" : "put";

      // Set status untuk submit ke HOD
      const submitData = {
        ...petition,
        status_id: 2 // Status untuk HOD review
      };

      // Hantar data ke backend
      const {data} = await apiClient[method](url, submitData);
      const newId = data?.id || idform;
      
      setSuccessMessage("Permohonan bayaran berjaya dihantar kepada ketua jabatan");

      if (!idform) {
        // Reset form ke default
        setPetition({
          ...defaultPetition,
          issued_at: new Date().toISOString().slice(0, 10),
          payment_due: getPaymentDueDate(new Date())
        });
      }
      
      // Kembali ke halaman utama
      navigate(`/`);
      
    } catch (error) {
      console.error('Ralat semasa hantar ke HOD:', error);
      setError(error.message || "Ralat semasa menghantar permohonan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Function untuk handle form submit - prevent default sahaja
  function onSubmit(ev) {
    ev.preventDefault();
  }

  useEffect(() => {
    let isSubscribed = true;

    const loadInitialData = async () => {
      if (!isSubscribed) return;
      await fetchData();
    };

    loadInitialData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    setPetition({
      ...petition,
      department_id: currentUser?.is_admin ? '0' : (currentUser?.department_id || '0')
    });
  }, [currentUser]);

  return (
    <PageComponent
      title={flagNew ? "Permohonan Bayaran" : "Kemaskini Permohonan"}
      buttons={
        <div className="flex gap-2">
          {!flagNew && (
            <TButton color="light" to={'/payments/incomplete'}>Kembali</TButton>
          )}
          <TButton 
            color="light" 
            onClick={saveDraft}
            disabled={loading}
          >
            Simpan sebagai Draf
          </TButton>
          <TButton 
            color="green" 
            onClick={submitToHOD}
            disabled={loading || !checkValid()}
          >
            Hantar ke Ketua Jabatan
          </TButton>
        </div>
      }
    >
      <div className="container-fixed py-5">
        <div className="grid gap-5 lg:gap-7.5 gow">
          {loading && <Pulse />}
          {!loading && (
            <Card>
              <form className="" onSubmit={(ev) => onSubmit(ev)}>
                {/* <Card.Body oClass="flex flex-col divide-y devide-gray-200 gap-7.5"> */}
                <Card.Body oClass="flex flex-col gap-7.5">
                  {error && (
                    <div className="text-red-500 mb-4">
                      <strong>Terjadi masalah:</strong> {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="text-green-500 mb-4">
                      <strong>Berjaya:</strong> {successMessage}
                    </div>
                  )}
                  <FormC data={petition} setValue={setPetition} error={error}>
                    <div className="grid gap-7 ">
                      <FormC.LDate 
                        field={"issued_at"} 
                        text={"Tarikh Memohon"} 
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setPetition(prev => ({
                            ...prev,
                            issued_at: newDate,
                            payment_due: getPaymentDueDate(newDate)
                          }));
                        }}
                      />
                      <FormC.LText field={"no_project"} text={"No Pesanan"} />
                      <FormC.LSelect 
                        text="Jabatan"
                        field={"department_id"}
                        keyval="id,name"
                        listArr={departments}
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex-grow">
                          <FormC.LSelect 
                            text="Individu/Syarikat"
                            field={"recipient_id"}
                            keyval="id,name"
                            listArr={recipients}
                          />
                        </div>
                        <div className="flex gap-1">
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
                                const recipient = recipients.find(r => r.id === parseInt(petition.recipient_id));
                                if (recipient) handleEditRecipient(recipient);
                              }}
                              className="p-2"
                              title="Kemaskini Penerima"
                            >
                              <FaEdit className="w-4 h-4" />
                            </TButton>
                          )}
                        </div>
                      </div>
                      <FormC.LText field={"description"} text={"Keterangan Bayaran"} />

                      <RecipientModal 
                        show={showRecipientModal}
                        onClose={() => setShowRecipientModal(false)}
                        onSave={handleSaveRecipient}
                        recipient={selectedRecipient}
                      />
                      <FormC.LDate field={"payment_due"} text={"Bayaran Perlu Dibuat Pada"} />
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
                              budgets={budgets}
                            />
                          ))}
                          <RowTR FormC={FormC} setChange={setPetition} budgets={budgets} />
                        </tbody>
                      </table>
                    </div>


                  </FormC>
                  {/* Mesej kejayaan */}
                  {successMessage && (
                    <div className="text-green-500 mb-4">
                      {successMessage}
                    </div>
                  )}
                </Card.Body>
              </form>
            </Card>
          )}
        </div>
      </div>

      {/* Modal untuk tambah/edit penerima */}
      <RecipientModal
        show={showRecipientModal}
        onClose={() => setShowRecipientModal(false)}
        onSave={handleSaveRecipient}
        recipient={selectedRecipient}
      />
    </PageComponent>
  );
}
PaymentsForm.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  onFocus: PropTypes.func,
  currChange: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
};
