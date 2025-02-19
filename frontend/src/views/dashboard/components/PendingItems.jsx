function PendingItems({ isLoading, items }) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Tindakan Menunggu</h2>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-4">Memuat...</div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between border-b pb-6 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-lg">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.count} permohonan • {item.amount}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{item.department}</p>
                </div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingItems;
