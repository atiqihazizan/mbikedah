import { useStateContext } from "../contexts/ContextProvider";
import { useState, useEffect, useRef, useCallback } from "react";
import apiClient from "../axios";
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

  const onSubmit = useCallback(async (ev) => {
    ev.preventDefault();
    setChecking(true);
    setError({ __html: "" });

    try {
      const { success, user, token } = await apiClient.post("/auth/login", { username, password });

      if (!success) {
        throw new Error('Login gagal. Sila cuba lagi.');
      }

      setCurrentUser(user);
      setUserToken(token);
      
    } catch (error) {
      console.error('Ralat semasa log masuk:', error);
      
      let errorMessage;
      if (error.response?.status === 404) {
        errorMessage = "Sistem tidak dapat dihubungi. Sila cuba sebentar lagi.";
      } else if (error.response?.status === 401) {
        errorMessage = "Nama pengguna atau katalaluan tidak sah.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Tiada response dari server') {
        errorMessage = "Tidak dapat berhubung dengan pelayan. Sila cuba sebentar lagi.";
      } else {
        errorMessage = "Ralat semasa log masuk. Sila cuba sebentar lagi.";
      }
      
      setError({ __html: errorMessage });
    } finally {
      setChecking(false);
    }
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
            className="w-full py-2.5 bg-indigo-600 text-white justify-center rounded-md hover:bg-indigo-700"
          >
            {onChecking ? "Sedang Masuk..." : "Masuk"}
          </TButton>
        </form>
      </div>
    </div>
  );
}

export default Login;
