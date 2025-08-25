import { useState, useContext } from "react";
import { FormContext } from "../FormContext";
import { Trash2Icon } from "lucide-react";
import { formatCurrency } from "../../config/format";

export default function ApplicantDetailsRows({ FormC, data, def, idx = false, setChange, budgets, error, dataLen=-1 }) {
  const { disabled } = useContext(FormContext);
  const [detail, setDetail] = useState(data || def);
  
  function onFocus(ev) {
    ev.target.select();
  }

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
      return {...prevState, details: newDetails, total_amount: total.toFixed(2)};
    });
  }

  function onUpdate(newData) {
    setChange((prevState) => {
      const currentDetails = prevState?.details || [];
      const updatedDetails = currentDetails.map((d, i) => i === idx ? newData : d);
      const total = updatedDetails.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {...prevState, details: updatedDetails, total_amount: total.toFixed(2)};
    });
  }

  function onDelete() {
    setChange((prevState) => {
      const currentDetails = prevState?.details || [];
      const updatedDetails = currentDetails.filter((_, i) => i !== idx);
      const total = updatedDetails.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      return {...prevState, details: updatedDetails, total_amount: total.toFixed(2)};
    });
  }

  return (
    <>
      <tr>
        <td className="pl-4 py-3 align-top w-[200px]">
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
                const newData = {
                  ...detail,
                  budget_id: e.target.value,
                  budget_code: selectedBudget?.code || ''
                };
                setDetail(newData);
                onUpdate(newData);
              },
              // Disable option untuk budget dengan total = 0
              // Function ini akan return true untuk budget yang perlu di-disable
              // disabledOptions: (budget) => parseFloat(budget.bdgtotal || 0) === 0
            }}
          />
          {error?.[`details.${idx}.budget_id`] && (
            <span className="text-xs mt-1 text-red-600 block">
              {error?.[`details.${idx}.budget_id`]}
            </span>
          )}
        </td>
        
        <td className="pl-4 py-3 align-top">
          <FormC.textarea 
            field="description" 
            rows={1} 
            value={detail?.description || ''}
            option={{ disabled }} 
            onChange={(e) => inputChange(e, "description")}
          />
          {error?.[`details.${idx}.description`] && (
            <span className="text-xs mt-1 text-red-600 block">
              {error?.[`details.${idx}.description`]}
            </span>
          )}
        </td>
        
        <td className="pl-4 py-3 w-[150px] align-top">
          <FormC.text 
            value={detail?.reference || ''} 
            onChange={(e) => inputChange(e, "reference")}  
            option={{ disabled }} 
          />
        </td>
        
        <td className="pl-4 py-3 w-[100px] align-top">
          <FormC.number 
            value={detail?.quantity || '0'} 
            css="text-center" 
            onChange={(e) => currChange(e, "quantity")} 
            option={{disabled, onFocus: onFocus}} 
          />
          {error?.[`details.${idx}.quantity`] && (
            <span className="text-xs mt-1 text-red-600 block">
              {error?.[`details.${idx}.quantity`]}
            </span>
          )}
        </td>
        
        {/* <td className="pl-4 py-3 w-[100px] align-top">
          <FormC.text 
            value={detail?.unit || ''} 
            onChange={(e) => inputChange(e, "unit")} 
            option={{disabled}} 
          />
          {error?.[`details.${idx}.unit`] && (
            <span className="text-xs mt-1 text-red-600 block">
              {error?.[`details.${idx}.unit`]}
            </span>
          )}
        </td> */}
        
        <td className="pl-4 py-3 w-[120px] align-top">
          <FormC.currency 
            value={detail?.price || '0.00'} 
            onChange={(e) => currChange(e, "price")} 
            option={{disabled, placeholder: "Harga", onFocus: onFocus}} 
          />
          {error?.[`details.${idx}.price`] && (
            <span className="text-xs mt-1 text-red-600 block">
              {error?.[`details.${idx}.price`]}
            </span>
          )}
        </td>
        
        <td className="pl-4 pt-5 w-[120px] text-right align-top font-medium text-gray-900">
          {formatCurrency(detail?.total || '0.00')}
        </td>
        
        <td className="pl-4 py-3 w-[60px] align-top text-center">
          {idx > 0 && !disabled && (
            <button 
              type="button"
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors" 
              onClick={onDelete}
              title="Hapus Item"
            >
              <Trash2Icon className="w-4 h-4" />
            </button>
          )}
        </td>
      </tr>
      
      {(idx === dataLen) && !disabled && (
        <tr>
          <td colSpan={8} className="pl-4 py-3">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded italic font-medium transition-colors"
              onClick={onSave}
            >
              + Tambah Item
            </button>
          </td>
        </tr>
      )}
    </>
  );
}