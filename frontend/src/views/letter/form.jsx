import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios";
import Pulse from "../../components/Core/Pulse";
import Card from "../../components/Card";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import PageComponent from "../../components/PageComponent";

export default function LetterForm() {
	const navigate = useNavigate();
	const { showToast } = useStateContext();
	const { lid } = useParams();
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [logSurat, setLogSurat] = useState({
		ltdate: new Date().toISOString().slice(0, 10),
		rcvd_at: new Date().toISOString().slice(0, 10),
		ltdesc: "",
		lfrom: "",
		chairman_act: "",
		biro_act: "",
		ltdue: "",
		remark: "",
	});
	const flagNew = lid == undefined ? true : false;

	const fetchData = () => {
		if (flagNew) return;
		const url = `/letter/${lid}`;
		setLoading(true);
		axiosClient.get(url).then(({ data }) => {
			setLoading(false);
			setLogSurat(data);
		});
	};
	function onSubmit(ev) {
		ev.preventDefault();
		const url = `/letter/${lid}`;
		const payload = { ...logSurat };
		setError(null);
		let res = null;
		if (lid) {
			res = axiosClient.put(`/letter/${lid}`, payload);
		} else {
			res = axiosClient.post("/letter", payload);
		}

		res
			.then(({ data: result }) => {
				if (result.errors) throw result.errors;
				navigate("/letters");
				if (lid) {
					showToast("Maklumat telah dikemaskini");
				} else {
					showToast("Maklumat telah ditambah");
				}
			})
			.catch((err) => {
				setError(err);
				console.error(err);
			});
	}

	useEffect(fetchData, []);

	return (
		<PageComponent
			title="Maklumat Surat"
			buttons={
				<div className="flex">
					<TButton color="light" to={-1}>
						Kembali
					</TButton>
				</div>
			}
		>
			<div className="container-fixed pt-5">
				<div className="grid gap-5 lg:gap-7.5 xl:w-[38.75rem] mx-auto">
					{loading && <Pulse />}
					{!loading && (
						<div className="container">
							<Card>
								<Card.Header title={flagNew ? "Log Baru" : "Kemaskini Log"} />
								<Card.Body>
									<form className="grid gap-5" onSubmit={(ev) => onSubmit(ev)}>
										<FormC data={logSurat} setValue={setLogSurat} error={error}>
											<FormC.LDate
												field={"ltdate"}
												text={"Tarikh Surat"}
												holder={"Tarikh surat"}
											/>
											<FormC.LDate
												field={"rcvd_at"}
												text={"Tarikh Terima"}
												holder={"Tarikh terima"}
											/>
											<FormC.LText
												field={"lfrom"}
												text={"Surat Daripada"}
												holder={"keterangan pemberi"}
											/>
											<FormC.LText
												field={"ltdesc"}
												text={"Perkara"}
												holder={"keterangan surat"}
											/>
											<FormC.LText
												field={"biro_act"}
												text={"Untuk Biro"}
												holder={"Untuk tindakan"}
											/>
											<FormC.LText
												field={"chairman_act"}
												text={"Untuk Pengerusi"}
												holder={"Untuk tindakan"}
											/>
											<FormC.LDate
												field={"ltdue"}
												text={"Tarikh Akhir"}
												holder={"Tarikh akhir (jika ada)"}
											/>

											<div className="flex justify-end">
												<button className="btn btn-primary">
													Simpan
												</button>
											</div>
										</FormC>
									</form>
								</Card.Body>
							</Card>
						</div>
					)}
				</div>
			</div>
		</PageComponent>
	);
}
