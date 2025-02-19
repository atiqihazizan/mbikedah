import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import TButton from "../components/Core/TButton";
import PageComponent from "../components/PageComponent";
import SurveyListItem from "../components/SurveyListItem";
import axiosClient from "../axios";
import PaginationLinks from "../components/PaginationLinks";
import router from "../router";

function Surveys() {
  // const { surveys } = useStateContext();
  const { showToast } = useStateContext();
  const [surveys, setSurveys] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const onDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      axiosClient.delete(`/survey/${id}`).then(() => {
        getSurveys();
        showToast("The survey was deleted");
      });
    }
  };

  const onPageClick = (link) => {
    getSurveys(link.url);
  };

  const getSurveys = (url) => {
    url = url || "/survey";
    axiosClient.get(url).then(({ data }) => {
      setSurveys(data.data);
      setMeta(data.meta);
      setLoading(false);
    });
  };
  useEffect(() => {
    setLoading(true);
    getSurveys();
  }, []);

  return (
    <PageComponent
      title="Survey"
      buttons={
        <TButton color="green" to="/surveys/create">
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Create New
        </TButton>
      }
    >
      {loading && <div className="text-center text-lg">Loading...</div>}
      {!loading && (
        <div>
          {surveys?.length === 0 && (
            <div className="py-8 text-center text-gray-700">
              You don't have surveys created
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {surveys.map((survey) => (
              <SurveyListItem
                survey={survey}
                key={survey.id}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>

          {surveys.length > 0 && (
            <PaginationLinks meta={meta} onPageClick={onPageClick} />
          )}
        </div>
      )}
    </PageComponent>
  );
}

export default Surveys;
