import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import Table from "../components/TableRow";
import TabungPrint from "./tabung/print";

function Tabung() {
	const {
		showToast,
		showSpinner,
		userCount,
		typeMoney,
		setTypeMoney,
		tabungType,
		itemBernilai,
	} = useStateContext();
	const [tabung, setTabung] = useState([]);
	const [meta, setMeta] = useState({});
	const [loading, setLoading] = useState(true);
	const [checkedState, setCheckedState] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectData, setSelectData] = useState(null);
	const contPrint = useRef(null);
	const usePrintOut = useReactToPrint({
		content: () => contPrint.current,
	});

	const columns = [
		{
			name: "Tarikh Masa",
			class: "pl-6 w-[160px]",
			classRow: "pl-6",
			field: "dateTime",
		},
		{ name: "Baucar No", class: "w-[100px]", field: "voucher" },
		{ name: "Jenis Tabung", class: "w-[135px]", field: "strtype" },
		{
			name: "Jumlah",
			class: "w-[100px] text-right",
			field: "total",
			classRow: "text-end",
		},
		{
			name: "RM 100",
			class: "w-[100px] text-right",
			field: "t100",
			classRow: "text-end",
		},
		{
			name: "RM 50",
			class: "w-[100px] text-right",
			field: "t50",
			classRow: "text-end",
		},
		{
			name: "RM 20",
			class: "w-[100px] text-right",
			field: "t20",
			classRow: "text-end",
		},
		{
			name: "RM 10",
			class: "w-[100px] text-right",
			field: "t10",
			classRow: "text-end",
		},
		{
			name: "RM 5.00",
			class: "w-[100px] text-right",
			field: "t5",
			classRow: "text-end",
		},
		{
			name: "RM 1.00",
			class: "w-[100px] text-right",
			field: "t1",
			classRow: "text-end",
		},
		// { name: "Catatan", class: "min-w-[100px]", classRow: "", field: "remark" },
		{
			name: "",
			class: "w-[50px]",
			nClassRow: "px-3",
			render: ({ id }) => {
				const pageNum = searchParams.get("page");
				let pages = `/tabung/${id}`
				if(pageNum) pages += `?page=${pageNum}`
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
		const data = { ...tabung.find((e) => e.id == id) };
		// axiosClient.get(`/kutipan/${id}`).then((req) => {
		// 	const data = req.data;
		const m = [...typeMoney];
		m[0].value = parseFloat(data.t100.replaceAll(",", ""));
		m[1].value = parseFloat(data.t50.replaceAll(",", ""));
		m[2].value = parseFloat(data.t20.replaceAll(",", ""));
		m[3].value = parseFloat(data.t10.replaceAll(",", ""));
		m[4].value = parseFloat(data.t5.replaceAll(",", ""));
		m[5].value = parseFloat(data.t1.replaceAll(",", ""));
		data.total = parseFloat(data.total.replaceAll(",", ""));
		setTypeMoney(m);
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
			axiosClient.delete(`/kutipan/${id}`).then(() => {
				getTabung();
				showToast("Rekod berjaya dibuang");
			});
		}
	};

	const getTabung = (url) => {
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
		} else if (pageNum) url = `/kutipan/?page=${pageNum}`;
		else url = "/kutipan";

		setSelectData(null);
		showSpinner(true, "Tunggu sebentar...");
		axiosClient.get(url).then(({ data: { data, meta, ...other } }) => {
			setTabung(data);
			setMeta(meta);
			setLoading(false);
			showSpinner(false);
		});
	};
	useEffect(() => getTabung(), []);

	return (
		<PageComponent
			title="Tabung Kutipan"
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
				data={tabung}
				meta={meta}
				onReload={getTabung}
				onChecked={setCheckedState}
				tOption={{
					checkable: false,
					oClassParent: "overflow-x-auto h-[calc(100vh-152px)]",
				}}
			/>
			{selectData && (
				<div className="hidden">
					<TabungPrint
						ref={contPrint}
						data={selectData}
						userCount={userCount}
						typeMoney={typeMoney}
						typeList={tabungType}
						others={itemBernilai}
					></TabungPrint>
				</div>
			)}
		</PageComponent>
	);
}

export default Tabung;
