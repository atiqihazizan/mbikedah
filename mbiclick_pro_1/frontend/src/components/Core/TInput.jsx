// components/Core/TInput.jsx
export default function TInput({field,setValue,data,holder,error,option,type = "text",inputCss = false,multiline = false,rows = 3,onChange = null,path=""}) {
	let newCss = ['input'];

	// Fungsi untuk mendapatkan nilai dari path yang diberikan
  const getValue = (obj, path) => {
    if (!path) return obj?.[field] ?? "";
    return path.split('.').reduce((acc, curr) => acc?.[curr], data) ?? "";
  };

  // Fungsi untuk mengupdate nilai di path yang diberikan
  const updateValue = (obj, path, value) => {
    if (!path) {
      return { ...obj, [field]: value };
    }
    const paths = path.split('.');
    const lastKey = paths.pop();
    let current = obj;
    for (let key of paths) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    current[lastKey] = value;
    return obj;
  };

  // Fungsi handleChange yang menggunakan path
  const handleChange = (e) => {
    const newValue = e.target.value;
    const newData = updateValue(data, path, newValue);
    setValue(newData);
    if (onChange) onChange(e);
  };
	
  if (multiline) {
    newCss = [
      'textarea',
      'block',
      'w-full',
      'rounded-md',
      'border-gray-300',
      'shadow-sm',
      'focus:ring-blue-500',
      'focus:border-blue-500',
      // 'sm:text-sm',
      'resize-none'
    ];
  } else {
    newCss = [
      'input',
      'block',
      'w-full',
      'rounded-md',
      'border-gray-300',
      'shadow-sm',
      'focus:ring-blue-500',
      'focus:border-blue-500',
      // 'sm:text-sm'
    ];
  }
	
	if (inputCss !== false) newCss.push(inputCss);

	const InputComponent = multiline ? 'textarea' : 'input';

	return (
		<div className="flex flex-col w-full">
			<InputComponent
				className={`${newCss.join(' ')} ${option?.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
				type={type}
				placeholder={holder}
				value={getValue(data, path)}
        onChange={onChange ? onChange : handleChange}
				rows={multiline ? rows : undefined}
				{...option}
			/>
			{error?.[field] && (
				<span className="text-xs mt-2 text-red-600">{error?.[field]}</span>
			)}
		</div>
	);
}