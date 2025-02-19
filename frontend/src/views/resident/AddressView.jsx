import Card from "../../components/Card";

export default function AddressView({ address }) {
	const { addr, addr2, addr3, poskod, kawasan } = address;
	const columns = [
		{
			name: "label",
			class: "",
			field: "label",
			nClassRow: "py-2",
			// nClassRow: "text-sm font-medium text-gray-500 pb-3.5 pe-3",
		},
		{
			name: "text",
			class: "",
			field: "text",
			nClassRow: "py-2 text-gray-700 text-sm",
			// nClassRow: "text-sm font-medium text-gray-800 pb-3.5",
		},
	];

	const dataView = [
		{ label: "No Rumah", text: addr, class: false },
		{ label: "Jalan", text: addr2, class: false },
		{ label: "Lorong", text: addr3, class: false },
		{ label: "Poskod", text: poskod, class: false },
		{ label: "Masjid/Surau", text: kawasan?.toUpperCase(), class: false },
	];

	const option = {
		headable: false,
		checkable: false,
		nClassTable: "table align-middle text-sm text-gray-500",
	};

	return (
		<Card>
			<Card.Header title="Alamat Rumah" />
			<Card.Table columns={columns} data={dataView} oOption={option}/>
		</Card>
	);
}

{/* <table className="table-auto">
	<tbody>
		<tr>
			<td className="text-sm font-medium text-gray-500 pb-3.5 pe-3">
				Age
			</td>
			<td className="text-sm font-medium text-gray-800 pb-3.5">32</td>
		</tr>
		<tr>
			<td className="text-sm font-medium text-gray-500 pb-3.5 pe-3">
				City:
			</td>
			<td className="text-sm font-medium text-gray-800 pb-3.5">
				Amsterdam
			</td>
		</tr>
		<tr>
			<td className="text-sm font-medium text-gray-500 pb-3.5 pe-3">
				State:
			</td>
			<td className="text-sm font-medium text-gray-800 pb-3.5">
				North Holland
			</td>
		</tr>
		<tr>
			<td className="text-sm font-medium text-gray-500 pb-3.5 pe-3">
				Country:
			</td>
			<td className="text-sm font-medium text-gray-800 pb-3.5">
				Netherlands
			</td>
		</tr>
		<tr>
			<td className="text-sm font-medium text-gray-500 pb-3.5 pe-3">
				Postcode:
			</td>
			<td className="text-sm font-medium text-gray-800 pb-3.5">
				1092 NL
			</td>
		</tr>
		<tr>
			<td className="text-sm font-medium text-gray-500 pb-3.5 pe-3">
				Phone:
			</td>
			<td className="text-sm font-medium text-gray-800 pb-3.5">
				+31 6 1234 56 78
			</td>
		</tr>
		<tr>
			<td className="text-sm font-medium text-gray-500 pb-3.5 pe-3">
				Email:
			</td>
			<td className="text-sm font-medium text-gray-800 pb-3.5">
				<a className="text-gray-800 hover:text-primary-active" href="#">
					jenny@ktstudio.com
				</a>
			</td>
		</tr>
	</tbody>
</table> */}
