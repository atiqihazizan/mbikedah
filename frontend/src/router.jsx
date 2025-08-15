import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./layouts/DefaultLayout";
import RootLoading from "./components/RootLoading";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./views/Login";
import Signup from "./views/Signup";
import NotFound from "./views/NotFound";

import ProtectedRoute from "./components/ProtectedRouter";

// Billing Components
import BillingTableApplicant from "./views/billing/BillingTableApplicant";
import BillingTableHOD from "./views/billing/BillingTableHOD";
import BillingTableFinance from "./views/billing/BillingTableFinance";
import BillingView from "./views/billing/BillingView";
import BillingCheck from "./views/billing/BillingCheck";

// Layout Components
import SettingsLayout from "./layouts/SettingsLayout";
import ReportsFinanceLayout from "./layouts/ReportsFinanceLayout";

// Report Components
import BudgetSummary from "./views/reports/BudgetSummary";
import IncomeExpenditureStatement from "./views/reports/IncomeExpenditureStatement";
import RevenueBreakdown from "./views/reports/RevenueBreakdown";
import ExpenseBreakdown from "./views/reports/ExpenseBreakdown";

// Settings Components
import ProfileSettings from "./views/settings/ProfileSettings";
import SecuritySettings from "./views/settings/SecuritySettings";
import BudgetSettings from "./views/settings/BudgetSettings";
import BudgetArchive from "./views/settings/BudgetArchive";
import BankBalanceSettings from "./views/settings/BankBalanceSettings";

// Admin Components (perlu buat atau import)
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./views/admin/AdminDashboard";
import UserManagement from "./views/admin/UserManagement";
import DepartmentManagement from "./views/admin/DepartmentManagement";
import RoleManagement from "./views/admin/RoleManagement";
import SystemSettings from "./views/admin/SystemSettings";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<ProtectedRoute>
				<DefaultLayout />
			</ProtectedRoute>
		),
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
	
	// Report Routes - Protected for all authenticated users
	{
		path: "/reports",
		element: (
			<ProtectedRoute>
				<ReportsFinanceLayout />
			</ProtectedRoute>
		),
		children: [
			// Root path will be handled by RootLoading with auto-redirect
			{ path: "", element: <Navigate to="/reports/budget_summary" replace /> },
					
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
	
	// Admin Routes - Protected for admin users only
	{
		path: "/admin",
		element: (
			<ProtectedRoute requireRole={["admin", "superuser"]}>
				<AdminLayout />
			</ProtectedRoute>
		),
		children: [
			{ path: "", element: <Navigate to="/admin/dashboard" replace /> },
			{ path: "dashboard", element: <AdminDashboard /> },
			{ path: "users", element: <UserManagement /> },
			{ path: "departments", element: <DepartmentManagement /> },
			{ path: "roles", element: <RoleManagement /> },
			{ path: "system", element: <SystemSettings /> },
		],
	},
	
	// Settings Routes - Protected for all authenticated users
	{
		path: "/settings",
		element: (
			<ProtectedRoute>
				<SettingsLayout />
			</ProtectedRoute>
		),
		children: [
			{ path: "", element: <Navigate to="/settings/profile" replace /> },
			{ path: "profile", element: <ProfileSettings /> },
			{ path: "security", element: <SecuritySettings /> },
			{ path: "budget", element: <BudgetSettings /> },
			{ path: "budget-archive", element: <BudgetArchive /> },
			{ path: "bank-balance", element: <BankBalanceSettings /> },
		]
	},
	
	// Guest Routes
	{
		path: "/login",
		element: <GuestLayout />,
		children: [
			{ path: "", element: <Login /> },
		],
	},
	{
		path: "/signup",
		element: <GuestLayout />,
		children: [
			{ path: "", element: <Signup /> },
		],
	},
	
	// Fallback
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;