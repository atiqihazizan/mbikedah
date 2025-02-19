import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import Table from "../components/TableRow";
import JenazahPrint from "./jenazah/print";

function Jenazah() {
	const { showToast, showSpinner } = useStateContext();
	const [dataRows, setRows] = useState([]);
	const [meta, setMeta] = useState({});
	const [loading, setLoading] = useState(true);
	const [searchParams, setSearchParams] = useSearchParams();
	const [maxCal] = useState(()=>new Date().toISOString().slice(0, 7),)
	const [calYM,setCalYM] = useState(maxCal)
	const [dataPrint, setDataPrint] = useState({});
	const [isPrint,setIsPrint] = useState(false);
	const contentPrint = useRef(null);
	const usePrintOut = useReactToPrint({
		content: () => contentPrint.current,
	});

	const columns = [
		{
			name: "Tarikh",
			class: "pl-5 w-[120px]",
			classRow: "pl-5",
			field: "jdate",
		},
		{ name: "Nama Arwah", class: "w-[350px]", classRow: "", field: "name" },
		{ name: "Alamat Rumah", class: "w-auto", field: "alamat" },
		{ name: "No Lorong", class: "w-[110px] text-center", classRow:"text-center", field: "lorong" },
		{ name: "No Lubang", class: "w-[110px] text-center", classRow:"text-center", field: "lubang" },
		{ name: "Belanja", class: "w-[80px] text-right", classRow: "text-right", field: "cost" },
		{ name: "Diurus Oleh", class: "w-[110px]", classRow: "", field: "type" },
		{
			name: "",
			class: "w-[50px]",
			nClassRow: "px-3",
			render: ({ id }) => (
				<div className="flex gap-0.5">
					<TButton
						nClasses="btn btn-sm btn-icon btn-clear btn-primary"
						to={`/jenazah/${id}`}
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
			checkedState.forEach((c, i) =>
				axiosClient.delete(`/jenazah/${dataRows[i].id}`).then(() => {
					fetchData();
					showToast("Maklumat berjaya dihapus");
				})
			);
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
		} else if (pageNum) {
			url = `/jenazah/?page=${pageNum}`;
		} else url = "/jenazah";

		showSpinner(true, "Tunggu sebentar...");
		axiosClient.get(url).then(({ data: { data, meta, ...other } }) => {
			setRows(data);
			setMeta(meta);
			setLoading(false);
			showSpinner(false);
		});
	};

	const onPrint = () => {
		// showSpinner(true, "Tunggu sebentar...");
		axiosClient.get(`/jenazah/report/${calYM}`).then((req) => {
			const {data} = req.data;
			// if(data.length === 0) {
			// 	alert('Rekod tiada untuk cetak!!!')
			// 	return;
			// }

			const defArr = Array(27 - data.length).fill({
				name: "",
				alamat: "",
				cost: "",
				lubang: "",
				lorong: "",
				jdate: "",
				typId: 0,
			});
			const arr = calYM.split("-");
			const ym =
				arr[0].length == 2
					? calYM.replace("-", " / ")
					: [arr[1], arr[0]].join(" / ");
			const pre = {
				yrmth: ym,
				total:
					data.length > 0
						? data.reduce((p, a) => p + parseFloat(a.cost.replace(',','')), 0)
						: 0,
				details: [...data, ...defArr],
			};
			setDataPrint(pre)
			setIsPrint(true)
		// setTimeout(() => {
		// 	usePrintOut();
		// // 	showSpinner(false);
		// }, 500);
		});
	};
	useEffect(()=>{
		if (dataPrint && contentPrint && isPrint) {
			usePrintOut();
			setIsPrint(false)
		}
	},[dataPrint])

	useEffect(() => fetchData(), []);

	return (
		<PageComponent
			title="Jenazah"
			buttons={
				<div className="flex gap-2">
					<input
						type="month"
						className="input"
						min="2023-01"
						max={maxCal}
						value={calYM}
						onChange={(ev) => setCalYM(ev.target.value)}
					/>
					<TButton onClick={onPrint}>Cetak</TButton>
					<TButton color="green" to="/jenazah/new">
						<PlusCircleIcon className="h-6 w-6 mr-2" />
						Create New
					</TButton>
				</div>
			}
		>
			<Table
				columns={columns}
				loading={loading}
				data={dataRows}
				meta={meta}
				onReload={fetchData}
				tOption={{
					checkable: false,
					oClassParent: "overflow-x-auto h-[calc(100vh-152px)]",
				}}
			/>
			<div className="hidden">
				<JenazahPrint ref={contentPrint} data={dataPrint} />
			</div>
		</PageComponent>
	);
}

export default Jenazah;
