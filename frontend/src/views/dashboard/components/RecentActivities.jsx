import { Link } from "react-router-dom";

function RecentActivities({ isLoading, activities }) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Aktiviti Terkini</h2>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-4">Memuat...</div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <Link 
                key={activity.id} 
                to={
                  activity.type === "payment" 
                    ? "/billing/icomplete" 
                    : activity.type === "document" 
                    ? "/billing/form" 
                    : "#"
                }
                className="block hover:bg-gray-50"
              >
                <div className="flex items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    {activity.amount && (
                      <p className="text-sm text-gray-600 mt-1">{activity.amount}</p>
                    )}
                    {activity.status && (
                      <p className="text-sm text-gray-600 mt-1">Status: {activity.status}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{activity.timestamp}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentActivities;
