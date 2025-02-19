import { useEffect, useState } from "react";
import Card from "../../components/Card";

export default function PeopleView({title, data , cols}) {
	const [columns,setColumns] = useState();
	const _cols = [
		{
			name: "Nama",
			field: "name",
			nClass: "text-left",
			nClassRow: "text-left",
		},
		{
			name: "No. K/P",
			field: "nokp",
			nClass: "w-[100px] text-left",
			nClassRow: "text-left text-sm font-normal text-gray-700",
		},
		{
			name: "No. Tel",
			field: "mobile",
			nClass: "w-[100px] text-left",
			nClassRow: "text-left text-sm font-normal text-gray-700",
		},
		{
			name: "Pelajaran",
			field: "edustatus",
			nClass: "w-[110px] text-left",
			nClassRow: "text-left text-sm font-normal text-gray-700",
		},
		{
			name: "Hubungan",
			field: "sibling",
			nClass: "w-[110px] text-left",
			nClassRow: "text-left text-sm font-normal text-gray-700",
		},
		{
			name: "Pekerjaan",
			field: "employee",
			nClass: "w-[110px] text-left",
			nClassRow: "text-left text-sm font-normal text-gray-700",
		},
		{
			name: "Penyakit",
			field: "penyakit",
			nClass: "w-[250px] text-left",
			nClassRow: "text-left text-sm font-normal text-gray-700",
		},
	];

	const option = {
		headable: false,
		checkable: false,
		nClassTable: "table-auto",
	};

	useEffect(()=>{
		const ar = cols.split(',')
		const aCol = _cols.filter(f=>ar.includes(f.field)).map(c=>c);
		setColumns(aCol);
	},[])

	return (
		<Card>
			<Card.Header title={title} />
			<Card.Table columns={columns} data={data}/>
		</Card>
	);
}
