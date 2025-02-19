import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { useReactToPrint } from "react-to-print";
import { PrinterIcon } from "@heroicons/react/24/outline";
import axiosClient from "../../axios";
import Pulse from "../../components/Core/Pulse";
import Card from "../../components/Card";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import PageComponent from "../../components/PageComponent";
import VoucherPrint from "./print";

export default function VoucherForm() {
	const preview = useRef(null);
	const navigate = useNavigate();
	const handlePrint = useReactToPrint({
		documentTitle: "Baucar Bayaran",
		onBeforePrint: () => setIsPrint(true),
		onAfterPrint: () => setIsPrint(false),
		// removeAfterPrint:false,
	});
	const {showToast,currentUser: { id: uid }} = useStateContext();
	const { vid } = useParams();
	const [isPrint,setIsPrint] = useState(false);
	const [defItems] = useState(Array(10).fill({ no: "", desc: ``, amount: "" }));
	const [error, setError] = useState(null);
	const [people, setPeople] = useState([]);
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState(defItems);
	const [voucher, setVoucher] = useState({
		vdate: new Date().toISOString().slice(0, 10),
		vno: "",
		bis_id: "",
		description: "",
		total: '0.00',
		details: defItems,
	});
	const [dataPrint, setDataPrint] = useState({
		vdate: new Date().toISOString().slice(0, 10),
		total: "",
		name: "",
		details: "",
	});

	const flagNew = vid == undefined ? true : false;
	const fetchData = async () => {
		if (loading) return;
		setLoading(true);

		const pre = await axiosClient.get("/vpeople");
		const { data: peo } = pre;
		setPeople(peo);

		if (flagNew) {
			setLoading(false);
			return
		}
		const url = `/voucher/${vid}`;
		const req = await axiosClient.get(url);
		const {
			data: { details, ...data },
		} = req;
		const det = JSON.parse(details);
		const def = Array(10 - det.length).fill({ no: "", desc: ``, amount: "" });
		const _items = [...det, ...def];
		setVoucher({ ...data, details: _items, });
		setItems(_items);
		setLoading(false);
	};

	const onPrint = () =>{
		const { name } = people.filter((p) => p.id == voucher.bis_id)[0];
		const newdata = { ...voucher, details: items, name: name };
		setDataPrint(newdata);
		setIsPrint(true);
	}

	function onSubmit(ev) {
		ev.preventDefault();
		const payload = { ...voucher, details: JSON.stringify(items) };

		setError(null);
		let res = null;
		if (vid) {
			payload.updated_by = uid;
			res = axiosClient.put(`/voucher/${vid}`, payload);
		} else {
			payload.created_by = uid;
			res = axiosClient.post("/voucher", payload);
		}

		res
			.then(({ data: result }) => {
				if (result.errors) throw result.errors;
				navigate("/voucher");
				if (vid) {
					showToast("Baucar telah dikemaskini");
				} else {
					showToast("Baucar telah ditambah");
				}
			})
			.catch((err) => {
				setError(err);
				console.error(err);
			});
	}

	function onChangeDetails(ev, indx, name) {
		const val = ev.target.value;
		const newdata = items.map((item, i) =>
			i === indx ? { ...item, [name]: val } : item
		);
		setItems(newdata);
		const t = newdata.reduce(
			(p, a) =>
				isNaN(parseFloat(a.amount)) || a.desc.length < 3
					? p + 0
					: p + parseFloat(a.amount),
			0
		);
		setVoucher({ ...voucher, total: t });
	}
	useEffect(()=>{
		if (dataPrint && preview && isPrint) handlePrint(null, () => preview.current);
	},[dataPrint])

	useEffect(() => {fetchData();}, []);

	return (
		<PageComponent
			title="Baucar Bayaran"
			buttons={
				<div className="flex gap-2">
					{vid && (
						<TButton color="light" onClick={onPrint}>
							<PrinterIcon className="h-5" />
							Cetak
						</TButton>
					)}
					<TButton color="light" to={-1}>
						Kembali
					</TButton>
				</div>
			}
		>
			<div className="container-fixed pt-5">
				<div className="">
					{loading && <Pulse />}
					{!loading && (
						<>
							<Card>
								<Card.Header title="Maklumat Baucar" />
								<Card.Body>
									<form className="grid gap-5" onSubmit={(ev) => onSubmit(ev)}>
										<FormC data={voucher} setValue={setVoucher} error={error}>
											<div className="flex flex-row gap-5">
												<div className="w-[40%] flex flex-col gap-5">
													<FormC.LDate
														field={"vdate"}
														text={"Tarikh Baucar"}
														holder={"Tarikh surat"}
													/>
													<FormC.LText
														field={"vno"}
														text={"No Baucar"}
														holder={"No siri baucar"}
													/>
													<FormC.LSelect
														text={"Bayaran Kepada"}
														field="bis_id"
														keyval="id,name"
														listArr={people}
													/>
													<FormC.LText
														field={"description"}
														text={"Perkara"}
														holder={"Perkara"}
													/>
													<FormC.LCurrency
														text={"Jumlah Bayaran"}
														field={"total"}
														holder={"Jumlah bayaran"}
														option={{ disabled: true }}
													/>
												</div>
												<div className="grow">
													<table className="w-full table">
														<thead className="bg-gray-800">
															<tr>
																<th className="w-[50px]">Bil</th>
																<th>Butiran</th>
																<th className="w-[100px]">Amaun</th>
															</tr>
														</thead>
														<tbody>
															{items.map(({ no, desc, amount }, i) => (
																<tr key={i}>
																	<td className="!p-0">
																		<input
																			type="text"
																			className="input border-0 w-[50px] text-center"
																			placeholder={i + 1}
																			value={no}
																			onChange={(ev) =>
																				onChangeDetails(ev, i, "no")
																			}
																		/>
																	</td>
																	<td className="!p-0">
																		<input
																			type="text"
																			className="input border-0 w-full"
																			placeholder={`Item ${i+1}`}
																			value={desc}
																			onChange={(ev) =>
																				onChangeDetails(ev, i, "desc")
																			}
																		/>
																	</td>
																	<td className="!p-0">
																		<input
																			type="number"
																			className="input border-0 w-[100px] text-right"
																			placeholder="0.00"
																			value={amount}
																			onChange={(ev) =>
																				onChangeDetails(ev, i, "amount")
																			}
																		/>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
											<FormC.FSave
												saveOpt={{
													disabled:
														parseFloat(voucher.total) === 0 ||
														isNaN(voucher.total),
												}}
											/>
										</FormC>
									</form>
								</Card.Body>
							</Card>
							{vid && (
								<div className="hidden">
									<VoucherPrint ref={preview} data={dataPrint}></VoucherPrint>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</PageComponent>
	);
}
