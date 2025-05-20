import { useState, useContext } from "react";
import { FormContext } from "../../components/FormContext";
import { Trash2Icon } from "lucide-react";
import { formatCurrency } from "../../config/format";

export default function BillingFormDetailsRows({ FormC, data, def, idx = false, setChange, budgets, error, dataLen=-1 }) {
  const { disabled } = useContext(FormContext);
  const [detail, setDetail] = useState(data || def);
  function onFocus(ev) {ev.target.select();}

  function inputChange(e, field) {
    const val = e.target.value;
    const newdata = { ...detail, [field]: val };
    setDetail(newdata);
    onUpdate(newdata);
  }

  function currChange(e, field) {
    const val = parseFloat(e.target.value) || 0;
    const newdata = { ...detail };
    newdata[field] = val;
    const qty = field === 'quantity' ? val : (parseFloat(newdata.quantity) || 0);
    const price = field === 'price' ? val : (parseFloat(newdata.price) || 0);
    newdata.total = (qty * price).toFixed(2);
    setDetail(newdata);
    onUpdate(newdata);
  }

  function onSave() {
    setChange((prevState) => {
      const newDetails = [...(prevState?.details || []), { ...def }];
      const total = newDetails.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {...prevState,details: newDetails,total_amount: total.toFixed(2)};
    });
  }

  function onUpdate(newData) {
    setChange((prevState) => {
      const currentDetails = prevState?.details || [];
      const updatedDetails = currentDetails.map((d, i) => i === idx ? newData : d);
      const total = updatedDetails.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {...prevState,details: updatedDetails,total_amount: total.toFixed(2)};
    });
  }

  function onDelete() {
    setChange((prevState) => {
      const currentDetails = prevState?.details || [];
      const updatedDetails = currentDetails.filter((_, i) => i !== idx);
      const total = updatedDetails.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {...prevState,details: updatedDetails,total_amount: total.toFixed(2)};
    });
  }

  return (
    <>
    <tr>
      <td className="!pl-7 !pr-2 align-top w-[140px]">
        <FormC.select
          field="budget_id"
          keyval="id,code,name"
          listArr={budgets}
          option={{
            placeholder: "Pilih bajet",
            disabled,
            value: detail?.budget_id || '',
            onChange: (e) => {
              const selectedBudget = budgets.find(b => b.id === parseInt(e.target.value));
              const newData = {...detail,budget_id: e.target.value,budget_code: selectedBudget?.code || ''};
              setDetail(newData);
              onUpdate(newData);
            }
          }}
        />
        {error?.[`details.${idx}.budget_id`] && (<span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.budget_id`]}</span>)}
      </td>
      <td className="!pl-2 !pr-2 align-top">
        <FormC.textarea field="description" 
          rows={1} 
          value={detail?.description || ''}
          option={{ disabled }} 
          onChange={(e) => inputChange(e, "description")}
        />
        {error?.[`details.${idx}.description`] && (<span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.description`]}</span>)}
      </td>
      <td className="!px-2 w-[250px] align-top">
        <FormC.text value={detail?.reference || ''} onChange={(e) => inputChange(e, "reference")}  option={{ disabled }} />
      </td>
      <td className="!px-2 w-[130px] align-top">
        <FormC.number value={detail?.quantity || '0'} css="text-center" onChange={(e) => currChange(e, "quantity", "price")} option={{disabled,onFocus: onFocus}} />
        {error?.[`details.${idx}.quantity`] && (<span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.quantity`]}</span>)}
      </td>
      <td className="!px-2 w-[150px] align-top">
        <FormC.text value={detail?.unit || ''} onChange={(e) => inputChange(e, "unit")} option={{disabled}} />
        {error?.[`details.${idx}.unit`] && (<span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.unit`]}</span>)}
      </td>
      <td className="!px-2 w-[120px] align-top">
        <FormC.currency value={detail?.price || '0.00'} onChange={(e) => currChange(e, "price", "quantity")} option={{disabled,placeholder: "Harga",onFocus: onFocus}} />
        {error?.[`details.${idx}.price`] && (<span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.price`]}</span>)}
      </td>
      <td className="!px-2 w-[120px] text-end">{formatCurrency(detail?.total || '0.00')}</td>
      <td className="!pl-0 !pr-7 w-[80px] align-top text-end">
          {idx > 0 && !disabled && (<a className="btn btn-xs btn-icon text-danger-700" onClick={onDelete}><Trash2Icon /></a>)}
      </td>
    </tr>
    { (idx === dataLen) && (
    <tr>
      <td colSpan={8} className="!pl-7 !pr-2 w-[150px]">
        <a className="text-primary-600 hover:text-primary-900 italic font-semibold" onClick={onSave}>Tambah Item</a>
      </td>
    </tr>
    )}
  </>
  );
}
