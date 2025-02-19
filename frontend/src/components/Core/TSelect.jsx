export default function TSelect({
	field,
	setValue,
	data,
	list = [],
	keyval,
	error,
	option,
}) {
	const oKey = keyval.split(",")[0];
	const oVal = keyval.split(",")[1];
	function onChange(ev) {
		setValue({ ...data, [field]: ev.target.value });
	}

	return (
		<div className="flex flex-col w-full">
			<select className="select" onChange={onChange} value={data?.[field]}>
				<option value="">Pilih</option>
				{list.map((e, i) => (
					<option key={i} value={e[oKey]}>
						{e[oVal]}
					</option>
				))}
			</select>
			{error?.[field] && (
				<span className="text-xs mt-2 text-red-600">
					{error?.[field]}
				</span>
			)}
		</div>
	);
}
