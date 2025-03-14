export default function PulseTable() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}
