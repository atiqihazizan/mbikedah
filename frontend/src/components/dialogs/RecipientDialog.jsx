import { useEffect, useState } from "react";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import apiClient from "../../utils/axios";

export default function RecipientDialog({ show, onClose, onSaved, recipient = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipientData, setRecipientData] = useState({
    name: "",
    short: "",
    attn: "",
    hp: "",
    tel: "",
    fax: "",
    addr: "",
  });

  useEffect(() => {
    if (recipient) {
      setRecipientData(recipient);
    }
    setError(null);
  }, [show,recipient]);

  const validateForm = () => {
    if (!recipientData.name?.trim()) {
      setError("Nama Syarikat/Individu diperlukan");
      return false;
    }
    return true;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = recipient 
        ? `/billing-recipients/${recipient.id}`
        : '/billing-recipients';
      
      const method = recipient ? 'put' : 'post';
      
      const trimmedData = Object.keys(recipientData).reduce((acc, key) => ({
        ...acc,
        [key]: typeof recipientData[key] === 'string' ? recipientData[key].trim() : recipientData[key]
      }), {});
      
      const response = await apiClient[method](url, trimmedData);
      console.log(response);
      const message = recipient 
        ? 'Penerima berjaya dikemaskini'
        : 'Penerima baru berjaya ditambah';

      onSaved(true, message);
      handleClose();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Ralat semasa menyimpan penerima. Sila cuba lagi.';
      setError(errorMessage);
      onSaved(false, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRecipientData({
      name: "",
      short: "",
      attn: "",
      hp: "",
      tel: "",
      fax: "",
      addr: "",
    });
    setError(null);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          {recipient ? "Kemaskini Penerima" : "Tambah Penerima Baru"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <FormC data={recipientData} setValue={setRecipientData} error={error}>
            <div className="grid gap-4">
              <FormC.LText 
                field="name" 
                text="Nama Syarikat/Individu" 
                option={{ disabled: loading }}
              />
              <FormC.LText 
                field="short" 
                text="Nama Pendek"
                option={{ disabled: loading }}
              />
              <FormC.LText 
                field="attn" 
                text="Perhatian Kepada"
                option={{ disabled: loading }}
              />
              <FormC.LText 
                field="addr" 
                text="Alamat"
                option={{ disabled: loading }}
              />
              
              <FormC.LText 
                field="tel" 
                text="No. Telefon"
                option={{ disabled: loading }}
              />
                <FormC.LText 
                  field="hp" 
                  text="No. HP"
                  option={{ disabled: loading }}
                />
                <FormC.LText 
                  field="fax" 
                  text="No. Faks"
                  option={{ disabled: loading }}
                />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <TButton 
                color="light" 
                onClick={handleClose}
                isDisable={loading}
              >
                Batal
              </TButton>
              <TButton 
                color="primary" 
                onClick={handleSubmit}
                isDisable={loading}
              >
                {loading ? "Menyimpan..." : (recipient ? "Kemaskini" : "Simpan")}
              </TButton>
            </div>
          </FormC>
        </div>
      </div>
    </div>
  );
}