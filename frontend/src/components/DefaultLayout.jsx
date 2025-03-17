import { Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useNavigate } from "react";
import Sidebar from "./Sidebar";

export default function DefaultLayout() {
  const { currentUser, userToken } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser]);

  if (!userToken) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full h-screen flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
