import { useEffect, useRef } from "react";
import {  Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useStateContext } from "../contexts/ContextProvider";
import apiClient from "../axios";
import Sidebar, { SidebarItem } from "./Sidebar";
import { navigation } from "../config/navigation";

export default function DefaultLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, userToken, setUserToken } = useStateContext();
  const requestInProgress = useRef(false);

  // Clear semua toast apabila tukar page
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  useEffect(() => {
    if (!userToken || requestInProgress.current) return;
    
    const getMaklumatPengguna = async () => {
      try {
        requestInProgress.current = true;
        const {success, user} = await apiClient.get("/auth/me");
        if (!success || !user) {
          setCurrentUser({});
          setUserToken(null);
          if (user.message) {
            console.error(user.message);
          }
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Ralat semasa mendapatkan maklumat pengguna:', error);
      } finally {
        requestInProgress.current = false;
      }
    };
    getMaklumatPengguna();
  }, [userToken]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const logout = async (ev) => {
    ev.preventDefault();
    try {
      await apiClient.post("/auth/logout");
      setCurrentUser({});
      setUserToken(null);
      navigate("/login");
    } catch (error) {
      console.error('Ralat semasa log keluar. Sila cuba sebentar lagi.');
    }
  };

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
      </>
    )
  );
}
