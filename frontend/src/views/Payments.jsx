// import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import Card from "../components/Card";
// import axiosClient from "../axios";
import Table from "../components/TableRow";
// import PaginationLinks from "../components/PaginationLinks";

import dataJson from "../data/bills.json";
import dataStatus from "../data/status.json";
import dataPayment from "../data/payment.json";

function Payments() {
	// const { showToast, showSpinner } = useStateContext();
	const [payments, setPayments] = useState([]);
	const [meta, setMeta] = useState({});
	const [loading, setLoading] = useState(true);
	// const [checkedState, setCheckedState] = useState([]);
	// const [searchParams, setSearchParams] = useSearchParams();
	const columns = [
    {
      name: "Tarikh Pohon",
      class: "w-[120px]",
      field: "issue_at",
      classRow: "text-sm",
    },
    // classRow: "font-medium text-gray-900 whitespace-nowrap dark:text-white pl-6",
    {
      name: "Keterangan Bayaran",
      class: "w-auto",
      field: "issue_desc",
      classRow: "text-sm",
    },
    {
      name: "Jumlah Bayaran",
      class: "w-[150px] text-right",
      field: "total",
      classRow: "text-sm text-right",
      render: (row) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(parseFloat(row.total)),
    },
    {
      name: "Status Permohonan",
      class: "w-[230px]",
      field: "status",
      classRow: "text-sm",
			render: (row) => 	dataStatus.find((item) => item.id === row.status)?.name,
    },
    {
      name: "Status Bayaran",
      class: "w-[150px]",
      field: "payment_type",
      classRow: "text-sm",
			render: (row) => 	dataPayment.find((item) => item.id === row.payment_type)?.name,
    },
    {
      name: "",
      class: "w-[50px]",
      nClassRow: "px-3",
      render: ({ id,status }) => status === 0 &&	 (
        <div className="flex gap-0.5">
          <TButton
            nClasses="btn btn-sm btn-icon btn-clear btn-light"
            to={`/billing/incomplete/${id}`}
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

	const getData = () => {
		setPayments(dataJson);
		setMeta({});
		setLoading(false);
		// axiosClient.get(`/payment`).then(({ data }) => {
		// 	setPayments(data.data);
		// 	setMeta(data.meta);
		// 	setLoading(false);
		// });
	};

	const fetchDelete = (id = 0) => {
		return id;
		// axiosClient.delete(`/address/${id}/delete`).then(() => {
		// 	getAddress();
		// 	showToast("Rekod alamat ini telah dipadam");
    // })
  };

	useEffect(() => {
		getData();
	}, []);

	return (
    <PageComponent title="Permohonan" className="p-5">
      <Card>
        <Card.Body oClass="p-5 !pr-2">
          <Table
            columns={columns}
            loading={loading}
            data={payments}
            meta={meta}
            onReload={getData}
            // onChecked={setCheckedState}
            tOption={{
              checkable: false,
              oClassParent: "scrollable-y-hover h-[calc(100vh-180px)]",
            }}
          />
        </Card.Body>
      </Card>
    </PageComponent>
  );
}

export default Payments;
