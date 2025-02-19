import { TrashIcon, PlusCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import Table from "../components/TableRow";
// import PaginationLinks from "../components/PaginationLinks";

function Address() {
	const navigator = useNavigate();
	const { showToast, showSpinner } = useStateContext();
	const [addresses, setAddr] = useState([]);
	const [meta, setMeta] = useState({});
	const [loading, setLoading] = useState(true);
	const [checkedState, setCheckedState] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
	const columns = [
		{
			name: "Alamat",
			class: "min-w-[350px]",
			field: "address",
			classRow: "text-sm",
		},
		// classRow: "font-medium text-gray-900 whitespace-nowrap dark:text-white pl-6",
		{ name: "Kawasan", class: "w-[190px]", field: "area", classRow:"text-sm" },
		{ name: "Ketua Rumah", class: "w-[360px]", field: "ketua.name", classRow:"text-sm" },
		{ name: "No. Hubungi", class: "w-[112px]", field: "ketua.mobile" },
		{
			name: "Bil. Isi Rumah",
			class: "w-[110px]",
			field: "bilangan",
			classRow: "text-center ",
		},
		{
			name: "",
			class: "w-[50px]",
			nClassRow: "px-3",
			render: ({ id }) => (
				<div className="flex gap-0.5">
					<TButton
						nClasses="btn btn-sm btn-icon btn-clear btn-light"
						to={`./${id}`}
					>
						<i className="ki-filled ki-notepad"></i>
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
		if (window.confirm("Anda pasti hendak buang rekod ini?")) fetchDelete(id)
	};
	const onMultiDelete = () => {
		if (window.confirm("Anda pasti hendak buang semua rekod ini?")) {
			checkedState.forEach(
				(c, i) => c && fetchDelete(addresses[i].addr.id)
			);
		}
	};

	const fetchDelete = (id)=>{
		return;
		axiosClient.delete(`/address/${id}/delete`).then(() => {
		  getAddress();
		  showToast("Rekod alamat ini telah dipadam");
		})
	}

	const getAddress = (url) => {
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
			url = `/address/?page=${pageNum}`;
		} else url = "/address";

		// url = url || "/address";
		showSpinner(true, "Tunggu sebentar...");
		axiosClient.get(url).then(({ data: { data, meta, ...other } }) => {
			const newArr = new Array(data.length).fill(false);
			setAddr(data);
			setMeta(meta);
			setLoading(false);
			setCheckedState(newArr);
			showSpinner(false);
		});
	};
	useEffect(() => getAddress(), []);

	return (
		<PageComponent
			title="Perumahan"
			buttons={
				<div className="flex">
					{/* {checkedState.filter((c) => c).length > 0 && (
							<TButton isClasses="mr-2" color="danger" onClick={onMultiDelete}>
								<TrashIcon className="h-6 w-6 mr-2" />
								Selected {checkedState.filter((c) => c).length}
							</TButton>
					)} */}
					<TButton color="primary" to="#">
						<PlusCircleIcon className="h-6 w-6 mr-2" />
						Create New
					</TButton>
				</div>
			}
		>
			<Table
				columns={columns}
				loading={loading}
				data={addresses}
				meta={meta}
				onReload={getAddress}
				onChecked={setCheckedState}
				tOption={{
					checkable: false,
					// oClassParent:"scrollable-x-auto overflow-x-auto h-[calc(100vh-152px)]"
					oClassParent: "overflow-x-auto h-[calc(100vh-152px)]",
				}}
			/>
		</PageComponent>
	);
}

export default Address;
