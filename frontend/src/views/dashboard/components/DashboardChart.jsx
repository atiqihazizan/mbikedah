import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function DashboardChart() {
  const chartData = [
    { name: 'Jan', amount: 65000 },
    { name: 'Feb', amount: 78000 },
    { name: 'Mac', amount: 82000 },
    { name: 'Apr', amount: 75000 },
    { name: 'Mei', amount: 90000 },
    { name: 'Jun', amount: 85000 },
    { name: 'Jul', amount: 95000 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Statistik Pembayaran Bulanan</h3>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
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
  );
}

export default DashboardChart;
