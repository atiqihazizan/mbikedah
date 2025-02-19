import { PaperClipIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import Pulse from "../components/Core/Pulse";
import AddressView from "./resident/AddressView";
import Peoples from "./resident/PeoplesView";
import TButton from "../components/Core/TButton";

function Resident() {
	const [peoples, setPeoples] = useState([]);
	const [address, setAddress] = useState();
	const [loading, setLoading] = useState(true);
	const {id:idRes} = useParams();

	const getResidency = () => {
		const url = `/kariah/${idRes}`;
		axiosClient.get(url).then(({ data:{data:{address:addr,people}} }) => {
			setLoading(false);
			setAddress(addr)
			setPeoples(people);
		});
	};
	useEffect(() => getResidency(), []);

	return (
		<PageComponent title="Isi Rumah" buttons={
			<div className="flex">
				<TButton color="light" to={-1}>
					Kembali
				</TButton>
			</div>
		}>
			<div className="py-6 sm:px-6 lg:px-8">
				{loading && <Pulse />}
				{!loading && (
					<div className="flex flex-col gap-6">
						<div className="grid grid-cols-3 gap-6">
							<AddressView address={address} />
							<div className="col-span-2 flex flex-col gap-6">
								<Peoples
									title="Ketua Rumah dan Pasangan"
									data={peoples.filter(({ status }) => [1, 2].includes(status))}
									cols="name,nokp,mobile,sibling"
								/>
								<Peoples
									title="Penama Kedua"
									data={peoples.filter(({ penama }) => penama == 1)}
									cols="name,mobile,sibling"
								/>
								<Peoples
									title="Penyakit Kekal"
									data={peoples.filter(({ stshealthy }) => stshealthy == 1)}
									cols="name,penyakit,sibling"
								/>
							</div>
						</div>
						<Peoples
							title="Tanggunan"
							data={peoples.filter(({ tanggungan }) => tanggungan == 1)}
							cols="name,nokp,mobile,edustatus,sibling,employee"
						/>
					</div>
				)}
			</div>
		</PageComponent>
	);
}

export default Resident;
