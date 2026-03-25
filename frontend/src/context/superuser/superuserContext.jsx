import { createContext, useContext, useReducer, useEffect } from "react";
import superuserReducer from "./superuserReducer";

const SuperuserContext = createContext();

const initialState = { isLoggedIn: false, superuser: null };


const SuperuserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(superuserReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("superuserToken");
    if (!token) return;

    fetch("/api/superuser/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.isLoggedIn) {
          dispatch({ type: "LOGIN", payload: { superuser: data.superuser } });
        } else {
          localStorage.removeItem("superuserToken");
        }
      })
      .catch(() => localStorage.removeItem("superuserToken"));
  }, []);

  return (
    <SuperuserContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SuperuserContext.Provider>
  );
};

const useSuperuser = () => {
  const ctx = useContext(SuperuserContext);
  if (!ctx) throw new Error("useSuperuser must be used inside SuperuserProvider");
  return ctx;
};

export { SuperuserProvider, useSuperuser };
