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
	maxLength = 30, // Panjang maksimum label sebelum dipotong
	placeholder = "Pilih",
	onChange,
	disabledOptions, // Function untuk menentukan option mana yang perlu di-disable
	// Contoh: disabledOptions: (item) => item.total === 0
}) {
	// Destructure option untuk memisahkan disabledOptions dari props yang akan di-pass ke DOM
	const { disabledOptions: _, ...domProps } = option || {};
	// Pastikan list adalah array
	const safeList = Array.isArray(list) ? list : [];
	
	// Pastikan keyval wujud dan dalam format yang betul
	// Contoh: 'id,name' atau 'id,code,name' atau 'id,code|name'
	const keyvalParts = (keyval || '').split(',');
	const oKey = keyvalParts[0] || 'id';
	const oValParts = keyvalParts.slice(1); // Ambil semua bahagian selepas kunci
	
	function handleChange(ev) {
		setValue({ ...data, [field]: ev.target.value });
	}

	// Fungsi untuk memotong teks yang terlalu panjang
	function truncateText(text, maxLen = maxLength) {
		if (!text) return '';
		if (maxLen === null) return text;
		return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
	}

	// Fungsi untuk menjana label berdasarkan pelbagai nilai
	function generateLabel(item) {
		// Jika tiada bahagian nilai, gunakan 'name' sebagai default
		if (oValParts.length === 0) {
			return truncateText(item?.['name'] || 'Tiada Label');
		}
		
		// Jika hanya ada satu bahagian nilai
		if (oValParts.length === 1) {
			return truncateText(item?.[oValParts[0]] || 'Tiada Label');
		}
		
		// Jika ada beberapa bahagian nilai, gabungkan dengan pemisah yang sesuai
		const combinedLabel = oValParts.map(part => {
			// Periksa jika bahagian mengandungi pemisah khas
			if (part.includes('|')) {
				// const [fieldName, separator] = part.split('|');
				const [fieldName] = part.split('|');
				return item?.[fieldName] || '';
			} else {
				return item?.[part] || '';
			}
		}).filter(Boolean).join(' - '); // Gabungkan dengan pemisah ' - '
		
		return truncateText(combinedLabel);
	}

	return (
		<div className={`flex flex-col w-full ${wrapperClassName || ''}`}>
			<select 
				className={`select ${option?.disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className || ''}`}
				onChange={onChange || handleChange} 
				value={data?.[field] || ''}
				{...domProps}
			>
				<option value="">{placeholder}</option>
				{safeList.map((item, index) => {
					// Pastikan nilai wujud
					const value = item?.[oKey];
					const label = generateLabel(item);
					
					// Check if this option should be disabled
					const isDisabled = disabledOptions ? disabledOptions(item) : false;
					
					return (
						<option 
							key={index} 
							value={value} 
							disabled={isDisabled}
							className={isDisabled ? 'text-gray-400 bg-gray-100' : ''}
						>
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
