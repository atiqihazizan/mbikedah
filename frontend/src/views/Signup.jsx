import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import apiClient from "../axios";
import TButton from "../components/Core/TButton";

function Signup() {
	const navigate = useNavigate();
	const { setCurrentUser, setUserToken } = useStateContext();
	const [onChecking, setChecking] = useState(false);
	const [postData, setPostData] = useState({
		name: "",
		username: "",
		password: "",
		password_confirmation: "",
	});
	const [error, setError] = useState({ __html: "" });

	const onSubmit = async (ev) => {
		ev.preventDefault();
		if(onChecking) return;
		
		setChecking(true);
		setError({ __html: "" });
		
		try {
			const { success, message } = await apiClient.post("/signup", postData);
			
			if (!success) {
				throw new Error(message || 'Pendaftaran gagal. Sila cuba lagi.');
			}
			
			// Redirect ke halaman login selepas berjaya daftar
			navigate('/login');
			
		} catch (error) {
			console.error('Ralat semasa pendaftaran:', error);
			
			if (error.response?.data?.errors) {
				const err = error.response.data.errors;
				const finalErrors = Object.values(err).reduce(
					(accum, next) => [...accum, ...next],
					[]
				);
				setError({ __html: finalErrors.join("<br>"), obj: err });
			} else if (error.response?.status === 422) {
				setError({ __html: "Sila semak semula maklumat yang dimasukkan" });
			} else if (error.message === 'Tiada response dari server') {
				setError({ __html: "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi." });
			} else {
				setError({ __html: error.message || "Ralat semasa pendaftaran. Sila cuba sebentar lagi." });
			}
		} finally {
			setChecking(false);
		}
	};

	return (
		<>
			<div>
				{/* <img className=" w-full" src={logo} alt="MTA Pro" /> */}
				<h2 className="axu mt-[2rem] text-[1.5rem] font-bold tracking-tight">
					Daftar Pengguna
				</h2>
				{/* <p className="lb avz awo axq">Pendaftaran melalui admin</p> */}
				<p className="mt-2 text-sm text-gray-600">
					Atau{" "}
					<Link
						to="/login"
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Log masuk
					</Link>
				</p>
			</div>
			<div className="mt-[2.5rem]">
				<div>
					<form onSubmit={onSubmit} className="space-y-6" method="POST">
						<FormRow
							text="Nama Penuh"
							field="name"
							value={postData}
							setValue={setPostData}
							holder="Masukkan nama penuh"
							error={error.obj}
						/>

						<FormRow
							text="Nama Pengguna"
							field="username"
							value={postData}
							setValue={setPostData}
							holder="Masukkan nama pengguna"
							error={error.obj}
						/>
						<FormRow
							text="Katalaluan"
							field="password"
							value={postData}
							setValue={setPostData}
							holder="Masukkan katalaluan"
							type="password"
							error={error.obj}
						/>
						<FormRow
							text="Ulangan"
							field="password_confirmation"
							value={postData}
							setValue={setPostData}
							holder="Masukkan ulangan katalaluan"
							type="password"
							error={error.obj}
						/>

						<div>
							<TButton
								onChecking={onChecking}
								className="w-full justify-center"
							>
								Daftar
							</TButton>
							{/* <button
								type="submit"
								className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
							>
								Daftar
							</button> */}
						</div>
					</form>
				</div>
			</div>
		</>
	);
}

function FormRow({
	text,
	field,
	holder,
	value,
	setValue,
	error,
	type = "text",
}) {
	function onChange(ev) {
		setValue({ ...value, [field]: ev.target.value });
	}
	return (
		<div className="flex flex-col w-full">
			<label
				htmlFor={field}
				className="block text-sm font-medium leading-6 text-gray-900"
			>
				{text}
			</label>

			<div className="mt-2">
				<input
					id={field}
					name={field}
					type={type}
					required
					className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					placeholder={holder}
					value={value?.[field]}
					onChange={onChange}
					autoComplete="off"
				/>
			</div>
			{error?.[field] && (
				<span className="text-xs mt-2 text-red-600 whitespace-break-spaces">{error?.[field]}</span>
			)}
		</div>
	);
}

export default Signup;
