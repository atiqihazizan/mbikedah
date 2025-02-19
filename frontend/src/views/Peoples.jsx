import {
	PencilIcon,
	PlusCircleIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import Table from "../components/TableRow";

function Peoples() {
	const { showToast, showSpinner } = useStateContext();
	const [peoples, setPeoples] = useState([]);
	const [meta, setMeta] = useState({});
	const [loading, setLoading] = useState(true);
	const [checkedState, setCheckedState] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams();

	// id, name, nokp, nickname, mobile, kesihatan, perkahwinan, pelajaran
	// classRow: "pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white",
	const columns = [
		{
			name: "Nama Penuh",
			class: "pl-6 min-w-[350px]",
			classRow: "pl-6",
			field: "name",
		},
		{ name: "Panggilan", class: "w-[150px]", field: "nickname", classRow: "" },
		{ name: "Telefon", class: "w-[95px]", field: "mobile", classRow: "" },
		{
			name: "Kesihatan",
			class: "w-[100px] text-right",
			classRow: "text-right",
			field: "kesihatan",
		},
		{
			name: "Perkahwinan",
			class: "w-[115px]",
			field: "perkahwinan",
			classRow: "",
		},
		{ name: "Pelajaran", class: "w-[110px]", field: "pelajaran", classRow: "" },
		{
			class: "w-[50px]",
			nClassRow: "px-3",
			render: ({ id, addr_id }) => (
				<div className="flex justify-around">
					<TButton
						nClasses="btn btn-sm btn-icon btn-clear btn-light"
						to={`./${addr_id}`}
					>
						<i className="ki-filled ki-notepad"></i>
					</TButton>
					{/* <TButton
						nClasses="btn btn-sm btn-icon btn-clear btn-light"
						onClick={() => onDelete(id)}
					>
						<i className="ki-filled ki-trash"></i>
					</TButton> */}
				</div>
			),
		},
	];

	// const onDeleteMulti = (id) => {
	// 	if (window.confirm("Anda pasti hendak buang?")) {
	// 		checkedState.forEach(
	// 			(c, i) => c && console.log(peoples[i].name)
	// 			// axiosClient.delete(`/survey/${houses[i]}`).then(() => {
	// 			//   getResidency();
	// 			//   showToast("The survey was deleted");
	// 			// })
	// 		);
	// 	}
	// };
	// const onDelete = (id) => {
	// 	const p = peoples.filter(p =>p.id == id)[0];
	// 	console.log(p)
	// 	if (window.confirm(`Anda pasti hendak buang '${p.name}?`)) {
	// 		checkedState.forEach(
	// 			(c, i) => c && handleDelete(id)
	// 		);
	// 	}
	// };
	// const handleDelete = (id)=>{
	// 	return;
	// 	axiosClient.delete(`/survey/${id}`).then(() => {
	// 		getResidency();
	// 		showToast("The survey was deleted");
	// 	});
	// }

	const getResidency = (url) => {
		const pageNum = searchParams.get("page");

		if (url) {
			const arr = url.split("/");
			const newArr = [
				...arr.slice(0, arr.length - 1),
				"mta2",
				...arr.slice(-1),
			];
			url = newArr.join("/");
		} else if (pageNum) url = `/kariah/?page=${pageNum}`;
		else url = "/kariah";
		showSpinner(true, "Tunggu sebentar...");
		axiosClient.get(url).then(({ data: { data, meta, ...other } }) => {
			setPeoples(data);
			setMeta(meta);
			setLoading(false);
			showSpinner(false);
		});
	};
	useEffect(() => getResidency(), []);

	return (
		<PageComponent
			title="Anak Kariah"
			buttons={
				<div className="flex">
					{/* {checkedState.filter(c=>c).length > 0 && (
						<TButton isClasses="mr-2" color="red" onClick={onDeleteClick}>
							<TrashIcon className="h-6 w-6 mr-2" />
							Selected {checkedState.filter(c=>c).length}
						</TButton>
					)}
					{checkedState.filter((c) => c).length === 1 && (
							<TButton isClasses="mr-2" color="green" onClick={onEdit}>
								<PencilIcon className="h-6 w-6 mr-2" /> Edit
							</TButton>
					)} */}
				</div>
			}
		>
			<Table
				columns={columns}
				loading={loading}
				data={peoples}
				meta={meta}
				onReload={getResidency}
				onChecked={setCheckedState}
				tOption={{
					checkable: false,
					oClassParent: "overflow-x-auto h-[calc(100vh-152px)]",
				}}
			/>
		</PageComponent>
	);
}

export default Peoples;
