import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import Pulse from "../../components/Core/Pulse";
import Card from "../../components/Card";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import PageComponent from "../../components/PageComponent";
import PropTypes from "prop-types";
import apiClient from "../../axios";
import Select from "react-select";

export default function BillingPayment() {
  const navigate = useNavigate();
  const { idBilling:idform } = useParams();
  const { currentUser } = useStateContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billings, setBillings] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const flagNew = idform == undefined ? true : false;

  // Default values untuk payment
  const defaultPayment = {
    payment_date: new Date().toISOString().slice(0, 10),  // Tarikh pembayaran
    billing_id: "",                                      // ID bil yang dibayar
    bank_id: "",                                        // ID bank untuk pembayaran
    reference_no: "",                                  // No rujukan pembayaran
    amount: "0.00",                                    // Jumlah pembayaran
    description: "",                                   // Keterangan pembayaran
    proof_file: null,                                  // Fail bukti pembayaran
    status_id: 1,                                      // Status pembayaran (default: draft)
    created_by: currentUser?.id || "",                 // ID pengguna
  };

  const [payment, setPayment] = useState(defaultPayment);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPayment(prev => ({
        ...prev,
        proof_file: file
      }));
    }
  };

  const fetchBillings = async () => {
    try {
      const { data } = await apiClient.get(`/billings/${idform}`);
      setBillings(data);
    } catch (error) {
      console.error('Ralat semasa mendapatkan senarai bil:', error);
      toast.error(error.message || 'Ralat mendapatkan senarai bil. Sila cuba sebentar lagi.');
    }
  };

  const fetchBanks = async () => {
    try {
      // Dapatkan senarai bank
      const {data} = await apiClient.get("/banks");
      if (data) {setBanks(data);}
    } catch (error) {
      console.error('Ralat semasa mendapatkan senarai bank:', error);
      toast.error(error.message || 'Ralat mendapatkan senarai bank. Sila cuba sebentar lagi.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Dapatkan senarai bil yang belum dibayar
      await fetchBillings();
      
      // Dapatkan senarai bank
      await fetchBanks();
    } catch (error) {
      console.error('Ralat mendapatkan data:', error);
      toast.error(error.message || 'Ralat mendapatkan data. Sila cuba sebentar lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Function untuk semak form lengkap
  const checkValid = () => {
    return (
      payment?.billing_id !== "" &&
      payment?.bank_id !== "" &&
      payment?.reference_no !== "" &&
      parseFloat(payment?.amount || 0) > 0 &&
      payment?.proof_file !== null
    );
  };

  // Function untuk simpan sebagai draft atau hantar pembayaran
  const saveForm = async (statusId, successMessage) => {
    setError(null);
    toast.dismiss();
    
    if (statusId !== 1) { // If not saving as draft, show loading and validate
      setLoading(true);
      // Only check validation when submitting
      if (!checkValid()) {
        setLoading(false);
        throw new Error("Sila lengkapkan semua maklumat yang diperlukan");
      }
    }
  
    try {
      // URL dan method berdasarkan create/update
      const url = !idform ? "/billing-payments" : `/billing-payments/${idform}`;
      const method = !idform ? "post" : "put";
  
      // Set status berdasarkan parameter
      const formData = new FormData();
      
      // Tambah semua field ke dalam FormData
      Object.keys(payment).forEach(key => {
        if (key === 'proof_file' && payment[key] instanceof File) {
          formData.append(key, payment[key]);
        } else if (payment[key] !== null && payment[key] !== undefined) {
          formData.append(key, payment[key]);
        }
      });
      
      // Tambah status_id
      formData.append('status_id', statusId);
  
      // Hantar data ke backend
      const {data} = await apiClient[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const newId = data?.id || idform;
      
      // Show success message
      if (successMessage) {
        toast.success(successMessage);
      }
      
      // Handle navigation based on statusId
      if (statusId === 1 && flagNew) {
        navigate(`/billing-payment/${newId}/edit`);
      } else if (statusId === 2) {
        // Immediately navigate away when submitting
        navigate(`/billing-payment/list`, { replace: true });
      }
      
      return { success: true, data };
    } catch (error) {
      
      if(error?.response?.status === 403) {
        toast.error("Anda tidak mempunyai kebenaran untuk menghantar pembayaran ini");
      } else if(error?.response?.status === 422) {
        const {data} = error?.response || {};
        setError(data?.errors);
      } else {
        toast.error(error.message || `Ralat semasa ${statusId === 1 ? 'menyimpan draf' : 'menghantar pembayaran'}. Sila cuba lagi.`);
      }
      
      return { success: false, error };
    } finally {
      if (statusId !== 1) { // Only reset loading if it was set
        setLoading(false);
      }
    }
  };
  

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
    const initPayment = async () => {
      // Jika update, dapatkan data pembayaran
      if (idform) {
        const {data} = await apiClient.get(`/billing-payments/${idform}`);
        if (data) {
          // Format data untuk form
          setPayment({
            ...data,
            // Pastikan tarikh dalam format YYYY-MM-DD
            payment_date: data.payment_date?.slice(0, 10),
          });
        }
      } else {
        setPayment(defaultPayment);
      }
    };

    initPayment();
  }, [idform]);

  // Semak sama ada pembayaran boleh diedit (hanya status draft sahaja)
  const canEdit = payment.status_id === 1;

  // Jika bukan draft, tunjuk mesej
  const statusMessage = !canEdit ? (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Pembayaran ini tidak boleh dikemaskini kerana status bukan lagi dalam draft.
          </p>
        </div>
      </div>
    </div>
  ) : null;

  // Function untuk mengemaskini jumlah pembayaran berdasarkan bil yang dipilih
  const updateAmountFromBilling = (billingId) => {
    const selectedBilling = billings?.find(b => b.id === parseInt(billingId));
    if (selectedBilling) {
      const remainingAmount = parseFloat(selectedBilling.remaining_amount || selectedBilling.total_amount || 0).toFixed(2);
      setPayment(prev => ({
        ...prev,
        amount: remainingAmount
      }));
    }
  };

  return (
    <PageComponent
      title={flagNew ? "Pembayaran Baru" : "Kemaskini Pembayaran"}
      buttons={!loading && (
        <div className="flex gap-2">
          <TButton color="light" to={"/billing/finance"}>Kembali</TButton>
        </div>
      )}
    >
      <div className="container-fixed py-5">
        <div className="grid gap-5 lg:gap-7.5 gow">
          {loading && <Pulse />}
          {!loading && (
            <Card>
              {statusMessage}
              <Card.Body oClass="flex flex-col gap-7.5">
                <FormC data={payment} setValue={setPayment} error={error} disabled={!canEdit}>
                  <div className="grid gap-7 ">
                    <FormC.LDate 
                      field={"payment_date"} 
                      text={"Tarikh Pembayaran"} 
                      option={{ disabled: !canEdit }}
                    />
                    
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <FormC.label text="Bil Yang Dibayar" />
                      <div className="flex flex-col w-full">
                        <Select
                          isDisabled={!canEdit}
                          value={null}
                          onChange={(selectedOption) => {
                            const billingId = selectedOption ? selectedOption.id : "";
                            setPayment(prev => ({...prev, billing_id: billingId}));
                            updateAmountFromBilling(billingId);
                          }}
                          options={billings}
                          getOptionLabel={(option) => `${option.running_no} - ${option.description} (RM${parseFloat(option.remaining_amount || option.total_amount).toFixed(2)})`}
                          getOptionValue={(option) => option.id.toString()}
                          placeholder="Pilih Bil"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                        {error?.billing_id && (
                          <span className="text-xs mt-2 text-red-600">{error.billing_id}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <FormC.label text="Bank" />
                      <div className="flex flex-col w-full">
                        <Select
                          isDisabled={!canEdit}
                          value={banks?.find(bank => bank.id === parseInt(payment.bank_id)) || null}
                          onChange={(selectedOption) => {
                            setPayment(prev => ({...prev, bank_id: selectedOption ? selectedOption.id : ""}));
                          }}
                          options={banks}
                          getOptionLabel={(option) => `${option.name} - ${option.account_number}`}
                          getOptionValue={(option) => option.id.toString()}
                          placeholder="Pilih Bank"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                        {error?.bank_id && (
                          <span className="text-xs mt-2 text-red-600">{error.bank_id}</span>
                        )}
                      </div>
                    </div>
                    
                    <FormC.LText field={"reference_no"} text={"No Rujukan Pembayaran"} option={{ readOnly: !canEdit }} />
                    <FormC.LCurrency field={"amount"} text={"Jumlah Pembayaran"} option={{ readOnly: !canEdit }} />
                    
                    {payment.billing_id && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700 font-semibold">
                              Maklumat Bayaran
                            </p>
                            {billings?.find(bill => bill.id === parseInt(payment.billing_id)) && (
                              <div className="mt-2 text-sm text-blue-700">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>No. Bil:</div>
                                  <div>{billings?.find(bill => bill.id === parseInt(payment.billing_id)).running_no}</div>
                                  
                                  <div>Jumlah Bil:</div>
                                  <div>RM {parseFloat(billings?.find(bill => bill.id === parseInt(payment.billing_id)).total_amount).toFixed(2)}</div>
                                  
                                  <div>Jumlah Telah Dibayar:</div>
                                  <div>RM {parseFloat(billings?.find(bill => bill.id === parseInt(payment.billing_id)).total_amount - (billings?.find(bill => bill.id === parseInt(payment.billing_id)).remaining_amount || billings?.find(bill => bill.id === parseInt(payment.billing_id)).total_amount)).toFixed(2)}</div>
                                  
                                  <div>Baki Perlu Dibayar:</div>
                                  <div>RM {parseFloat(billings?.find(bill => bill.id === parseInt(payment.billing_id)).remaining_amount || billings?.find(bill => bill.id === parseInt(payment.billing_id)).total_amount).toFixed(2)}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <FormC.LText field={"description"} text={"Keterangan Pembayaran"} option={{ readOnly: !canEdit }} />
                    
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <FormC.label text="Bukti Pembayaran" />
                      <div className="flex flex-col w-full">
                        {canEdit ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="file" 
                              id="proof_file"
                              className="hidden" 
                              onChange={handleFileUpload}
                              accept="image/*,.pdf"
                            />
                            <label 
                              htmlFor="proof_file"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100"
                            >
                              <FaUpload />
                              <span>Pilih Fail</span>
                            </label>
                            {selectedFile && (
                              <span className="text-sm text-gray-600">
                                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                              </span>
                            )}
                          </div>
                        ) : payment.proof_file_url ? (
                          <a 
                            href={payment.proof_file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Lihat Bukti Pembayaran
                          </a>
                        ) : (
                          <span className="text-gray-500">Tiada bukti pembayaran</span>
                        )}
                        {error?.proof_file && (
                          <span className="text-xs mt-2 text-red-600">{error.proof_file}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </FormC>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </PageComponent>
  );
}

BillingPayment.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  onFocus: PropTypes.func,
  currChange: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
};
