// components/Core/TInput.jsx
export default function TInput({
	field,
	setValue,
	data,
	holder,
	error,
	option,
	type = "text",
	inputCss = false,
	multiline = false,
	rows = 3,
}) {
	let newCss = ['input'];
	
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
				value={data?.[field] ?? ""}
				onChange={(e) => setValue({ ...data, [field]: e.target.value })}
				rows={multiline ? rows : undefined}
				{...option}
			/>
			{error?.[field] && (
				<span className="text-xs mt-2 text-red-600">{error?.[field]}</span>
			)}
		</div>
	);
}