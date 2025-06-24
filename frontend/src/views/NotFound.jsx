import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-8">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin telah dipindahkan.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Kembali ke Beranda
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Kembali ke Halaman Sebelumnya
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator sistem.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;