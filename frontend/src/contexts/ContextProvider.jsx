import { createContext, useContext, useState } from "react";

const StateContext = createContext({
  currentUser: {},
  userToken: null,
  spinner: { message: null, show: false },
  setCurrentUser: () => {},
  setUserToken: () => {},
  countActive: 0,
  setCountActive: () => {}
});

export const ContextProvider = ({ children }) => {
  const [countActive, setCountActive] = useState(0)
  const [currentUser, setCurrentUser] = useState({
    role: "",
  });
  const [userToken, _setUserToken] = useState(
    localStorage.getItem("MBI_TOKEN") || ""
  );
  const [spinner, setSpinner] = useState({ message: "", show: false });

  const setUserToken = (token) => {
    if (token) localStorage.setItem("MBI_TOKEN", token);
    else localStorage.removeItem("MBI_TOKEN");
    _setUserToken(token);
  };

  return (
    <StateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userToken,
        setUserToken,
        spinner,
        countActive,
        setCountActive
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
