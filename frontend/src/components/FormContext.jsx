import { createContext, useContext } from "react";
import TInput from "./Core/TInput";
import TSelect from "./Core/TSelect";

export const FormContext = createContext();

function FormC({ children, setValue, data, error, disabled }) {
	return (
		<FormContext.Provider value={{ setValue, data, error, disabled }}>
			{children}
		</FormContext.Provider>
	);
}
// function FLabel({ text, oCLass = "max-w-56" }) {
function FLabel({ text, oCLass = "max-w-56" }) {
	return <label className={`form-label ${oCLass}`}>{text}</label>;
}

function Text({
  field,
  value,
  onChange,
  holder = "",
  type = "text",
  css,
  option,
}) {
  const { setValue, data, error, disabled } = useContext(FormContext);
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
function TxtDate({
  field,
  value,
  onChange,
  holder = "",
  css,
  option,
}) {
  const { setValue, data, error, disabled } = useContext(FormContext);
  return (
    <Text
      type="date"
      option={option}
      css={css}
      field={field}
      value={value}
      onChange={onChange}
      holder={holder}
    />
  );
}
function Decimal({
  field,
  value,
  onChange,
  holder = "",
  css,
  option,
}) {
  const { setValue, data, error, disabled } = useContext(FormContext);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Benarkan input kosong
    if (inputValue === '') {
      onChange(e);
      return;
    }

    // Validasi format nombor dengan 2 tempat perpuluhan
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
      css={css}
      field={field}
      value={value}
      onChange={handleChange}
      holder={holder}
    />
  );
}
function Numeric({
  field,
  value,
  onChange,
  holder = "",
  css,
  option,
}) {
  const { setValue, data, error, disabled } = useContext(FormContext);

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
function Password({
  field,
  value,
  onChange,
  holder = "",
  css,
  option,
}) {
  const { setValue, data, error, disabled } = useContext(FormContext);
  return (
    <Text
      type="password"
      option={option}
      css={css}
      field={field}
      value={value}
      onChange={onChange}
      holder={holder}
    />
  );
}

function FInput({ field, holder = "", type = "text",option }) {
	const { setValue, data, error, disabled } = useContext(FormContext);
	return (
		<TInput
			data={data}
			field={field}
			setValue={setValue}
			error={error}
			holder={holder}
			type={type}
			option={option}
		/>
	);
}
function FSelect({ field, keyval, listArr, option, css }) {
	const { setValue, data, error, disabled } = useContext(FormContext);
	return (
		<TSelect
			className={css}
			data={data}
			setValue={setValue}
			field={field}
			keyval={keyval}
			error={error}
			list={listArr}
			option={{ ...option, disabled: option?.disabled || disabled }}
		/>
	);
}

function CSelect({ text, field, keyval, listArr, css }) {
	return (
		<div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
			<FLabel text={text} />
			<FSelect field={field} keyval={keyval} listArr={listArr} css={css} />
		</div>
	);
}
function CText({ text, field, holder, option }) {
  return (
    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
      <FLabel text={text} />
      <FInput field={field} holder={holder || text} option={option} />
    </div>
  );
}
function CCurrency({ text, field, holder, option }) {
	return (
    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
      <FLabel text={text} />
      <FInput
        type="number"
        field={field || text}
        holder={holder}
        option={option}
      />
    </div>
  );
}
function CNumber({ text, field, holder, option }) {
	return (
    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
      <FLabel text={text} />
      <FInput
        type="number"
        field={field || text}
        holder={holder}
        option={option}
      />
    </div>
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
function CDate({ text, field, holder, onChange }) {
	return (
    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
      <FLabel text={text} />
      <FInput field={field} holder={holder || text} type="date" />
    </div>
  );
}
function CBButton({ save = true, cancel = false ,saveOpt={}}) {
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
FormC.label = FLabel;
FormC.input = FInput;
FormC.select = FSelect;

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
FormC.FSave = CBButton;

export default FormC;
