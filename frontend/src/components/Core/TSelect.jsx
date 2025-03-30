export default function TSelect({
	field,
	setValue,
	data,
	list,
	keyval,
	error,
	option,
	className,
	wrapperClassName,
}) {
	// Pastikan list adalah array
	const safeList = Array.isArray(list) ? list : [];
	
	// Pastikan keyval wujud dan dalam format yang betul
	const [oKey = 'id', oVal = 'name'] = (keyval || '').split(',');
	
	function onChange(ev) {
		setValue({ ...data, [field]: ev.target.value });
	}

	return (
		<div className={`flex flex-col w-full ${wrapperClassName || ''}`}>
			<select 
				className={`select ${option?.disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
				onChange={onChange} 
				value={data?.[field] || ''}
				{...option}
			>
				<option value="">Pilih</option>
				{safeList.map((item, index) => {
					// Pastikan nilai wujud
					const value = item?.[oKey];
					const label = item?.[oVal] || 'Tiada Label';
					
					return (
						<option key={index} value={value}>
							{label}
						</option>
					);
				})}
			</select>
			{error?.[field] && (
				<span className="text-xs mt-2 text-red-600">
					{error?.[field]}
				</span>
			)}
		</div>
	);
}
