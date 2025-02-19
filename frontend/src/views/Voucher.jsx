import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import Table from "../components/TableRow";
import VoucherPrint from "./voucher/print";

function Voucher() {
	const {
		showToast,
		showSpinner,
	} = useStateContext();
	const [voucher, setVoucher] = useState([]);
	const [meta, setMeta] = useState({});
	const [loading, setLoading] = useState(true);
	const [searchParams] = useSearchParams();
	const [selectData, setSelectData] = useState(null);
	const contentPrint = useRef(null);
	const usePrintOut = useReactToPrint({
		content: () => contentPrint.current,
	});

	const columns = [
		{
			name: "Tarikh Masa",
			class: "pl-6 w-[120px]",
			classRow: "pl-6",
			field: "vdate",
		},
		{ name: "Baucar No", class: "w-[100px]", field: "vno" },
		{
			name: "Jumlah",
			class: "w-[100px] text-right",
			field: "total",
			classRow: "text-end",
		},
		{ name: "Kepada", class: "w-[300px]", field: "name" },
		{ name: "Bayaran Untuk", class: "w-auto", field: "description" },
		{
			name: "",
			class: "w-[50px]",
			nClassRow: "px-3",
			render: ({ id }) => {
				const pageNum = searchParams.get("page");
				let pages = `/voucher/${id}`
				if (pageNum) pages += `?page=${pageNum}`
				return (
					<div className="flex justify-around">
						<TButton
							nClasses="btn btn-sm btn-icon btn-clear btn-info"
							onClick={() => onPrint(id)}
						>
							<i className="ki-filled ki-printer"></i>
						</TButton>
						<TButton
							nClasses="btn btn-sm btn-icon btn-clear btn-primary"
							to={pages}
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
				);
			},
		},
	];

	const onPrint = (id) => {
		showSpinner(true, "Tunggu sebentar...");
		const data = { ...voucher.find((e) => e.id == id) };
		// axiosClient.get(`/voucher/${id}`).then((req) => {
		// 	const data = req.data;
		setSelectData(data);
		setTimeout(() => {
			usePrintOut();
			showSpinner(false);
		}, 500);
		// });
	};

	const onDelete = (id) => {
		if (window.confirm("Anda pasti hendak buang rekod ini?")) {
			return;
			axiosClient.delete(`/voucher/${id}`).then(() => {
				fetchData();
				showToast("Rekod berjaya dibuang");
			});
		}
	};

	const fetchData = (url) => {
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
		} else if (pageNum) url = `/voucher/?page=${pageNum}`;
		else url = "/voucher";

		setSelectData(null);
		showSpinner(true, "Tunggu sebentar...");
		axiosClient.get(url).then(({ data: { data, meta, ...other } }) => {
			setVoucher(data);
			setMeta(meta);
			setLoading(false);
			showSpinner(false);
		});
	};
	useEffect(() => fetchData(), []);

	return (
		<PageComponent
			title="Baucar Bayaran"
			buttons={
				<TButton color="primary" to="./new">
					<PlusCircleIcon className="h-6 w-6 mr-2" />
					Create New
				</TButton>
			}
		>
			<Table
				columns={columns}
				loading={loading}
				data={voucher}
				meta={meta}
				onReload={fetchData}
				// onChecked={setCheckedState}
				tOption={{
					checkable: false,
					oClassParent: "overflow-x-auto h-[calc(100vh-152px)]",
				}}
			/>

			{selectData && (
				<div className="hidden">
					<VoucherPrint
						ref={contentPrint}
						data={selectData}
					></VoucherPrint>
				</div>
			)}
		</PageComponent>
	);
}

export default Voucher;
