import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./components/DefaultLayout";
import RootLoading from "./components/RootLoading";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import Signup from "./views/Signup";
import NotFound from "./views/NotFound"; // Import komponen NotFound

import BillingForm from "./views/billing/BillingForm";
import BillingTableActive from "./views/billing/BillingTableActive";
import BillingTableHOD from "./views/billing/BillingTableHOD";
import BillingTableFinance from "./views/billing/BillingTableFinance";
import BillingPaper from "./views/billing/BillingPaper";
import BillingView from "./views/billing/BillingView";
import BillingPayment from "./views/billing/BillingPayment";
import BillingCheck from "./views/billing/BillingCheck";
import BillingVerify from "./views/billing/BillingVerify";

const router = createBrowserRouter([
	{
		path: "/",
		element: <DefaultLayout />,
		children: [
			// Root path will be handled by RootLoading with auto-redirect
			{ path: "", element: <RootLoading /> },
			
			// Pemohon specific routes
			{ path: "billing/dashboard", element: <BillingTableActive /> },
			{ path: "billing/create", element: <BillingForm /> },
			{ path: "billing/:idform/edit", element: <BillingForm /> },
			
			// HOD specific routes
			{ path: "billing/hod", element: <BillingTableHOD /> },
			
			// Finance specific routes
			{ path: "billing/finance", element: <BillingTableFinance /> },
			
			// Shared routes (accessible by all roles)
			// { path: "billing/:idBilling/:pageback/show", element: <BillingPaper /> },
			{ path: "billing/:idBilling/view", element: <BillingView /> },
			{ path: "billing/:idBilling/check", element: <BillingCheck /> },
			{ path: "billing/:idBilling/verify", element: <BillingVerify /> },
			{ path: "billing/:idBilling/approval", element: <BillingPaper /> },
			{ path: "billing/:idBilling/payment", element: <BillingPayment /> },
		],
	},
	{
		path: "/",
		element: <GuestLayout />,
		children: [
			{ path: "login", element: <Login /> },
			{ path: "signup", element: <Signup /> },
		],
	},
	// Catch-all route untuk halaman yang tidak ditemukan
	{
		path: "*",
		element: <NotFound />
	}
]);

export default router;