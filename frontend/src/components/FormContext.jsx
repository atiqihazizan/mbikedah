import { createContext, useContext } from "react";
import ReactInput from "./Core/ReactInput";
import ReactSelect from "./Core/ReactSelect";
import TAutocomplete from "./Core/TAutocomplete";

export const FormContext = createContext();

/*
 * FormContext Component - Component untuk form handling
 * 
 * SELECT COMPONENTS dengan DISABLE OPTION:
 * 
 * 1. FormC.select - Select tanpa label
 *    Contoh: <FormC.select field="budget_id" listArr={budgets} option={{ disabledOptions: (item) => item.total === 0 }} />
 *    Auto-fit width: <FormC.select field="budget_id" listArr={budgets} autoFitWidth={true} maxDropdownWidth={300} />
 *    Font size: <FormC.select field="budget_id" listArr={budgets} fontSize="small" />
 *    Custom font: <FormC.select field="budget_id" listArr={budgets} fontSize="13px" />
 * 
 * 2. FormC.LSelect - Select dengan label
 *    Contoh: <FormC.LSelect text="Pilih Bajet" field="budget_id" listArr={budgets} option={{ disabledOptions: (item) => item.total === 0 }} />
 *    Auto-fit width: <FormC.LSelect text="Pilih Bajet" field="budget_id" listArr={budgets} autoFitWidth={true} maxDropdownWidth={300} />
 *    Font size: <FormC.LSelect text="Pilih Bajet" field="budget_id" listArr={budgets} fontSize="large" />
 * 
 * AUTOCOMPLETE COMPONENTS:
 * 
 * 1. FormC.autocomplete - Autocomplete tanpa label
 *    Contoh: <FormC.autocomplete field="recipient_id" list={recipients} keyval="id,name" />
 * 
 * 2. FormC.LAutocomplete - Autocomplete dengan label
 *    Contoh: <FormC.LAutocomplete text="Pilih Penerima" field="recipient_id" list={recipients} keyval="id,name" />
 * 
 * AUTOCOMPLETE PROPERTIES:
 * - list: Array of objects untuk pilihan
 * - keyval: String format "id,name" atau "id,code,name" untuk key dan display field
 * - searchFields: Array of fields untuk dicari (optional, defaults to display fields)
 * - maxResults: Number maksimum hasil (default: 10)
 * - minSearchLength: Number minimum karakter untuk memulai pencarian (default: 1)
 * - allowCustomValue: Boolean untuk membenarkan nilai custom (default: false)
 * - autoFitWidth: Boolean untuk auto-fit lebar dropdown dengan content (default: true)
 * - maxDropdownWidth: Number maksimum lebar dropdown dalam pixels (default: 400)
 * - onSearch: Function untuk pencarian external/API (optional)
 * - option: Object dengan properties seperti disabled, onChange, dll
 * 
 * OPTION PROPERTIES:
 * - disabledOptions: Function untuk disable option tertentu
 * - disabled: Boolean untuk disable seluruh component
 * - placeholder: String untuk placeholder text
 * - onChange: Function untuk handle change event
 */

function FormC({ children, setValue, data, error, disabled }) {
	return (
		<FormContext.Provider value={{ setValue, data, error, disabled }}>
			{children}
		</FormContext.Provider>
	);
}
// function FLabel({ text, oCLass = "max-w-56" }) {
function FLabel({ text, oClass = "max-w-56" }) {
	return <label className={`form-label ${oClass}`}>{text}</label>;
}

