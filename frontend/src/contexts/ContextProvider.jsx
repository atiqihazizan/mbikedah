import { createContext, useContext, useEffect, useRef, useState } from "react";
import apiClient from "../axios";

const StateContext = createContext({
  currentUser: {},
  userToken: null,
  spinner: { message: null, show: false },
  setCurrentUser: () => {},
  setUserToken: () => {},
  countActive: 0,
  setCountActive: () => {},
  logout: () => {}
});

export const ContextProvider = ({ children }) => {
  const [countActive, setCountActive] = useState(0)
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, _setUserToken] = useState(() => {
    const token = localStorage.getItem("MBI_TOKEN");
    // Redirect segera jika token tidak sah semasa permulaan
    if (!token || token === "undefined" || token === "null" || token.trim() === "") {
      return "";
    }
    return token;
  });
  const [spinner, setSpinner] = useState({ message: "", show: false });
  const requestInProgress = useRef(false);

  const setUserToken = (token) => {
    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
      localStorage.setItem("MBI_TOKEN", token);
      _setUserToken(token);
    } else {
      localStorage.removeItem("MBI_TOKEN");
      _setUserToken("");
      // Can't use navigate here, handle redirection in useEffect
    }
  };

  const logout = async (ev) => {
    if (ev) ev.preventDefault();
    try {
      // Hanya cuba panggilan API jika token wujud
      if (userToken && userToken !== "undefined" && userToken !== "null" && userToken.trim() !== "") {
        await apiClient.post("/auth/logout");
      }
      setCurrentUser({});
      setUserToken(null);
      // Redirect will be handled by useEffect
    } catch (error) {
      console.error("Ralat semasa log keluar. Sila cuba sebentar lagi.");
      // Tetap navigasi ke login walaupun API logout gagal
      setCurrentUser({});
      setUserToken(null);
      // Redirect will be handled by useEffect
    }
  };

  useEffect(() => {
    // Periksa token tidak sah dan redirect jika perlu
    if (!userToken || userToken === "undefined" || userToken === "null" || userToken.trim() === "") {
      setCurrentUser({});
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return;
    }

    if (requestInProgress.current) return;

    const getMaklumatPengguna = async () => {
      try {
        requestInProgress.current = true;
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
        const response = await apiClient.get("/auth/me");
        const { success, user } = response.data || response;
        
        if (!success || !user) {
          setCurrentUser({});
          setUserToken(null); // Ini akan mencetuskan navigasi ke login
          if (user && user.message) {
            console.error(user.message);
          }
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error("Ralat semasa mendapatkan maklumat pengguna:", error);
        // Kendalikan ralat pengesahan (401, 403) atau ralat lain
        setCurrentUser({});
        setUserToken(null); // Ini akan mencetuskan navigasi ke login
      } finally {
        requestInProgress.current = false;
      }
    };
    getMaklumatPengguna();
  }, [userToken]);

  // useEffect tambahan untuk mengendalikan pengesahan token pada pemasangan
  useEffect(() => {
    const token = localStorage.getItem("MBI_TOKEN");
    if (!token || token === "undefined" || token === "null" || token.trim() === "") {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }, []);

  return (
    <StateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userToken,
        setUserToken,
        spinner,
        countActive,
        setCountActive,
        logout
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);