import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./components/DefaultLayout";
import Dashboard from "./views/Dashboard";
import BillingTable from "./views/billing/BillingTable";
import BillingForm from "./views/billing/BillingForm";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import Signup from "./views/Signup";

const router = createBrowserRouter([
	{
		path: "/",
		element: <DefaultLayout />,
		children: [
			{ path: "/dashboard", element: <Navigate to="/" /> },
			{ path: "/", element: <Dashboard /> },
			// { path: "/billing/archive", element: <Payments /> },
      { path: "/billing/icomplete", element: <BillingTable /> },
			{ path: "/billing/form", element: <BillingForm /> },
			{ path: "/billing/:idform/edit", element: <BillingForm /> },
		],
	},
	{
		path: "/",
		element: <GuestLayout />,
		children: [
			{ path: "/login", element: <Login /> },
			{ path: "/signup", element: <Signup /> },
		],
	},
]);

export default router;