function Text({field,value,onChange,holder = "",type = "text",css,option}) {
  const { error, disabled } = useContext(FormContext);
  const newCss = ["input"];
  if (css) newCss.push(css);
  return (
    <div className="flex flex-col w-full">
      <input
        className={newCss.join(" ")}
        type={type}
        placeholder={holder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...option}
      />
      {error?.[field] && (
        <span className="text-xs mt-2 text-red-600">{error?.[field]}</span>
      )}
    </div>
  );
}
function TextArea({field, value, onChange, holder = "", css, option, rows = 4}) {
  const { error, disabled } = useContext(FormContext);
  const newCss = ["textarea"];
  if (css) newCss.push(css);
  
  return (
    <div className="flex flex-col w-full">
      <textarea
        className={newCss.join(" ")}
        placeholder={holder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        {...option}
      />
      {error?.[field] && (
        <span className="text-xs mt-2 text-red-600">{error?.[field]}</span>
      )}
    </div>
  );
}
function TxtDate({field,value,onChange,holder = "",css,option}) {
  // const { setValue, data, error, disabled } = useContext(FormContext);
  return (<Text type="date" option={option} css={css} field={field} value={value} onChange={onChange} holder={holder}/>);
}

function Decimal({field,value,onChange,holder = "",css,option}) {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(e);
      return;
    }
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(inputValue)) {
      onChange(e);
    }
  };

  return (
    <Text
      type="text"
      option={{
        ...option,
        inputMode: "decimal",
        pattern: "[0-9]*[.]?[0-9]{0,2}",
        onKeyPress: (e) => {
          // Hanya benarkan nombor, titik perpuluhan dan beberapa special keys
          if (!/[\d.]/.test(e.key) && 
              e.key !== 'Backspace' && 
              e.key !== 'Delete' && 
              e.key !== 'ArrowLeft' && 
              e.key !== 'ArrowRight' && 
              e.key !== 'Tab') {
            e.preventDefault();
          }
          // Prevent lebih dari satu titik perpuluhan
          if (e.key === '.' && e.target.value.includes('.')) {
            e.preventDefault();
          }
        }
      }}
      css={`text-right ${css || '123'}`}
      field={field}
      value={value}
      onChange={handleChange}
      holder={holder}
    />
  );
}
function Numeric({field,value,onChange,holder = "",css,option}) {
  // const { setValue, data, error, disabled } = useContext(FormContext);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Benarkan input kosong
    if (inputValue === '') {
      onChange(e);
      return;
    }

    // Validasi format nombor dengan titik perpuluhan
    const regex = /^\d*\.?\d*$/;
    if (regex.test(inputValue)) {
      onChange(e);
    }
  };

  return (
    <Text
      type="text"
      option={{
        ...option,
        inputMode: "decimal",
        pattern: "[0-9]*[.]?[0-9]*",
        onKeyPress: (e) => {
          // Hanya benarkan nombor, titik perpuluhan dan beberapa special keys
          if (!/[\d.]/.test(e.key) && 
              e.key !== 'Backspace' && 
              e.key !== 'Delete' && 
              e.key !== 'ArrowLeft' && 
              e.key !== 'ArrowRight' && 
              e.key !== 'Tab') {
            e.preventDefault();
          }
          // Prevent lebih dari satu titik perpuluhan
          if (e.key === '.' && e.target.value.includes('.')) {
            e.preventDefault();
          }
        }
      }}
      css={css}
      field={field}
      value={value}
      onChange={handleChange}
      holder={holder}
    />
  );
}
function Password({ field,value,onChange,holder = "",css,option }) {
  // const { setValue, data, error, disabled } = useContext(FormContext);
  return (<Text type="password" option={option} css={css} field={field} value={value} onChange={onChange} holder={holder}/>);
}

function FInput({ field, label="", holder = "", type = "text", option, inputCss, mask }) {
	const { setValue, data, error } = useContext(FormContext);
	
	// Get current value from data object
	const currentValue = data?.[field] ?? "";
	
	// Handle change event to update data
	const handleChange = (e) => {
		// If there's a custom onChange in option, use it instead
		if (option?.onChange) {
			option.onChange(e);
		} else {
			const newValue = e.target.value;
			setValue(prev => ({ ...prev, [field]: newValue }));
		}
	};
	
	// Extract onChange from option to avoid conflict
	const { onChange: customOnChange, ...otherOptions } = option || {};
	
	return (
		<ReactInput 
			label={label}
			mask={mask}
			type={type}
			value={currentValue}
			onChange={handleChange}
			placeholder={holder}
			disabled={option?.disabled}
			className={inputCss || ''}
			error={error?.[field]}
			{...otherOptions}
		/>
	);
}

