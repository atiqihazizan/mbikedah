import { useEffect, useState, useContext } from "react";
import { FormContext } from "../../components/FormContext";
import { SaveIcon, XIcon } from "lucide-react";
import PropTypes from "prop-types";

export default function RowTR({ FormC, data, idx = false, setChange, budgets, error }) {
  // Dapatkan disabled state dari FormContext
  const { disabled } = useContext(FormContext);
  const def = {
    id: 0,
    budget_id: "",           // ID bajet
    budget_code: "",         // Kod bajet
    description: "",         // Keterangan
    reference: "",          // No rujukan
    quantity: "0",          // Kuantiti (string untuk elak null)
    price: "0.00",          // Harga seunit
    total: "0.00",         // Jumlah (quantity * price)
    unit: "",                // Unit ukuran
    purpose: ""              // Tujuan
  };
  const [detail, setDetail] = useState(def);
  function onFocus(ev) {
    ev.target.select();
  }

  function inputChange(e, field) {
    const val = e.target.value;
    const newdata = { ...detail, [field]: val };
    setDetail(newdata);
    onUpdate(newdata);
  }

  // Kira amount berdasarkan quantity dan price
  function currChange(e, field) {
    const val = parseFloat(e.target.value) || 0;
    const newdata = { ...detail };
    newdata[field] = val;
    
    // Kira amount (quantity * price)
    const qty = field === 'quantity' ? val : (parseFloat(newdata.quantity) || 0);
    const price = field === 'price' ? val : (parseFloat(newdata.price) || 0);
    newdata.total = (qty * price).toFixed(2);
    
    setDetail(newdata);
    onUpdate(newdata);
  }

  // Simpan item baru dan kira total_amount
  function onSave(e) {
    if (data) return e;
    
    setChange((prevState) => {
      // Tambah item baru ke dalam senarai
      const newDetails = [...(prevState?.details || []), { ...detail }];
      
      // Kira total_amount
      const total = newDetails.reduce((sum, item) => {
        return sum + (parseFloat(item.total) || 0);
      }, 0);
      
      return {
        ...prevState,
        details: newDetails,
        total_amount: total.toFixed(2)
      };
    });
    
    // Reset form ke default
    setDetail(def);
  }

  // Kemaskini item sedia ada dan kira semula total_amount
  function onUpdate(newData) {
    if (idx === false) return;
    
    setChange((prevState) => {
      // Pastikan details wujud
      const currentDetails = prevState?.details || [];
      
      // Kemaskini item dalam senarai
      const updatedDetails = currentDetails.map((d, i) => 
        i === idx ? newData : d
      );
      
      // Kira semula total_amount
      const total = updatedDetails.reduce((sum, item) => {
        return sum + (parseFloat(item.total) || 0);
      }, 0);
      return {
        ...prevState,
        details: updatedDetails,
        total_amount: total.toFixed(2)
      };
    });
  }

  function onDelete() {
    if (idx === false) return;
    
    setChange((prevState) => {
      // Pastikan details wujud
      const currentDetails = prevState?.details || [];
      
      // Buang item dari senarai
      const updatedDetails = currentDetails.filter((_, i) => i !== idx);
      
      // Kira semula total_amount
      const total = updatedDetails.reduce((sum, item) => {
        return sum + (parseFloat(item.total) || 0);
      }, 0);
      
      return {
        ...prevState,
        details: updatedDetails,
        total_amount: total.toFixed(2)
      };
    });
  }

  useEffect(() => {
    if (data) setDetail(data);
  }, [data]);

  return (
    <tr>
      <td className="!pl-7 !pr-2">
        <FormC.select
          field="budget_id"
          keyval="id,code,name"
          listArr={budgets}
          option={{
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
            }
          }}
        />
        {error?.[`details.${idx}.budget_id`] && (
          <span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.budget_id`]}</span>
        )}
      </td>
      <td className="!px-2">
        <FormC.text
          value={detail?.description || ''}
          onChange={(e) => inputChange(e, "description")}
          option={{ disabled }}
        />
        {error?.[`details.${idx}.description`] && (
          <span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.description`]}</span>
        )}
      </td>
      <td className="!px-2">
        <FormC.text
          value={detail?.reference || ''}
          onChange={(e) => inputChange(e, "reference")}
          option={{ disabled }}
        />
        {error?.[`details.${idx}.reference`] && (
          <span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.reference`]}</span>
        )}
      </td>
      <td className="!px-2">
        <FormC.number
          value={detail?.quantity || '0'}
          onChange={(e) => currChange(e, "quantity", "price")}
          option={{
            disabled,
            placeholder: "Kuantiti",
            onFocus: onFocus
          }}
        />
        {error?.[`details.${idx}.quantity`] && (
          <span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.quantity`]}</span>
        )}
        </td>
      <td className="!px-2">
        <FormC.text
          value={detail?.unit || ''}
          onChange={(e) => inputChange(e, "unit")}
          option={{
            disabled,
            placeholder: "Unit",
            className: "input input-sm"
          }}
        />
        {error?.[`details.${idx}.unit`] && (
          <span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.unit`]}</span>
        )}
      </td>
      <td className="!px-2">
        <FormC.currency
          value={detail?.price || '0.00'}
          onChange={(e) => currChange(e, "price", "quantity")}
          option={{
            disabled,
            placeholder: "Harga",
            onFocus: onFocus
          }}
        />
        {error?.[`details.${idx}.price`] && (
          <span className="text-xs mt-2 text-red-600">{error?.[`details.${idx}.price`]}</span>
        )}
      </td>
      <td className="!px-2">
        <FormC.currency value={detail?.total || '0.00'} option={{ readOnly: true }} />
      </td>
      <td className="!pl-0 !pr-7">
        <div className="flex flex-col">
          {data == undefined && (
            <a
              className="btn btn-xs btn-icon btn-clear btn-primary"
              onClick={onSave}
            >
              <SaveIcon width={20} />
            </a>
          )}
          {data && !disabled && (
            <a
              className="btn btn-xs btn-icon btn-clear text-danger-700"
              onClick={onDelete}
            >
              <XIcon width={20} />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

RowTR.propTypes = {
  data: PropTypes.object,
  FormC: PropTypes.func,
  setChange: PropTypes.func,
  idx: PropTypes.number,
  error: PropTypes.object
};
