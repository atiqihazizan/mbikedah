import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./components/DefaultLayout";
import Dashboard from "./views/Dashboard";
import Payments from "./views/Payments";
import PaymentsForm from "./views/Payments/Forms";

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
			{ path: "/billing/archive", element: <Payments /> },
			{ path: "/billing/form", element: <PaymentsForm /> },
			{ path: "/billing/:idform/edit", element: <PaymentsForm /> },
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
