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

export default function JenazahForm() {
	const navigate = useNavigate();
	const preview = useRef(null);
	const {
		showToast,
		currentUser: { id: uid },
	} = useStateContext();
	const { jid } = useParams();
	const [error, setError] = useState(null);
	// const [people, setPeople] = useState([]);
	const [loading, setLoading] = useState(false);
	const [jenazah, setJenazah] = useState({
		jdate: new Date().toISOString().slice(0, 10),
		people_id: 0,
		lorong: 0,
		lubang: 0,
		cost: "0.00",
		type: 1,
	});
	const pengurusan = [
		{ id: 1, name: "Masjid" },
		{ id: 2, name: "Hospital" },
	];
	const flagNew = jid == undefined ? true : false;
	const fetchData = async () => {
		if (loading) return false;
		setLoading(true);

		// const pre = await axiosClient.get("/allpeople");
		// const { data: peo } = pre;
		// setPeople(peo);

		if (flagNew) return setLoading(false);
		const url = `/jenazah/${jid}`;
		const req = await axiosClient.get(url);
		const { data } = req;
		setJenazah(data);
		setLoading(false);
	};

	const onPrint = useReactToPrint({ content: () => preview.current });

	function onSubmit(ev) {
		ev.preventDefault();
		const payload = { ...jenazah };

		setError(null);
		let res = null;
		if (jid) {
			payload.updated_by = uid;
			res = axiosClient.put(`/jenazah/${jid}`, payload);
		} else {
			payload.created_by = uid;
			res = axiosClient.post("/jenazah", payload);
		}

		res
			.then(({ data: result }) => {
				if (result.errors) throw result.errors;
				navigate("/jenazah");
				if (jid) {
					showToast("Maklumat berjaya dikemaskini");
				} else {
					showToast("Maklumat berjaya ditambah");
				}
			})
			.catch((err) => {
				setError(err);
				console.error(err);
			});
	}

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<PageComponent
			title="Maklumat Jenazah"
			buttons={
				<div className="flex gap-2">
					{jid && (
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
						<Card>
							<Card.Header title="Maklumat Baucar" />
							<Card.Body>
								<form className="grid gap-5" onSubmit={(ev) => onSubmit(ev)}>
									<FormC data={jenazah} setValue={setJenazah} error={error}>
										<div className="flex flex-col gap-5">
											<FormC.LDate
												field="jdate"
												text={"Tarikh Baucar"}
												holder={"Tarikh surat"}
											/>
											<FormC.LSelect
												field="type"
												text={"Diurus Oleh"}
												keyval="id,name"
												listArr={pengurusan}
											/>
											<FormC.LText
												field="name"
												text={"Nama Arwah"}
												holder={"Nama arwah"}
											/>
											<FormC.LText
												field="alamat"
												text={"Alamat Rumah"}
												holder={"Alamat rumah"}
											/>
											<FormC.LNumber
												field="lorong"
												text={"No Lorong"}
												holder={"No lorong"}
											/>
											<FormC.LText
												field="lubang"
												text={"No Lubang"}
												holder={"No lubang"}
											/>
											<FormC.LCurrency
												field="cost"
												text={"Jumlah Bayaran"}
												holder={"Jumlah bayaran"}
											/>
										</div>
										<FormC.FSave />
									</FormC>
								</form>
							</Card.Body>
						</Card>
					)}
				</div>
			</div>
		</PageComponent>
	);
}
