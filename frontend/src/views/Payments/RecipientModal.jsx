import { useEffect, useState } from "react";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";

export default function RecipientModal({ show, onClose, onSave, recipient = null }) {
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
  }, [recipient]);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    onSave(recipientData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          {recipient ? "Kemaskini Penerima" : "Tambah Penerima Baru"}
        </h2>

        <form onSubmit={handleSubmit}>
          <FormC data={recipientData} setValue={setRecipientData}>
            <div className="grid gap-4">
              <FormC.LText field="name" text="Nama Syarikat/Individu" />
              <FormC.LText field="short" text="Nama Pendek" />
              <FormC.LText field="attn" text="Perhatian Kepada" />
              <FormC.LText field="addr" text="Alamat" />
              
              <div className="grid grid-cols-3 gap-4">
                <FormC.LText field="tel" text="No. Telefon" />
                <FormC.LText field="hp" text="No. HP" />
                <FormC.LText field="fax" text="No. Faks" />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <TButton 
                color="light" 
                onClick={() => {
                  setRecipientData({
                    name: "",
                    short: "",
                    attn: "",
                    hp: "",
                    tel: "",
                    fax: "",
                    addr: "",
                  });
                  onClose();
                }}
              >
                Batal
              </TButton>
              <TButton color="primary" type="submit">
                {recipient ? "Kemaskini" : "Simpan"}
              </TButton>
            </div>
          </FormC>
        </form>
      </div>
    </div>
  );
}
