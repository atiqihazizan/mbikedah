import Select from 'react-select';

export default function ReactSelect({
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
	autoFitWidth = false, // Auto-fit lebar dropdown dengan content
	maxDropdownWidth = 400, // Maksimum lebar dropdown dalam pixels
	fontSize = 'normal', // Saiz font: 'small', 'normal', 'large' atau custom value seperti '12px'
	label, // Label untuk field
	required = false, // Menandakan field wajib diisi
}) {
	// Pastikan list adalah array
	const safeList = Array.isArray(list) ? list : [];
	
	// Pastikan keyval wujud dan dalam format yang betul
	// Contoh: 'id,name' atau 'id,code,name' atau 'id,code|name'
	const keyvalParts = (keyval || '').split(',');
	const oKey = keyvalParts[0] || 'id';
	const oValParts = keyvalParts.slice(1); // Ambil semua bahagian selepas kunci

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

	// Transform list to react-select options format
	const options = safeList.map((item) => {
		const value = item?.[oKey];
		const label = generateLabel(item);
		const isDisabled = disabledOptions ? disabledOptions(item) : false;
		
		return {
			value: value,
			label: label,
			isDisabled: isDisabled,
			originalItem: item // Keep reference to original item
		};
	});

	// Get current selected option
	const selectedOption = options.find(opt => opt.value === data?.[field]) || null;

	// Calculate auto-fit width for dropdown
	const calculateDropdownWidth = () => {
		if (!autoFitWidth) return 'auto';
		
		// Calculate the longest option text length
		let maxTextLength = 0;
		options.forEach(option => {
			if (option.label && option.label.length > maxTextLength) {
				maxTextLength = option.label.length;
			}
		});
		
		// Estimate width based on text length (approximately 8px per character + padding)
		const estimatedWidth = Math.min(maxTextLength * 8 + 40, maxDropdownWidth);
		return `${estimatedWidth}px`;
	};

	// Calculate font size
	const getFontSize = () => {
		switch (fontSize) {
			case 'small':
				return '12px';
			case 'normal':
				return '14px';
			case 'large':
				return '16px';
			default:
				// If custom value is provided (e.g., '13px', '1rem')
				return fontSize === 'normal' ? '14px' : fontSize;
		}
	};

	function handleChange(selectedOption) {
		const newValue = selectedOption ? selectedOption.value : '';
		
		// Always update the form data first
		const newData = { ...data, [field]: newValue };
		setValue(newData);
		
		// Then call custom onChange if provided
		if (onChange) {
			// Create a synthetic event object for compatibility
			const syntheticEvent = {
				target: { value: newValue }
			};
			onChange(syntheticEvent);
		}
	}

	// Custom styles to match existing design
	const customStyles = {
		control: (provided, state) => ({
			...provided,
			minHeight: '38px',
			border: state.isFocused ? '1px solid #3B82F6' : '1px solid #D1D5DB',
			borderRadius: '0.375rem',
			boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
			fontSize: getFontSize(),
			'&:hover': {
				border: state.isFocused ? '1px solid #3B82F6' : '1px solid #9CA3AF'
			},
			backgroundColor: option?.disabled ? '#F3F4F6' : 'white',
			cursor: option?.disabled ? 'not-allowed' : 'default'
		}),
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isSelected 
				? '#3B82F6' 
				: state.isFocused 
					? '#EBF8FF' 
					: state.isDisabled 
						? '#F3F4F6' 
						: 'white',
			color: state.isSelected 
				? 'white' 
				: state.isDisabled 
					? '#9CA3AF' 
					: '#374151',
			cursor: state.isDisabled ? 'not-allowed' : 'pointer',
			fontSize: getFontSize(),
			'&:active': {
				backgroundColor: state.isDisabled ? '#F3F4F6' : '#3B82F6'
			}
		}),
		singleValue: (provided) => ({
			...provided,
			color: '#374151',
			fontSize: getFontSize()
		}),
		placeholder: (provided) => ({
			...provided,
			color: '#9CA3AF',
			fontSize: getFontSize()
		}),
		menu: (provided) => ({
			...provided,
			width: calculateDropdownWidth(),
			minWidth: autoFitWidth ? '100%' : 'auto'
		}),
		menuPortal: base => ({ ...base, zIndex: 9999 })
	};

	// Generate unique id for accessibility
	const id = `react-select-${field}`;

	return (
		<div className={`flex flex-col w-full ${wrapperClassName || ''}`}>
			{label && (
				<label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<Select
				inputId={id}
				options={options}
				value={selectedOption}
				onChange={handleChange}
				placeholder={placeholder}
				isDisabled={option?.disabled}
				isSearchable={true}
				isClearable={true}
				styles={customStyles}
				className={className || ''}
				classNamePrefix="react-select"
				menuPortalTarget={document.body}
				isOptionDisabled={(option) => option.isDisabled}
				noOptionsMessage={() => "Tiada pilihan"}
				loadingMessage={() => "Memuatkan..."}
			/>
			{error?.[field] && (
				<span className="text-xs mt-2 text-red-600">
					{error?.[field]}
				</span>
			)}
		</div>
	);
}
