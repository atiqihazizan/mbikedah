import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { useReactToPrint } from "react-to-print";
import { PrinterIcon } from "@heroicons/react/24/outline";
import PageComponent from "../../components/PageComponent";
import axiosClient from "../../axios";
import Pulse from "../../components/Core/Pulse";
import Card from "../../components/Card";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import TabungPrint from "./print";

export default function TabungForm() {
	const contPrint = useRef(null);
	const navigate = useNavigate();
	const { showToast } = useStateContext();
	const { tid } = useParams();
	const [searchParams] = useSearchParams();
	const [pageBack] = useState(() => {
		const pageNum = searchParams.get("page");
		return pageNum ? `/tabung?page=${pageNum}` : "/tabung";
	});
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [sumTotal, setSumTotal] = useState(0);
	const [kutipan, setKutipan] = useState({
		dateTime: new Date().toISOString().slice(0, 10),
		ttype: "",
		total: "0.00",
		voucher: "",
		t100: "0.00",
		t50: "0.00",
		t20: "0.00",
		t10: "0.00",
		t5: "0.00",
		t1: "0.00",
	});
	const url = `/kutipan/${tid}`;
	const flagNew = tid == undefined ? true : false;
	const cardTitle = flagNew ? "Kutipan Baru" : "Kemaskini Kutipan";
	const tabungType = [
		{ key: 1, value: "Tabung Statik" },
		{ key: 2, value: "Tabung Jumaat" },
		{ key: 3, value: "Tabung Mingguan" },
	];
	const userCount = [
		"AHMAD BUSTAMAM BIN ABD RAHMAN",
		"MOHD FISOL BIN SAAD",
		"SOBERI BIN ISAHAK",
		"HJ ZAKARIA BIN ABDUL",
	];
	const itemBernilai = [
		{ perkara: "", qty: "", remark: "" },
		{ perkara: "", qty: "", remark: "" },
		{ perkara: "", qty: "", remark: "" },
	];
	const [typeMoney, setTypeMoney] = useState([
		{ name: "RM 100", money: 100, value: 0 },
		{ name: "RM 50", money: 50, value: 0 },
		{ name: "RM 20", money: 20, value: 0 },
		{ name: "RM 10", money: 10, value: 0 },
		{ name: "RM 5", money: 5, value: 0 },
		{ name: "RM 1", money: 1, value: 0 },
		// { name: "50 sen", money: 0.5, value: 0 },
		// { name: "20 sen", money: 0.2, value: 0 },
		// { name: "10 sen", money: 0.1, value: 0 },
	]);
	const formatCurr = (value) =>
		new Intl.NumberFormat().format(parseFloat(value));
	const fetchData = () => {
		if (loading) return;

		setLoading(true);
		if (flagNew) {
			axiosClient.get("/nvchr").then(({ data }) => {
				setLoading(false);
				setKutipan({ ...kutipan, voucher: parseInt(data) + 1 });
			});
			return;
		}
		axiosClient.get(url).then(({ data }) => {
			// data.total = formatCurr(data.total);
			setLoading(false);
			setKutipan(data);
		});
	};
	const onPrint = useReactToPrint({
		content: () => contPrint.current,
	});

	function onSubmit(ev) {
		ev.preventDefault();
		const payload = { ...kutipan };
		const dt = kutipan.dateTime.split("-");

		setError(null);
		payload.dateTime = `${dt[2]}-${dt[1]}-${dt[0]}`;

		let res = null;
		if (tid) {
			res = axiosClient.put(url, payload);
		} else {
			res = axiosClient.post("/kutipan", payload);
		}

		res
			.then(({ data: result }) => {
				if (result.errors) throw result.errors;
				if (tid) {
					showToast("Kutipan berjaya dikemaskini");
				} else {
					showToast("Kutipan berjaya ditambah");
					navigate(`/tabung/${result.tabung.id}`);
				}
			})
			.catch((err) => {
				setError(err);
				console.error(err);
			});
	}

	useEffect(() => !loading && fetchData(), []);
	useEffect(() => {
		if (loading) return true;
		setSumTotal(
			parseFloat(kutipan.t100) +
				parseFloat(kutipan.t50) +
				parseFloat(kutipan.t20) +
				parseFloat(kutipan.t10) +
				parseFloat(kutipan.t5) +
				parseFloat(kutipan.t1)
		);
		// {new Intl.NumberFormat().format(parseFloat(value))}
		const m = [...typeMoney];
		m[0].value = kutipan.t100;
		m[1].value = kutipan.t50;
		m[2].value = kutipan.t20;
		m[3].value = kutipan.t10;
		m[4].value = kutipan.t5;
		m[5].value = kutipan.t1;
		setTypeMoney(m);
	}, [kutipan]);

	return (
		<PageComponent
			title="Tabung Kutipan"
			buttons={
				<div className="flex gap-2">
					{tid && (
						<TButton color="light" onClick={onPrint}>
							<PrinterIcon className="h-5" />
							Cetak
						</TButton>
					)}
					<TButton color="light" to={pageBack}>
						Kembali
					</TButton>
				</div>
			}
		>
			<div className="container-fixed pt-5">
				<div className="grid gap-5 lg:gap-7.5 xl:w-[58.75rem] mx-auto">
					{loading && <Pulse />}
					{!loading && (
						<>
							<div className="container">
								<Card>
									<Card.Header title={cardTitle} />
									<Card.Body>
										<form onSubmit={(ev) => onSubmit(ev)}>
											<FormC data={kutipan} setValue={setKutipan} error={error}>
												<div className="flex justify-between gap-7 mb-4">
													<div className="flex flex-col gap-5 w-full">
														<FormC.LDate
															text={"Tarikh"}
															field={"dateTime"}
															holder={"Tarikh Kutipan"}
														/>
														<FormC.LText
															text={"No Baucar"}
															field={"voucher"}
															holder={"No turutan baucar"}
														/>
														<FormC.LCurrency
															text={"Jumlah"}
															field={"total"}
															holder={"Jumlah Kutipan"}
														/>
														<FormC.LSelect
															text={"Jumlah"}
															field="ttype"
															keyval="key,value"
															listArr={tabungType}
														/>
														{sumTotal}
													</div>
													<div className="flex flex-col gap-5 w-full ">
														<FormC.ColCurrency
															text={"Amount RM 100"}
															field={"t100"}
															holder={"Masukkan amoun"}
														/>
														<FormC.ColCurrency
															text={"Amount RM 50"}
															field={"t50"}
															holder={"Masukkan amoun"}
														/>
														<FormC.ColCurrency
															text={"Amount RM 20"}
															field={"t20"}
															holder={"Masukkan amoun"}
														/>
														<FormC.ColCurrency
															text={"Amount RM 10"}
															field={"t10"}
															holder={"Masukkan amoun"}
														/>
														<FormC.ColCurrency
															text={"Amount RM 5"}
															field={"t5"}
															holder={"Masukkan amoun"}
														/>
														<FormC.ColCurrency
															text={"Amount RM 1"}
															field={"t1"}
															holder={"Masukkan amoun"}
														/>
													</div>
												</div>
												<FormC.FSave
													saveOpt={{
														disabled:
															sumTotal === 0 ||
															sumTotal != parseFloat(kutipan.total),
													}}
												/>
											</FormC>
										</form>
									</Card.Body>
								</Card>
							</div>
							{tid && (
								<div className="hidden">
									<TabungPrint
										ref={contPrint}
										data={kutipan}
										userCount={userCount}
										typeMoney={typeMoney}
										typeList={tabungType}
										others={itemBernilai}
									></TabungPrint>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</PageComponent>
	);
}
