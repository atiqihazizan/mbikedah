import { Outlet } from "react-router-dom";
import { useStateContext } from '../contexts/ContextProvider';
/**
 * Reports Layout Component
 * Includes main navigation for consistency
 */
export default function ReportsLayout() {
  const { currentUser } = useStateContext();

  // Don't render anything if no current user
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      {/* Page Content */}
      <main className="px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
