export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} p-4 rounded-lg flex items-center`}>
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}