import { createContext, useContext, useEffect, useRef, useState } from "react";
import apiClient from "../utils/axios";

const StateContext = createContext({
  currentUser: {},
  userToken: null,
  isLoading: true,
  spinner: { message: null, show: false },
  setCurrentUser: () => {},
  setUserToken: () => {},
  countActive: 0,
  setCountActive: () => {},
  logout: () => {}
});

export const ContextProvider = ({ children }) => {
  const [countActive, setCountActive] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for authentication
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
      // Axios interceptor will handle the Authorization header automatically
    } else {
      localStorage.removeItem("MBI_TOKEN");
      _setUserToken("");
      // Clear axios default header
      if (apiClient.defaults.headers.common["Authorization"]) {
        delete apiClient.defaults.headers.common["Authorization"];
      }
      // Can't use navigate here, handle redirection in useEffect
    }
  };

  /**
   * Logout function - handles user logout process
   * FIXED: Removed window.location.href redirect to prevent page reload
   * Now uses single-source redirect via ProtectedRoute for smoother UX
   */
  const logout = async (ev) => {
    if (ev) ev.preventDefault();
    
    try {
      // Make API call BEFORE clearing token to avoid 401 error
      if (userToken && userToken !== "undefined" && userToken !== "null" && userToken.trim() !== "") {
        await apiClient.post("/auth/logout");
      }
    } catch (error) {
      console.error("Ralat semasa log keluar. Sila cuba sebentar lagi.");
      // Continue with logout even if API fails
    } finally {
      // Clear user data and token after API call (or if it fails)
      setCurrentUser(null);  // Triggers ProtectedRoute to redirect
      setUserToken("");      // Clear token from state
      localStorage.removeItem("MBI_TOKEN");  // Clear token from storage
      
      // Clear axios default headers to prevent stale auth
      if (apiClient.defaults.headers.common["Authorization"]) {
        delete apiClient.defaults.headers.common["Authorization"];
      }
      
      setIsLoading(false);
      
      // REMOVED: window.location.href = "/login" 
      // WHY: Caused multiple competing redirects and page reload
      // NOW: ProtectedRoute handles redirect via React Router <Navigate replace />
      // BENEFIT: Smooth SPA navigation without page refresh
    }
  };

  /**
   * useEffect: Monitor token changes and handle authentication state
   * FIXED: Removed window.location.href redirect to prevent page reload
   */
  useEffect(() => {
    // Periksa token tidak sah dan redirect jika perlu
    if (!userToken || userToken === "undefined" || userToken === "null" || userToken.trim() === "") {
      setCurrentUser(null);  // Clear user state
      setIsLoading(false);   // Stop loading when no token
      
      // REMOVED: window.location.href = "/login"
      // WHY: Created race conditions with logout() and caused page reload
      // NOW: ProtectedRoute detects !currentUser and redirects via React Router
      return;
    }

    if (requestInProgress.current) return;

    const getMaklumatPengguna = async () => {
      try {
        setIsLoading(true); // Start loading
        requestInProgress.current = true;
        // Axios interceptor will handle the Authorization header automatically
        const response = await apiClient.get("/auth/me");
        const { success, user } = response.data || response;
        
        if (!success || !user) {
          setCurrentUser(null);
          setUserToken(""); // Clear token immediately
          localStorage.removeItem("MBI_TOKEN");
          if (user && user.message) {
            console.error(user.message);
          }
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error("Ralat semasa mendapatkan maklumat pengguna:", error);
        // Kendalikan ralat pengesahan (401, 403) atau ralat lain
        setCurrentUser(null);
        setUserToken(""); // Clear token immediately
        localStorage.removeItem("MBI_TOKEN");
      } finally {
        setIsLoading(false); // Stop loading after request completes
        requestInProgress.current = false;
      }
    };
    getMaklumatPengguna();
  }, [userToken]);

  /**
   * useEffect: Handle initial authentication check on component mount
   * FIXED: Removed window.location.href redirect to prevent page reload
   */
  useEffect(() => {
    const token = localStorage.getItem("MBI_TOKEN");
    if (!token || token === "undefined" || token === "null" || token.trim() === "") {
      setCurrentUser(null);
      setUserToken("");
      setIsLoading(false); // Stop loading if no token on mount
      
      // REMOVED: window.location.href = "/login"
      // WHY: Could conflict with other redirects during app initialization
      // NOW: ProtectedRoute handles all authentication redirects consistently
    }
  }, []);

  return (
    <StateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userToken,
        setUserToken,
        isLoading,
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