import { FaPlus, FaEdit } from "react-icons/fa";
import { formatCurrency } from "../../config/format";
import FormC from "../FormContext";
import TButton from "../Core/TButton";
import { ReactSelect } from "../Core";
import ApplicantDetailsRows from "./ApplicantDetailsRows";

export default function ApplicantEditMode({ 
  petition, 
  setPetition, 
  recipients, 
  budgets, 
  error, 
  canEdit, 
  defaultDetail,
  getPaymentDueDate,
  handleAddRecipient,
  handleEditRecipient
}) {
  
  const onSubmit = (ev) => {
    ev.preventDefault();
  };

  return (
    <form onSubmit={onSubmit}>
      <FormC data={petition} setValue={setPetition} error={error} disabled={!canEdit}>
        <div className="grid gap-6">
          <div className="grid grid-cols-3 gap-6">
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
              option={{ disabled: !canEdit }}
            />
            <FormC.LText  field={"no_project"} text={"No Pesanan"} option={{ readOnly: !canEdit }} />
            {/* <div className="flex items-center gap-2">
              <FormC.label text="Individu/Syarikat" oClass="max-w-[120px]" />
            </div> */}
            <div className="flex flex-col w-full">
              <div className="flex gap-2.5">
                <ReactSelect
                  label="Individu/Syarikat"
                  field="recipient_id"
                  setValue={setPetition}
                  data={petition}
                  list={recipients}
                  keyval="id,name"
                  error={error}
                  option={{ disabled: !canEdit }}
                  className="react-select-container w-full"
                  placeholder="Pilih Penerima"
                  autoFitWidth={true}
                />
                {canEdit && (
                  <>
                    <TButton 
                      color="light" 
                      onClick={handleAddRecipient} 
                      className="!py-1 mt-6" 
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
                        className="p-2 mt-6" 
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
          <div className="border border-gray-200 rounded-lg" style={{overflow: 'visible'}}>
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
                  <ApplicantDetailsRows 
                    key={i} 
                    FormC={FormC} 
                    data={d} 
                    def={defaultDetail}
                    idx={i} 
                    setChange={setPetition} 
                    budgets={budgets} 
                    error={error} 
                    dataLen={petition?.details?.length-1}
                  />
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
  );
}
