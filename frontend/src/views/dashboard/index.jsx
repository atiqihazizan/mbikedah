import { useStateContext } from "../contexts/ContextProvider";
import PageComponent from "../components/PageComponent";
import { FaMoneyBillWave, FaFileInvoice, FaUserFriends, FaChartLine } from "react-icons/fa";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const { currentUser } = useStateContext();

  const getApplicantDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <FaMoneyBillWave size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Jumlah Permohonan</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <FaFileInvoice size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Permohonan Dalam Proses</p>
              <p className="text-2xl font-semibold">5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Tindakan Menunggu</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between border-b pb-6">
              <div>
                <p className="font-medium text-lg">Permohonan Dalam Proses</p>
                <p className="text-sm text-gray-600 mt-1">
                  5 permohonan • RM 12,500.00
                </p>
                <p className="text-sm text-gray-600 mt-1">Jabatan Kejuruteraan</p>
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Menunggu Pengesahan HOD
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const getHodDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <FaMoneyBillWave size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Permohonan Baru</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <FaFileInvoice size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Telah Disahkan</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Tindakan Menunggu</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between border-b pb-6">
              <div>
                <p className="font-medium text-lg">Permohonan Baru</p>
                <p className="text-sm text-gray-600 mt-1">
                  12 permohonan • RM 45,600.00
                </p>
                <p className="text-sm text-gray-600 mt-1">Jabatan Kejuruteraan</p>
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Menunggu Pengesahan
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const getFinanceDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <FaMoneyBillWave size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Perlu Semakan</p>
              <p className="text-2xl font-semibold">15</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <FaFileInvoice size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Perlu Kelulusan</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <FaFileInvoice size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Proses Bayaran</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Statistik Pembayaran Bulanan</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart
                data={[
                  { name: 'Jan', amount: 65000 },
                  { name: 'Feb', amount: 78000 },
                  { name: 'Mac', amount: 82000 },
                  { name: 'Apr', amount: 75000 },
                  { name: 'Mei', amount: 90000 },
                  { name: 'Jun', amount: 85000 },
                  { name: 'Jul', amount: 95000 }
                ]}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Tindakan Menunggu</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b pb-6">
                <div>
                  <p className="font-medium text-lg">Perlu Semakan</p>
                  <p className="text-sm text-gray-600 mt-1">
                    15 permohonan • RM 78,900.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Jabatan Kewangan</p>
                </div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Belum Disemak
                </div>
              </div>
              <div className="flex items-start justify-between border-b pb-6">
                <div>
                  <p className="font-medium text-lg">Perlu Kelulusan</p>
                  <p className="text-sm text-gray-600 mt-1">
                    8 permohonan • RM 34,500.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Jabatan Kewangan</p>
                </div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Menunggu Kelulusan
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-lg">Proses Bayaran</p>
                  <p className="text-sm text-gray-600 mt-1">
                    12 permohonan • RM 56,700.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Jabatan Kewangan</p>
                </div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Menunggu Pembayaran
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const getHrDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <FaUserFriends size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Permohonan HR</p>
              <p className="text-2xl font-semibold">6</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <FaFileInvoice size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Permohonan Diproses</p>
              <p className="text-2xl font-semibold">4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Tindakan Menunggu</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between border-b pb-6">
              <div>
                <p className="font-medium text-lg">Permohonan HR</p>
                <p className="text-sm text-gray-600 mt-1">
                  6 permohonan • RM 23,400.00
                </p>
                <p className="text-sm text-gray-600 mt-1">Jabatan HR</p>
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Perlu Tindakan
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const getDashboardByRole = () => {
    switch (currentUser?.role) {
      case 'applicant':
        return getApplicantDashboard();
      case 'hod':
        return getHodDashboard();
      case 'finance':
        return getFinanceDashboard();
      case 'hr':
        return getHrDashboard();
      default:
        return getApplicantDashboard();
    }
  };

  const getDashboardTitle = () => {
    switch (currentUser?.role) {
      case 'applicant':
        return "Dashboard Pemohon";
      case 'hod':
        return "Dashboard Ketua Jabatan";
      case 'finance':
        return "Dashboard Kewangan";
      case 'hr':
        return "Dashboard HR";
      default:
        return "Dashboard";
    }
  };

  return (
    <PageComponent title={getDashboardTitle()}>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] scrollable-y-hover overflow-auto">
        {getDashboardByRole()}
      </div>
    </PageComponent>
  );
}

export default Dashboard;