function FAutocomplete({ field, list = [], keyval = "id,name", holder = "Taip untuk mencari...", option = {}, className = "", wrapperClassName = "", maxResults = 10, minSearchLength = 1, searchFields = [], onSearch, allowCustomValue = false, autoFitWidth = true, maxDropdownWidth = 400, path = "" }) {
	const { setValue, data, error } = useContext(FormContext);
	return (
		<TAutocomplete 
			data={data} 
			field={field} 
			setValue={setValue} 
			error={error} 
			list={list}
			keyval={keyval}
			placeholder={holder}
			option={option}
			className={className}
			wrapperClassName={wrapperClassName}
			maxResults={maxResults}
			minSearchLength={minSearchLength}
			searchFields={searchFields}
			onSearch={onSearch}
			allowCustomValue={allowCustomValue}
			autoFitWidth={autoFitWidth}
			maxDropdownWidth={maxDropdownWidth}
			path={path}
		/>
	);
}

function FTextArea({ field, value, holder = "", rows = 4, option, css, onChange }) {
  const { data, setValue } = useContext(FormContext);
  
  // Fungsi handleChange yang langsung menggunakan nilai
  const handleChange = (e) => {
    const newValue = e.target.value;
    const newData = { ...data, [field]: newValue };
    setValue(newData);
    if (onChange) onChange(e);
  };

  return (
    <TextArea
      field={field}
      value={value}
      onChange={handleChange}
      holder={holder}
      css={css}
      option={option}
      rows={rows}
    />
  );
}

function FSelect({ field, label="", keyval, listArr, option, css, autoFitWidth, maxDropdownWidth, fontSize }) {
	// Component select tanpa label
	// option.disabledOptions: Function untuk disable option tertentu
	// Contoh: option={{ disabledOptions: (item) => item.total === 0 }}
	// option.disabled: Boolean untuk disable seluruh select component
	// autoFitWidth: Boolean untuk auto-fit lebar dropdown dengan content
	// maxDropdownWidth: Number maksimum lebar dropdown dalam pixels
	// fontSize: String saiz font ('small', 'normal', 'large' atau custom value)
	const { setValue, data, error, disabled } = useContext(FormContext);
	return (
		<ReactSelect
			label={label}
			className={css}
			data={data}
			setValue={setValue}
			field={field}
			keyval={keyval}
			error={error}
			list={listArr}
			maxLength={null}
			placeholder={option?.placeholder || "Pilih"}
			onChange={option?.onChange} // Pass through the onChange handler
			option={{ ...option, disabled: option?.disabled || disabled }}
			disabledOptions={option?.disabledOptions} // Function untuk disable option tertentu
			autoFitWidth={autoFitWidth}
			maxDropdownWidth={maxDropdownWidth}
			fontSize={fontSize}
		/>
	);
}

