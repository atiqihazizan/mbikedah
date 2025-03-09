import { useStateContext } from "../contexts/ContextProvider";
import ApplicantDashboard from "./dashboard/ApplicantDashboard";
import HodDashboard from "./dashboard/HodDashboard";
import FinanceDashboard from "./dashboard/FinanceDashboard";
import HrDashboard from "./dashboard/HrDashboard";

function Dashboard() {
  const { currentUser } = useStateContext();

  // const getDashboardByRole = () => {
  //   switch (currentUser?.role) {
  //     case 'hod':
  //       return <HodDashboard />;
  //     case 'finance':
  //       return <FinanceDashboard />;
  //     case 'hr':
  //       return <HrDashboard />;
  //     default:
  //       return <ApplicantDashboard />;
  //   }
  // };

  // return <ApplicantDashboard />
  return<></>
}

export default Dashboard;
