import { useStateContext } from "../contexts/ContextProvider";
import { useState, useEffect, useRef, useCallback } from "react";
import axiosClient from "../axios";
import TButton from "../components/Core/TButton";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import Logo from "../assets/logo.png"; // Gantilah dengan path logo yang sesuai

function Login() {
  const { setCurrentUser, setUserToken } = useStateContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [onChecking, setChecking] = useState(false);
  const [error, setError] = useState({ __html: "" });
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const onSubmit = useCallback((ev) => {
    ev.preventDefault();
    setChecking(true);
    setError({ __html: "" });

    axiosClient
      .post("/auth/login", { username, password })
      .then(({ user, token }) => {
        setChecking(false);
        setCurrentUser(user);
        setUserToken(token);
      })
      .catch((error) => {
        setChecking(false);
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           (error.response?.status === 404 ? "API endpoint tidak ditemui" : "Login gagal. Sila cuba lagi.");
        setError({ __html: errorMessage });
        console.error('Login error:', error);
      });
  }, [username, password, setCurrentUser, setUserToken]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Logo" className="h-16" />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">Log Masuk</h2>
        {error.__html && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-red-600" dangerouslySetInnerHTML={error}></div>
        )}
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengguna</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                ref={usernameRef}
                type="text"
                className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Katalaluan</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <TButton
            onChecking={onChecking}
            isClasses="w-full py-2.5 bg-indigo-600 text-white justify-center rounded-md hover:bg-indigo-700"
          >
            {onChecking ? "Sedang Masuk..." : "Masuk"}
          </TButton>
        </form>
      </div>
    </div>
  );
}

export default Login;
