import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Pulse from "../../components/Core/Pulse";
import Card from "../../components/Card";
import FormC from "../../components/FormContext";
import TButton from "../../components/Core/TButton";
import PageComponent from "../../components/PageComponent";
import PropTypes from "prop-types";
import RowTR from "./RowTR";

import dataJson from "../../data/bills.json";

export default function PaymentsForm() {
  const { idform } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [petition, setPetition] = useState({
    issue_at: new Date().toISOString().slice(0, 10),
    no_project: "N/A",
    issue_to: "",
    issue_desc: "",
    total: "0.00",
    detail: [],
    attach: [],
  });
  const [successMessage, setSuccessMessage] = useState("");

  const flagNew = idform == undefined ? true : false;

  const fetchData = () => {
    if (flagNew) return;
    setPetition(dataJson.filter((item) => item.id == idform)[0]);
    setLoading(false);
  };

  function onSubmit(ev) {
    ev.preventDefault();
    console.log(petition);
    setError(null);
    setSuccessMessage("");
  }

  function checkValid() {
    return (
      petition.issue_to !== "" &&
      petition.issue_desc !== "" &&
      parseFloat(petition.total) !== 0 &&
      petition.detail.length !== 0
    );
  }

  useEffect(fetchData, []);

  return (
    <PageComponent
      title={flagNew ? "Permohonan Bayaran" : "Kemaskini Permohonan"}
      buttons={
        <div className="flex">
          {!flagNew && (
            <TButton color="light" to={'/payments/incomplete'}>Kembali</TButton>
          )}
        </div>
      }
    >
      <div className="container-fixed py-5">
        <div className="grid gap-5 lg:gap-7.5 gow">
          {loading && <Pulse />}
          {!loading && (
            <Card>
              <form className="" onSubmit={(ev) => onSubmit(ev)}>
                <Card.Body oClass="flex flex-col divide-y devide-gray-200 gap-7.5">
                  {error && (
                    <div className="text-red-500 mb-4">
                      <strong>Terjadi masalah:</strong> {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="text-green-500 mb-4">
                      <strong>Berjaya:</strong> {successMessage}
                    </div>
                  )}
                  <FormC data={petition} setValue={setPetition} error={error}>
                    <div className="grid gap-7 ">
                      <FormC.LDate field={"issue_at"} text={"Tarikh Memohon"} />
                      <FormC.LText field={"no_project"} text={"No Pesanan"} />
                      <FormC.LText field={"issue_to"} text={"Individu/Syarikat"} />
                      <FormC.LText field={"issue_desc"} text={"Keterangan Bayaran"} />
                      <FormC.LDate field={"payment_due"} text={"Bayaran Perlu Dibuat Pada"} />
                      <FormC.LText
                        field={"total"}
                        text={"Jumlah Bayaran"}
                        option={{ readOnly: true }}
                      />
                    </div>
                    <div className="grid gap-7 mx-[-30px]">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="text-start !pl-7 !pr-2">Bajet</th>
                            <th className="text-start !px-2 w-[30%]">Perkara</th>
                            <th className="text-start !px-2">Rujukan</th>
                            <th className="text-start !px-2">Unit</th>
                            <th className="text-start !px-2">Harga</th>
                            <th className="text-start !px-2">Jumlah</th>
                            <th className="text-start !px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {petition.detail.map((d, i) => (
                            <RowTR
                              key={i}
                              FormC={FormC}
                              data={d}
                              idx={i}
                              setChange={setPetition}
                            />
                          ))}
                          <RowTR FormC={FormC} setChange={setPetition} />
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-7.5 flex justify-end pr-[30px] mx-[-30px]">
                      <TButton color="primary" isDisable={!checkValid()}>
                        Simpan
                      </TButton>
                    </div>
                  </FormC>
                </Card.Body>
              </form>
            </Card>
          )}
        </div>
      </div>
    </PageComponent>
  );
}
PaymentsForm.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  onFocus: PropTypes.func,
  currChange: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
};
