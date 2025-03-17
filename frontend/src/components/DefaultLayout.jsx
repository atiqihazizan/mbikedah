import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DefaultLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full h-screen flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
