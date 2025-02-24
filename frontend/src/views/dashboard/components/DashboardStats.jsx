import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function DashboardStats({ statsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-gray-100 text-gray-500">
            <FaFileAlt size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Draf</p>
            <p className="text-2xl font-semibold">{statsData.draft_count || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
            <FaClock size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Dalam Proses</p>
            <p className="text-2xl font-semibold">{statsData.pending_count || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-500">
            <FaCheckCircle size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Diluluskan</p>
            <p className="text-2xl font-semibold">{statsData.approved_count || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-500">
            <FaTimesCircle size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Ditolak</p>
            <p className="text-2xl font-semibold">{statsData.rejected_count || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
