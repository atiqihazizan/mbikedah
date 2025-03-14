import { Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import Sidebar from "./Sidebar";

export default function DefaultLayout() {
  const { currentUser, userToken } =
    useStateContext();

  if (!userToken) {
    return null;
  }

  return (
    currentUser && (
      <div className="flex">
        <Sidebar />
        <div className="w-full h-screen flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    )
  );
}
