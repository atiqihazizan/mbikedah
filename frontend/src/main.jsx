import React from "react";
import ReactDOM from "react-dom/client";
import router from "./router.jsx";
import { RouterProvider } from "react-router-dom";
import { ContextProvider } from "./contexts/ContextProvider.jsx";
import "./index.css";
import "./assets/vendors/keenicons/styles.bundle.css";
import "./assets/css/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContextProvider>
      <RouterProvider router={router} />
    </ContextProvider>
  </React.StrictMode>
);
