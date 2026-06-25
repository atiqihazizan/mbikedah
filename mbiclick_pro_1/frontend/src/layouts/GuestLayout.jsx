import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import "../assets/css/login.css";
import logo from "../assets/logo1.png";

function GuestLayout() {
  const { currentUser, userToken } = useStateContext();

  if (userToken) {
    return <Navigate to="/" />;
  }

  return <Outlet />
}

export default GuestLayout;