function CSelect({ text, field, keyval, listArr, css, option, autoFitWidth, maxDropdownWidth, fontSize }) {
	// Component select dengan label
	// option.disabledOptions: Function untuk disable option tertentu
	// Contoh: option={{ disabledOptions: (item) => item.total === 0 }}
	// option.disabled: Boolean untuk disable seluruh select component
	// autoFitWidth: Boolean untuk auto-fit lebar dropdown dengan content
	// maxDropdownWidth: Number maksimum lebar dropdown dalam pixels
	// fontSize: String saiz font ('small', 'normal', 'large' atau custom value)
	return (
		// <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
		// 	<FLabel text={text} />
		// 	<FSelect field={field} keyval={keyval} listArr={listArr} css={css} option={option} autoFitWidth={autoFitWidth} maxDropdownWidth={maxDropdownWidth} fontSize={fontSize} />
		// </div>
    <FSelect label={text} field={field} keyval={keyval} listArr={listArr} css={css} option={option} autoFitWidth={autoFitWidth} maxDropdownWidth={maxDropdownWidth} fontSize={fontSize} />
	);
}
function CText({ text, field, holder, option ,labelWidth = "w-auto"}) {
  return (
    // <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
    //   <FLabel text={text} oClass={labelWidth} />
    //   <FInput field={field} holder={holder || text} option={option} />
    // </div>
    <FInput label={text} field={field} holder={holder || text} option={option} inputCss={labelWidth} />
  );
}
function CCurrency({ text, field, holder, option ,labelWidth = "w-auto"}) {
	return (
    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
      <FLabel text={text} oClass={labelWidth} />
      <FInput
        type="number"
        field={field || text}
        holder={holder}
        option={option}
        inputCss="text-right"
      />
    </div>
  );
}
function CNumber({ text, field, holder, option, labelWidth = "w-auto" }) {
	return (
    // <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
    //   <FLabel text={text} oClass={labelWidth} />
    //   <FInput
    //     label={text}
    //     type="number"
    //     field={field || text}
    //     holder={holder}
    //     option={option}
    //   />
    // </div>
      <FInput label={text} type="number" field={field || text} holder={holder} option={option} inputCss={labelWidth} />
  );
}
function ColPassword({ text, field, holder }) {
	return (
    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
      <FLabel text={text} />
      <FInput field={field} holder={holder || text} type="password" />
    </div>
  );
}
function CDate({ text, field, holder, onChange, option ,labelWidth = "w-auto"}) {
	return (
    // <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
    //   <FLabel text={text} oClass={labelWidth} />
    //   <FInput field={field} holder={holder || text} type="date" option={{...option, onChange}} className="flex-1" />
    // </div>
    <FInput label={text} field={field} holder={holder || text} type="date" option={{...option, onChange}} className="flex-1" />
  );
}
function CAutocomplete({ text, field, list = [], keyval = "id,name", holder, option = {}, className = "", wrapperClassName = "", maxResults = 10, minSearchLength = 1, searchFields = [], onSearch, allowCustomValue = false, autoFitWidth = true, maxDropdownWidth = 400, path = "" }) {
	return (
		<div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
			<FLabel text={text} />
			<FAutocomplete 
				field={field} 
				list={list}
				keyval={keyval}
				holder={holder || text}
				option={option}
				className={className}
				wrapperClassName={wrapperClassName}
				maxResults={maxResults}
				minSearchLength={minSearchLength}
				searchFields={searchFields}
				onSearch={onSearch}
				allowCustomValue={allowCustomValue}
				autoFitWidth={autoFitWidth}
				maxDropdownWidth={maxDropdownWidth}
				path={path}
			/>
		</div>
	);
}

function CBButton({ save = true, saveOpt={}}) {
	return (
		<div className="flex justify-end">
			{save && (
				<button
					type="submit"
					className="btn btn-primary"
					disabled={saveOpt?.disabled ?? false}
				>
					Save Changes
				</button>
			)}
		</div>
	);
}

// function CTextArea({ text, field, holder, rows, css }) {
//   return (
//       <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
//           <FLabel text={text} />
//           <FTextArea field={field} holder={holder} rows={rows} css={css} />
//       </div>
//   );
// }

FormC.label = FLabel;
FormC.input = FInput;
FormC.select = FSelect;
FormC.autocomplete = FAutocomplete;
FormC.textarea = FTextArea;

FormC.text = Text;
FormC.date = TxtDate;
FormC.currency = Decimal;
FormC.number = Numeric;
FormC.password = Password;

FormC.LText = CText;
FormC.LDate = CDate;
FormC.LPassword = ColPassword;
FormC.LCurrency = CCurrency;
FormC.LNumber = CNumber;
FormC.LSelect = CSelect;
FormC.LAutocomplete = CAutocomplete;
FormC.FSave = CBButton;

export default FormC;
