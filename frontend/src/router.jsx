import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./components/DefaultLayout";
import Dashboard from "./views/Dashboard";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import Signup from "./views/Signup";

import BillingForm from "./views/billing/BillingForm";
import BillingTableActive from "./views/billing/BillingTableActive";
import BillingTableHOD from "./views/billing/BillingTableHOD";
import BillingTableFinance from "./views/billing/BillingTableFinance";
import BillingTableArchive from "./views/billing/BillingTableArchive";

const router = createBrowserRouter([
	{
		path: "/",
		element: <DefaultLayout />,
		children: [
			{ path: "/dashboard", element: <Navigate to="/" /> },
			{ path: "/", element: <Dashboard /> },
      { path: "/billing/incomplete", element: <BillingTableActive /> },
			{ path: "/billing/archive", element: <BillingTableArchive /> },
			{ path: "/billing/form", element: <BillingForm /> },
			{ path: "/billing/:idform/edit", element: <BillingForm /> },
      { path: "/billing/hod", element: <BillingTableHOD /> },
      { path: "/billing/finance", element: <BillingTableFinance /> },
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
