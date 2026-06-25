/**
 * DEMO: How to use FinancialReportsDropdown in different scenarios
 * 
 * File: examples/FinancialReportsDropdownDemo.jsx
 */

import React from 'react';
import FinancialReportsDropdown from '../components/header/FinancialReportsDropdown';

// ============================================================================
// Example 1: Basic Usage in Navbar
// ============================================================================
const NavbarExample = () => {
  return (
    <nav className="bg-white border-b shadow">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">MBIClick Pro</h1>
            
            {/* Other navigation items */}
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </a>
            <a href="/billing" className="text-gray-700 hover:text-blue-600">
              Billing
            </a>
          </div>

          {/* Financial Reports Dropdown */}
          <FinancialReportsDropdown />
        </div>
      </div>
    </nav>
  );
};

// ============================================================================
// Example 2: With Dark Mode Toggle
// ============================================================================
const DarkModeExample = () => {
  const [isDark, setIsDark] = React.useState(false);

  return (
    <div className={isDark ? 'bg-gray-900' : 'bg-white'}>
      <div className="p-4 flex items-center justify-between">
        {/* Dark mode toggle */}
        <button 
          onClick={() => setIsDark(!isDark)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Toggle Theme
        </button>

        {/* Dropdown with theme prop */}
        <FinancialReportsDropdown isDark={isDark} />
      </div>
    </div>
  );
};

// ============================================================================
// Example 3: Integrated with Permission Check
// ============================================================================
const PermissionAwareExample = () => {
  const { canAccessReports } = usePermissions();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* User info and other content */}
            <h2>Welcome, User</h2>
          </div>

          {/* Only show if user has report access */}
          {canAccessReports && (
            <FinancialReportsDropdown />
          )}
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// Example 4: Side-by-side with Other Dropdowns
// ============================================================================
const MultipleDropdownsExample = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Settings Dropdown */}
      <button className="px-4 py-2 bg-white border rounded-lg">
        Settings ▼
      </button>

      {/* Financial Reports Dropdown */}
      <FinancialReportsDropdown />

      {/* User Profile Dropdown */}
      <button className="px-4 py-2 bg-white border rounded-lg">
        Profile ▼
      </button>
    </div>
  );
};

// ============================================================================
// Example 5: Custom Styling Wrapper
// ============================================================================
const CustomStyledExample = () => {
  return (
    <div className="relative z-50">
      {/* Wrapper with custom styling */}
      <div className="inline-block">
        <FinancialReportsDropdown />
      </div>
      
      {/* Optional: Badge indicator */}
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
    </div>
  );
};

// ============================================================================
// Example 6: Mobile Responsive Version
// ============================================================================
const MobileResponsiveExample = () => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      {/* Mobile: Stack vertically */}
      {/* Desktop: Horizontal layout */}
      
      <div className="flex-1">
        <h1 className="text-lg font-bold">Dashboard</h1>
      </div>

      {/* Dropdown adapts to screen size */}
      <div className="w-full md:w-auto">
        <FinancialReportsDropdown />
      </div>
    </div>
  );
};

// ============================================================================
// Example 7: Testing Different User Permissions
// ============================================================================
const PermissionTestingExample = () => {
  // Simulate different user scenarios
  const scenarios = [
    { name: 'Admin (All Reports)', reportCount: 5 },
    { name: 'Manager (3 Reports)', reportCount: 3 },
    { name: 'Staff (1 Report)', reportCount: 1 },
    { name: 'Guest (No Reports)', reportCount: 0 }
  ];

  return (
    <div className="space-y-4 p-4">
      {scenarios.map((scenario) => (
        <div key={scenario.name} className="border p-4 rounded">
          <h3 className="font-bold mb-2">{scenario.name}</h3>
          <p className="text-sm text-gray-600 mb-3">
            Available Reports: {scenario.reportCount}
          </p>
          
          {scenario.reportCount > 0 ? (
            <FinancialReportsDropdown />
          ) : (
            <p className="text-gray-400 text-sm">No reports available</p>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Example 8: Animation States Demo
// ============================================================================
const AnimationStatesDemo = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-lg font-bold">Dropdown States</h2>
      
      <div className="space-y-2">
        <div className="border p-4 rounded">
          <p className="mb-2 text-sm font-medium">Normal State (Closed)</p>
          <FinancialReportsDropdown />
        </div>

        <div className="border p-4 rounded bg-gray-50">
          <p className="mb-2 text-sm font-medium">Hover State</p>
          <p className="text-xs text-gray-600">
            Hover over dropdown to see effect
          </p>
        </div>

        <div className="border p-4 rounded bg-blue-50">
          <p className="mb-2 text-sm font-medium">Focused/Open State</p>
          <p className="text-xs text-gray-600">
            Click dropdown to see menu items
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export all examples
// ============================================================================
export {
  NavbarExample,
  DarkModeExample,
  PermissionAwareExample,
  MultipleDropdownsExample,
  CustomStyledExample,
  MobileResponsiveExample,
  PermissionTestingExample,
  AnimationStatesDemo
};

// Default export: Comprehensive demo
export default function FinancialReportsDropdownDemo() {
  return (
    <div className="space-y-8 p-8 bg-gray-100">
      <h1 className="text-2xl font-bold">Financial Reports Dropdown - Examples</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">1. Basic Navbar Usage</h2>
        <NavbarExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">2. Dark Mode Support</h2>
        <DarkModeExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">3. Multiple Dropdowns</h2>
        <MultipleDropdownsExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">4. Permission Testing</h2>
        <PermissionTestingExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">5. Animation States</h2>
        <AnimationStatesDemo />
      </section>
    </div>
  );
}
