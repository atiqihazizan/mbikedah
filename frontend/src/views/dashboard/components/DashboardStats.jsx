import { FaMoneyBillWave, FaFileInvoice, FaUserFriends, FaChartLine } from "react-icons/fa";

function DashboardStats({ statsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-500">
            <FaMoneyBillWave size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Jumlah Pembayaran</p>
            <p className="text-2xl font-semibold">RM {statsData.totalPayments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
            <FaFileInvoice size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Pembayaran Tertunggak</p>
            <p className="text-2xl font-semibold">{statsData.pendingPayments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-500">
            <FaUserFriends size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Jumlah Pengguna</p>
            <p className="text-2xl font-semibold">{statsData.totalUsers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-500">
            <FaChartLine size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Pertumbuhan Bulanan</p>
            <p className="text-2xl font-semibold">{statsData.monthlyGrowth}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
