import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import Table from "../components/TableRow";

function Letter() {
	const { showToast, showSpinner } = useStateContext();
	const [letters, setLetters] = useState([]);
	const [meta, setMeta] = useState({});
	const [loading, setLoading] = useState(true);
	const [checkedState, setCheckedState] = useState([]);
	const [countChecked, setCountChecked] = useState(0);
	const [searchParams, setSearchParams] = useSearchParams();

	const columns = [
		{
			name: "Tarikh Terima",
			class: "pl-5 w-[150px]",
			classRow: "pl-5",
			field: "rcvd_at",
		},
		{ name: "Tarikh Surat", class: "w-[110px]", classRow: "", field: "ltdate" },
		{ name: "Daripada", class: "w-[250px]", field: "lfrom" },
		{ name: "Perkara", class: "min-w-[100px] w-auto", field: "ltdesc" },
		{ name: "Tarikh Akhir", class: "w-[110px]", classRow: "", field: "ltdue" },
		{ name: "U/P Biro", class: "w-[200px]", classRow: "", field: "biro_act" },
		{
			name: "U/P Pengerusi",
			class: "w-[200px]",
			classRow: "",
			field: "chairman_act",
		},
		{
			name: "",
			class: "w-[50px]",
			nClassRow: "px-3",
			render: ({ id }) => (
				<div className="flex gap-0.5">
					<TButton
						nClasses="btn btn-sm btn-icon btn-clear btn-primary"
						to={`/letters/${id}`}
					>
						<i className="ki-filled ki-notepad-edit"></i>
					</TButton>
					<TButton
						nClasses="btn btn-sm btn-icon btn-clear btn-light"
						onClick={() => onDelete(id)}
					>
						<i className="ki-filled ki-trash"></i>
					</TButton>
				</div>
			),
		},
	];
	const onDelete = (id) => {
		if (window.confirm("Anda pasti hendak buang?")) {
			axiosClient.delete(`/letter/${id}`).then(() => {
				getFetchData();
				showToast("Rekod berjaya di buang");
			});
		}
	};
	const onDeleteMulti = () => {
		if (window.confirm("Anda pasti hendak buang?")) {
			checkedState.forEach(
				(c, i) => c && showToast(letters[i].id)
				// axiosClient.delete(`/survey/${letters[i]}`).then(() => {
				//   getFetchData();
				//   showToast("The survey was deleted");
				// })
			);
		}
	};

	const getFetchData = (url) => {
		const chkUrl = url;
		const pageNum = searchParams.get("page");

		if (url) {
			const arr = url.split("/");
			const newArr = [
				...arr.slice(0, arr.length - 1),
				"mta2",
				...arr.slice(-1),
			];
			url = newArr.join("/");
		} else if (pageNum) {
			url = `/letter/?page=${pageNum}`;
		} else url = "/letter";

		showSpinner(true, "Tunggu sebentar...");
		axiosClient.get(url).then(({ data: { data, meta, ...other } }) => {
			const newArr = new Array(data.length).fill(false);
			setLetters(data);
			setMeta(meta);
			setLoading(false);
			setCheckedState(newArr);
			showSpinner(false);
		});
	};
	useEffect(() => getFetchData(), []);

	return (
		<PageComponent
			title="Terima Surat"
			buttons={
				<div className="flex">
					{countChecked > 0 && (
						<TButton isClasses="mr-2" color="danger" onClick={onDeleteMulti}>
							<TrashIcon className="h-6 w-6 mr-2" />
							Selected {countChecked}
						</TButton>
					)}
					<TButton color="primary" to="/letters/new">
						<PlusCircleIcon className="h-6 w-6 mr-2" />
						Create New
					</TButton>
				</div>
			}
		>
			<Table
				columns={columns}
				loading={loading}
				data={letters}
				meta={meta}
				onReload={getFetchData}
				tOption={{
					checkable: false,
					oClassParent: "overflow-x-auto h-[calc(100vh-152px)]",
				}}
			/>
		</PageComponent>
	);
}

export default Letter;
