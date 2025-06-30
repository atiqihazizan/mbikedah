import React from "react";
import ReactDOM from "react-dom/client";
import router from "./router.jsx";
import { RouterProvider } from "react-router-dom";
import { ContextProvider } from "./contexts/ContextProvider.jsx";
import { ToastContainer } from 'react-toastify';

// Import TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import "./assets/vendors/keenicons/styles.bundle.css";
import "./assets/css/styles.css";
import "./assets/css/dashboard-tabs.css";

// Create QueryClient dengan default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data fresh selama 5 minit
      cacheTime: 10 * 60 * 1000, // Cache selama 10 minit
      retry: 2, // Retry 2 kali kalau fail
      refetchOnWindowFocus: false, // Set false untuk avoid too many refetch
      refetchOnMount: true, // Refetch masa component mount
      refetchOnReconnect: true, // Refetch masa internet reconnect
    },
    mutations: {
      retry: 1, // Retry mutation 1 kali sahaja
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          // limit={1}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          // pauseOnFocusLoss
          draggable
          pauseOnHover={true}
          theme="colored"
        />
        
        {/* React Query DevTools - hanya untuk development */}
        {/* {process.env.NODE_ENV === 'development' && (
        )} */}
        {/* <ReactQueryDevtools 
          initialIsOpen={true} 
          position="bottom-right"
        /> */}
      </ContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);