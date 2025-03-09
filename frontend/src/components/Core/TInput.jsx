export default function TInput({
	field,
	setValue,
	data,
	holder,
	error,
	option,
	type = "text",
  inputCss = false,
}) {
  let newCss = ['input']
	function onChange(ev) {
		setValue({ ...data, [field]: ev.target.value });
	}

  if(inputCss !== false) newCss.push(inputCss)

	return (
		<div className="flex flex-col w-full">
			<input
				className={`${newCss.join(' ')} ${option?.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
				type={type}
				placeholder={holder}
				value={data?.[field] ?? ""}
				onChange={onChange}
				{...option}
			/>
			{error?.[field] && (
				<span className="text-xs mt-2 text-red-600">{error?.[field]}</span>
			)}
		</div>
	);
}
