import React from "react";
import ReactDOM from "react-dom/client";
import router from "./router.jsx";
import { RouterProvider } from "react-router-dom";
import { ContextProvider } from "./contexts/ContextProvider.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import "./assets/vendors/keenicons/styles.bundle.css";
import "./assets/css/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContextProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        // limit={1}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={true}
        theme="colored"
      />
    </ContextProvider>
  </React.StrictMode>
);
