import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./layouts/DefaultLayout";
import RootLoading from "./components/RootLoading";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./views/Login";
import Signup from "./views/Signup";
import NotFound from "./views/NotFound"; // Import komponen NotFound

import BillingTableApplicant from "./views/billing/BillingTableApplicant";
import BillingTableHOD from "./views/billing/BillingTableHOD";
import BillingTableFinance from "./views/billing/BillingTableFinance";

// import BillingApproval from "./views/billing/BillingApproval";
import BillingView from "./views/billing/BillingView";
// import BillingPayment from "./views/billing/BillingPayment";
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
			{ path: "applicant", element: <BillingTableApplicant /> },
			
			// HOD specific routes
			{ path: "hod", element: <BillingTableHOD /> },
			
			// Finance specific routes
			{ path: "finance", element: <BillingTableFinance /> },
			
			// Shared routes (accessible by all roles)
			{ path: "finance/:idBilling/view", element: <BillingView /> },
			{ path: "finance/:idBilling/check", element: <BillingCheck /> },
			{ path: "finance/:idBilling/verify", element: <BillingVerify /> },
			// { path: "finance/:idBilling/approval", element: <BillingApproval /> },
			// { path: "finance/:idBilling/payment", element: <BillingPayment /> },
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