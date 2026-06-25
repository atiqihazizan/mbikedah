import { useState, useContext } from "react";
import { FormContext } from "../FormContext";
import { Trash2Icon } from "lucide-react";
import { formatCurrency } from "../../config/format";
import Select from 'react-select';

export default function ApplicantDetailsRows({ FormC, data, def, idx = false, setChange, budgets, error, dataLen=-1 }) {
  const { disabled } = useContext(FormContext);
  const [detail, setDetail] = useState(data || def);
  
  function onFocus(ev) {
    ev.target.select();
  }

  // Const untuk select options
  const budgetOptions = budgets?.map(budget => ({
    value: budget.id,
    label: `${budget.code} - ${budget.name}`,
    originalItem: budget
  })) || [];

  // Const untuk selected value
  const selectedBudget = budgets?.find(b => b.id === parseInt(detail?.budget_id));
  const selectedValue = selectedBudget ? {
    value: detail?.budget_id,
    label: `${selectedBudget.code} - ${selectedBudget.name}`
  } : null;

  // Function untuk handle select change
  function handleBudgetChange(selectedOption) {
    const budgetId = selectedOption ? selectedOption.value : '';
    const selectedBudget = budgets?.find(b => b.id === parseInt(budgetId));
    const enhancedData = {
      ...detail,
      budget_id: budgetId,
      budget_code: selectedBudget?.code || ''
    };
    setDetail(enhancedData);
    onUpdate(enhancedData);
  }

  // Const untuk select styles
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      border: state.isFocused ? '1px solid #3B82F6' : '1px solid #D1D5DB',
      borderRadius: '0.375rem',
      boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
      fontSize: '12px',
      '&:hover': {
        border: state.isFocused ? '1px solid #3B82F6' : '1px solid #9CA3AF'
      },
      backgroundColor: disabled ? '#F3F4F6' : 'white',
      cursor: disabled ? 'not-allowed' : 'default'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3B82F6' 
        : state.isFocused 
          ? '#EBF8FF' 
          : 'white',
      color: state.isSelected 
        ? 'white' 
        : '#374151',
      cursor: 'pointer',
      fontSize: '12px',
      '&:active': {
        backgroundColor: '#3B82F6'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#374151',
      fontSize: '12px'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9CA3AF',
      fontSize: '12px'
    }),
    menu: (provided) => ({
      ...provided,
      width: 'auto',
      minWidth: '100%'
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 })
  };

  function inputChange(e, field) {
    const val = e.target.value;
    const newdata = { ...detail, [field]: val };
    setDetail(newdata);
    onUpdate(newdata);
  }

  function currChange(e, field) {
    const rawValue = e.target.value;
    const newdata = { ...detail };
    
    // Store raw value to preserve dots while typing
    newdata[field] = rawValue;
    
    // Parse for calculation only
    const val = parseFloat(rawValue) || 0;
    const qty = field === 'quantity' ? val : (parseFloat(newdata.quantity) || 0);
    const price = field === 'price' ? val : (parseFloat(newdata.price) || 0);
    newdata.total = (qty * price).toFixed(2);
    
    setDetail(newdata);
    onUpdate(newdata);
  }

  // Function khas untuk price - jika quantity == 0 maka ubah kepada 1
  function priceChange(e) {
    const rawValue = e.target.value;
    const newdata = { ...detail };
    
    // Store raw value to preserve dots while typing
    newdata.price = rawValue;
    
    // Parse for calculation
    const price = parseFloat(rawValue) || 0;
    let qty = parseFloat(newdata.quantity) || 0;
    
    // Jika quantity == 0, ubah kepada 1 (hanya jika price > 0)
    if (price > 0 && qty === 0) {
      qty = 1;
      newdata.quantity = '1';
    }
    
    // Calculate total
    newdata.total = (qty * price).toFixed(2);
    
    setDetail(newdata);
    onUpdate(newdata);
  }

  // Function khas untuk quantity - jika price > 0 maka qty tidak boleh 0, auto tukar kepada 1
  function quantityChange(e) {
    const rawValue = e.target.value;
    const newdata = { ...detail };
    
    // Store raw value to preserve dots while typing
    newdata.quantity = rawValue;
    
    // Parse for calculation
    const qty = parseFloat(rawValue) || 0;
    const price = parseFloat(newdata.price) || 0;
    
    // Jika price > 0 dan quantity == 0, ubah quantity kepada 1
    if (price > 0 && qty === 0) {
      newdata.quantity = '1';
      newdata.total = (1 * price).toFixed(2);
    } else {
      // Calculate total normally
      newdata.total = (qty * price).toFixed(2);
    }
    
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
        <td className="pl-4 py-3 align-top w-[250px]">
          <Select
            options={budgetOptions}
            value={selectedValue}
            onChange={handleBudgetChange}
            placeholder="Pilih bajet..."
            isDisabled={disabled}
            isSearchable={true}
            isClearable={true}
            styles={selectStyles}
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            noOptionsMessage={() => "Tiada pilihan"}
            loadingMessage={() => "Memuatkan..."}
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
            rows={4} 
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
            // onChange={(e) => inputChange(e, "quantity")}   
            onChange={quantityChange} 
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
            onChange={priceChange} 
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