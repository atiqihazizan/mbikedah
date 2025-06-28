import { useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

function RootLoading() {
  const navigate = useNavigate();
  const { userRoles, currentActiveRole } = useOutletContext();

  // Redirect to appropriate role page
  useEffect(() => {
    if (userRoles && userRoles.length > 0) {
      const firstRole = userRoles[0];
      
      // Define role routes
      const roleRoutes = {
        'Pemohon': '/applicant',
        'Ketua Jabatan': '/hod',
        'Kewangan': '/finance'
      };
      
      const targetRoute = roleRoutes[firstRole] || '/applicant';
      navigate(targetRoute, { replace: true });
    }
  }, [userRoles, navigate]);

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="absolute top-2 left-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-lg font-medium">Memuat sistem...</p>
          <p className="text-gray-500 text-sm mt-1">Mengenal pasti role pengguna</p>
        </div>
        
        {currentActiveRole && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <span className="font-medium">Role dikesan:</span> {currentActiveRole}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RootLoading;