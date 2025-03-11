import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
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

import apiClient from "../axios";
import Spinner from "./Spinner";
import Sidebar, { SidebarItem } from "./Sidebar";

const navigation = [
  // Permohonan Bayaran
  { text: "Permohonan Bayaran", to: "", type: 0 },
  {
    text: "Permohonan Baru",
    to: "/billing/form",
    icon: <FilePlus size={20} />,
    type: 1,
    menu: "billing.create"
  },
  {
    text: "Masih Aktif",
    to: "/billing/incomplete",
    icon: <FolderOpen size={20} />,
    type: 1,
    menu: "billing.incomplete"
  },
  {
    text: "Sudah Selesai",
    to: "/billing/archive",
    icon: <Archive size={20} />,
    type: 1,
    menu: "billing.archive"
  },

  // Ketua Jabatan
  { text: "Ketua Jabatan", to: "", type: 0 },
  {
    text: "Pengesahan Bayaran",
    to: "/billing/hod",
    icon: <FileClock size={20} />,
    type: 1,
    menu: "billing.hod"
  },

  // Kewangan
  { text: "Kewangan", to: "", type: 0 },
  {
    text: "Semakan Pegawai Kewangan",
    to: "/billing/checker",
    icon: <FileClock size={20} />,
    type: 1,
    menu: "billing.checker"
  },
  {
    text: "Pengesahan Pegawai Kewangan",
    to: "/billing/verifier",
    icon: <FileClock size={20} />,
    type: 1,
    menu: "billing.verifier"
  },
  {
    text: "Kelulusan Pegawai Kewangan",
    to: "/billing/approver",
    icon: <FileClock size={20} />,
    type: 1,
    menu: "billing.approver"
  },
  {
    text: "Proses Bayaran",
    to: "/billing/payment",
    icon: <FileClock size={20} />,
    type: 1,
    menu: "billing.payment"
  },
  { 
    text: "Selesai", 
    to: "/billing/paid", 
    icon: <Archive size={20} />, 
    type: 1,
    menu: "billing.paid"
  },

  // Laporan
  { text: "Laporan Kewangan", to: "", type: 0 },
  { 
    text: "Keseluruhan", 
    to: "/report/all", 
    icon: <Package size={20} />, 
    type: 1,
    menu: "report.all"
  },
  {
    text: "Induk Penerimaan",
    to: "/report/income",
    icon: <Package size={20} />,
    type: 1,
    menu: "report.income"
  },
  {
    text: "Induk Perbelanjaan",
    to: "/report/expense",
    icon: <Package size={20} />,
    type: 1,
    menu: "report.expense"
  },
  {
    text: "Perincian Penerimaan",
    to: "/report/income-detail",
    icon: <Package size={20} />,
    type: 1,
    menu: "report.income.detail"
  },
  {
    text: "Perincian Perbelanjaan",
    to: "/report/expense-detail",
    icon: <Package size={20} />,
    type: 1,
    menu: "report.expense.detail"
  },
  {
    text: "Carta Pendapatan Dan Perbelanjaan",
    to: "/report/chart",
    icon: <BarChart3 size={20} />,
    type: 1,
    menu: "report.chart"
  },

  // Tetapan
  { text: "Tetapan", to: "", type: 0 },
  { 
    text: "Bank", 
    to: "/settings/bank", 
    icon: <Banknote size={20} />, 
    type: 1,
    menu: "settings.bank"
  },
  { 
    text: "Kod Kewangan", 
    to: "/settings/code", 
    icon: <Code2 size={20} />, 
    type: 1,
    menu: "settings.code"
  },
  {
    text: "Bajet Kewangan",
    to: "/settings/budget",
    icon: <Package size={20} />,
    type: 1,
    menu: "settings.budget"
  },
];

export default function DefaultLayout() {
  const location = useLocation();
  const { currentUser, setCurrentUser, userToken, setUserToken, countActive } =
    useStateContext();

  if (!userToken) return <Navigate to="/login" />;

  // Clear semua toast apabila tukar page
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  const logout = async (ev) => {
    ev.preventDefault();
    try {
      await apiClient.post("/auth/logout");
      // setCurrentUser({});
      setUserToken(null);
    } catch (error) {
      console.error('Ralat semasa log keluar:', error);
      console.error('Ralat semasa log keluar. Sila cuba sebentar lagi.');
    }
  };

  useEffect(() => {
    const getMaklumatPengguna = async () => {
      try {
        const {success, user} = await apiClient.get("/auth/me");
        // Semak jika response ada mesej ralat
        if (!success || !user) {
          // Reset state
          setCurrentUser({});
          setUserToken(null);
          
          // Papar mesej ralat dari server
          if (user.message) {
            console.error(user.message);
          }
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Ralat semasa mendapatkan maklumat pengguna:', error);
      }
    };
    getMaklumatPengguna();
  }, []);

  // Filter menu berdasarkan allowed_menus dari user
  const filterNavigation = () => {
    // Jika user adalah admin, tunjuk semua menu
    if (currentUser.allowed_menus?.includes('all')) {
      return navigation;
    }

    // Jika bukan admin, filter menu berdasarkan allowed_menus
    return navigation.filter(item => {
      // Jika item adalah header (type 0), periksa jika ada child menu yang dibenarkan
      if (item.type === 0) {
        const nextIndex = navigation.indexOf(item) + 1;
        // Cari menu selepas header sehingga jumpa header seterusnya
        for (let i = nextIndex; i < navigation.length && navigation[i].type !== 0; i++) {
          if (currentUser?.allowed_menus?.includes(navigation[i].menu)) {
            return true;
          }
        }
        return false;
      }
      // Jika item adalah menu (type 1), periksa jika menu dibenarkan
      return currentUser.allowed_menus?.includes(item.menu);
    });
  };

  if (!userToken) {
    return null;
  }

  return (
    currentUser && (
      <>
        <div className="flex">
          <Sidebar logout={logout}>
            {filterNavigation()?.map((n, i) => (<SidebarItem key={i} {...n} />))}
          </Sidebar>
          <div className="w-full h-screen flex flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>

        <Spinner />

      </>
    )
  );
}
