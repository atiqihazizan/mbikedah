import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";

function Maintainance() {
  const { showToast, showSpinner } = useStateContext();
  const [houses, setAddr] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkedState, setCheckedState] = useState([]);
  const [countChecked, setCountChecked] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const onDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      checkedState.forEach(
        (c, i) => c && showToast(houses[i].addr)
        // axiosClient.delete(`/survey/${houses[i]}`).then(() => {
        //   getSurveys();
        //   showToast("The survey was deleted");
        // })
      );
    }
  };

  const onPageClick = (link) => {
    const pageNum = parseInt(link.url.split("=")[1]);
    setSearchParams(`?${new URLSearchParams({ page: pageNum })}`);

    if (link.active) return;
    setCountChecked(0);
    getSurveys(link.url);
  };

  const handleOnChange = (position) => {
    const updateCheckedState = checkedState.map((item, idx) =>
      idx === position ? !item : item
    );
    setCountChecked(updateCheckedState.filter(Boolean).length);
    setCheckedState(updateCheckedState);
  };

  const getSurveys = (url) => {
    const chkUrl = url;
    const pageNum = searchParams.get("page");

    if (url) {
      const arr = url.split("/");
      const newArr = [...arr.slice(0, arr.length - 1),"mta2",...arr.slice(-1)];
      url = newArr.join("/");
    } else if (pageNum) {
      // url = http://api.mahsites.com/mta2/address?page=2
      url = `/address/?page=${pageNum}`;
    } else url = "/address";

		return;
    // url = url || "/address";
    showSpinner(true, "Tunggu sebentar...");
    axiosClient.get(url).then(({ data: { data, meta, ...other } }) => {
      const newArr = new Array(data.length).fill(false);
      setAddr(data);
      setMeta(meta);
      setLoading(false);
      setCheckedState(newArr);
      showSpinner(false);
    });
  };
  useEffect(() => getSurveys(), []);

  return (
    <PageComponent
      title="Penyelenggaraan"
      buttons={
        <div className="flex">
          {countChecked > 0 && (<TButton isClasses="mr-2" color="red" onClick={onDeleteClick}><TrashIcon className="h-6 w-6 mr-2" />Selected {countChecked}</TButton>)}
          <TButton color="green" to="#"><PlusCircleIcon className="h-6 w-6 mr-2" />Create New</TButton>
        </div>
      }
    >
    </PageComponent>
  );
}

export default Maintainance;
