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

import BillingView from "./views/billing/BillingView";
import BillingCheck from "./views/billing/BillingCheck";

import ProtectedRoute from "./components/ProtectedRouter";
import SettingsLayout from "./layouts/SettingsLayout";
import BudgetSummary from "./views/reports/BudgetSummary";
import IncomeExpenditureStatement from "./views/reports/IncomeExpenditureStatement";
import RevenueBreakdown from "./views/reports/RevenueBreakdown";
import ExpenseBreakdown from "./views/reports/ExpenseBreakdown";

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
		],
	},
	{
		path: "/reports",
		element: <DefaultLayout />,
		children: [
			// Root path will be handled by RootLoading with auto-redirect
			{ path: "", element: <RootLoading /> },
			
			// Pemohon specific routes
			{ path: "budget_summary", element: <BudgetSummary /> },
			
			// HOD specific routes
			{ path: "income_statement", element: <IncomeExpenditureStatement /> },
			
			// Finance specific routes
			{ path: "revenue_breakdown", element: <RevenueBreakdown /> },
			
			// Finance specific routes
			{ path: "expense_breakdown", element: <ExpenseBreakdown /> },
		],
	},
	// Settings Route - Protected for all authenticated users
	{
		path: "/settings",
		element: (
			<ProtectedRoute>
				<SettingsLayout />
			</ProtectedRoute>
		)
	},
	//
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