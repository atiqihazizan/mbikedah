// components/RootLoading.jsx - Updated dengan isLoading state
import { Navigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useState } from 'react';

/**
 * Root Loading Component with isLoading integration
 */
export default function RootLoading() {
  const { currentUser, isLoading } = useStateContext();
  const { isDark } = useTheme();

  // Show loading screen while authenticating
  if (isLoading) {
    return <AuthLoadingScreen isDark={isDark} />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Smart redirect based on user role
  const defaultRoute = getDefaultRouteForUser(currentUser);
  return <Navigate to={defaultRoute} replace />;
}

/**
 * Get default route based on user abilities
 */
function getDefaultRouteForUser(user) {
  if (!user) {
    return '/applicant'; // Default fallback
  }

  // Check if user has abilities (new structure)
  if (user.ability && user.ability.length > 0) {
    const abilities = Array.isArray(user.ability) ? user.ability : [user.ability];

    // Priority-based routing for abilities
    if (abilities.some(ability => ['admin', 'superuser'].includes(ability))) {
      return '/admin';
    }
    
    if (abilities.some(ability => ['finance', 'kewangan'].includes(ability))) {
      return '/finance';
    }
    
    if (abilities.some(ability => ['hod', 'head_of_department'].includes(ability))) {
      return '/hod';
    }
  }

  // Fallback: Check if user has roles (old structure for backward compatibility)
  if (user.roles && user.roles.length > 0) {
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];

    // Priority-based routing for roles
    if (roles.some(role => ['admin', 'superuser'].includes(role))) {
      return '/admin';
    }
    
    if (roles.some(role => ['finance', 'kewangan'].includes(role))) {
      return '/finance';
    }
    
    if (roles.some(role => ['hod', 'head_of_department'].includes(role))) {
      return '/hod';
    }
  }

  // Default to applicant
  return '/applicant';
}

/**
 * Authentication Loading Screen Component
 */
function AuthLoadingScreen({ isDark }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md mx-auto px-4">
        {/* Loading Spinner */}
        <div className="relative mb-8">
          <div className={`animate-spin rounded-full h-20 w-20 border-4 border-transparent mx-auto ${
            isDark ? 'border-t-blue-400 border-r-blue-400' : 'border-t-blue-600 border-r-blue-600'
          }`}></div>
          <div className={`absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent mx-auto animate-ping ${
            isDark ? 'border-blue-400' : 'border-blue-600'
          } opacity-20`}></div>
        </div>

        {/* Loading Text */}
        <h2 className={`text-2xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Mengesahkan Akses
        </h2>
        
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Sedang menentukan dashboard berdasarkan peranan anda...
        </p>

        {/* Loading Steps */}
        <div className="space-y-2">
          <LoadingStep 
            text="Mengesahkan token"
            isDark={isDark}
            delay={0}
          />
          <LoadingStep 
            text="Mendapatkan maklumat pengguna"
            isDark={isDark}
            delay={500}
          />
          <LoadingStep 
            text="Menyediakan dashboard"
            isDark={isDark}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Step Component with Animation
 */
function LoadingStep({ text, isDark, delay }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex items-center justify-center text-sm transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-30'
    } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      <div className={`w-2 h-2 rounded-full mr-3 ${
        isVisible 
          ? isDark ? 'bg-blue-400' : 'bg-blue-600'
          : isDark ? 'bg-gray-600' : 'bg-gray-300'
      } ${isVisible ? 'animate-pulse' : ''}`}></div>
      {text}
    </div>
  );
}

/**
 * Alternative Simple Loading Component
 */
export function SimpleRootLoading() {
  const { currentUser, isLoading } = useStateContext();
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 ${
            isDark ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Memuat...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForUser(currentUser)} replace />;
}

/**
 * Hook for using loading state in components
 */
export function useLoadingState() {
  const { isLoading } = useStateContext();
  return isLoading;
}

/**
 * Higher-Order Component for loading state
 */
export function withLoadingState(Component) {
  return function LoadingWrappedComponent(props) {
    const isLoading = useLoadingState();
    
    if (isLoading) {
      return <AuthLoadingScreen isDark={false} />; // Default theme
    }
    
    return <Component {...props} />;
  };
}

/**
 * Usage Examples for Other Components
 */

// Example 1: Using isLoading in a component
function ExampleComponent() {
  const { currentUser, isLoading } = useStateContext();

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {currentUser.name}!</div>;
}

// Example 2: Conditional rendering based on loading state
function ExampleDashboard() {
  const { currentUser, isLoading } = useStateContext();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2 ${
              isDark ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Loading dashboard...
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h1>Dashboard Content</h1>
          {/* Your dashboard content */}
        </div>
      )}
    </div>
  );
}

// Example 3: Loading overlay component
function LoadingOverlay({ show, message = "Loading..." }) {
  const { isDark } = useTheme();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`p-6 rounded-lg shadow-lg ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center">
          <div className={`animate-spin rounded-full h-6 w-6 border-b-2 mr-3 ${
            isDark ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          {message}
        </div>
      </div>
    </div>
  );
}

// Example 4: Button with loading state
function ExampleButton({ onClick, isLoading, children, ...props }) {
  const { isDark } = useTheme();

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isLoading
          ? isDark 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
}