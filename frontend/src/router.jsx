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
			{ path: "/papan-pemuka", element: <Navigate to="/" /> },
			{ path: "/", element: <Dashboard /> },
			{ path: "/pembayaran/belum-selesai", element: <Payments /> },
			{ path: "/pembayaran/selesai", element: <Payments /> },
			{ path: "/pembayaran/borang", element: <PaymentsForm /> },
			{ path: "/pembayaran/belum-selesai/:idform", element: <PaymentsForm /> },
		],
	},
	{
		path: "/",
		element: <GuestLayout />,
		children: [
			{ path: "/login", element: <Login /> },
			{ path: "/daftar", element: <Signup /> },
		],
	},
]);

export default router;
