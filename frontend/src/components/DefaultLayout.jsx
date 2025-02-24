import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import {
  Package,
  BarChart3,
  LayoutDashboard,
  Banknote,
  Code2,
  FilePlus,
  FolderOpen,
  Archive,
  FileClock,
} from "lucide-react";

import axiosClient from "../axios";
import Toast from "./Toast";
import Spinner from "./Spinner";
import Sidebar, { SidebarItem } from "./Sidebar";

const navigation = [
  {
    text: "Dashboard",
    to: "/",
    icon: <LayoutDashboard size={20} />,
    type: 1,
    badgeCount: 0,
  },
  { text: "Permohonan Bayaran", to: "", type: 0 },
  {
    text: "Permohonan Baru",
    to: "/billing/form",
    icon: <FilePlus size={20} />,
    type: 1,
  },
  // {
  //   text: "Masih Aktif",
  //   to: "/billing/icomplete",
  //   icon: <FolderOpen size={20} />,
  //   type: 1,
  // },
  {
    text: "Sudah Selesai",
    to: "/billing/archive",
    icon: <Archive size={20} />,
    type: 1,
  },

  { text: "Tindakan Kewangan", to: "", type: 0 },
  {
    text: "Pengesahan Ketua Jabatan",
    to: "/peoples",
    icon: <FileClock size={20} />,
    type: 1,
  },
  {
    text: "Semakan Pegawai Kewangan",
    to: "/peoples",
    icon: <FileClock size={20} />,
    type: 1,
  },
  {
    text: "Pengesahan Pegawai Kewangan",
    to: "/peoples",
    icon: <FileClock size={20} />,
    type: 1,
  },
  {
    text: "Proses Bayaran",
    to: "/peoples",
    icon: <FileClock size={20} />,
    type: 1,
  },
  { text: "Selesai", to: "/peoples", icon: <Archive size={20} />, type: 1 },

  { text: "Laporan Kewangan", to: "", type: 0 },
  { text: "Keseluruhan", to: "/peoples", icon: <Package size={20} />, type: 1 },
  {
    text: "Induk Penerimaan",
    to: "/peoples",
    icon: <Package size={20} />,
    type: 1,
  },
  {
    text: "Induk Perbelanjaan",
    to: "/peoples",
    icon: <Package size={20} />,
    type: 1,
  },
  {
    text: "Perincian Penerimaan",
    to: "/peoples",
    icon: <Package size={20} />,
    type: 1,
  },
  {
    text: "Perincian Perbelanjaan",
    to: "/peoples",
    icon: <Package size={20} />,
    type: 1,
  },
  {
    text: "Carta Pendapatan Dan Perbelanjaan",
    to: "/peoples",
    icon: <BarChart3 size={20} />,
    type: 1,
  },

  { text: "Kewangan", to: "", type: 0 },
  { text: "Bank", to: "/peoples", icon: <Banknote size={20} />, type: 1 },
  { text: "Kod Kewangan", to: "/peoples", icon: <Code2 size={20} />, type: 1 },
  {
    text: "Bajet Kewangan",
    to: "/peoples",
    icon: <Package size={20} />,
    type: 1,
  },
];

export default function DefaultLayout() {
  const { currentUser, setCurrentUser, userToken, setUserToken, countActive } =
    useStateContext();
  if (!userToken) return <Navigate to="/login" />;

  const logout = (ev) => {
    ev.preventDefault();
    axiosClient.post("/auth/logout").then((e) => {
      setCurrentUser({});
      setUserToken(null);
    });
  };

  useEffect(() => {
    axiosClient
      .get("/auth/me")
      .then(({ user }) => {
        setCurrentUser(user);
      })
      .catch((e) => {
        setCurrentUser({});
        setUserToken(null);
      });
  }, []);

  return (
    currentUser && (
      <>
        <div className="flex">
          <Sidebar logout={logout}>
            {navigation.map((n, i) => {
              if (i === 0) {
                n.badgeCount = countActive;
              }
              return <SidebarItem key={i} {...n} />;
            })}
          </Sidebar>
          <div className="w-full h-screen flex flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>

        <Spinner />
        <Toast />
      </>
    )
  );
}
