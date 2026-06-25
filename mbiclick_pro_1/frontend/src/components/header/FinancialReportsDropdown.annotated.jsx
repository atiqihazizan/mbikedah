/**
 * FinancialReportsDropdown Component
 * 
 * Komponen dropdown untuk menu Laporan Kewangan.
 * Menggantikan horizontal badges dengan dropdown menu yang lebih compact.
 * 
 * @author MBIClick Pro Team
 * @version 1.0.0
 * 
 * FEATURES:
 * - Auto-close on outside click
 * - Permission-based filtering
 * - Dark mode support
 * - Active route highlighting
 * - Smooth animations
 * - Icon mapping per report type
 * 
 * USAGE:
 * import FinancialReportsDropdown from './components/header/FinancialReportsDropdown';
 * 
 * <FinancialReportsDropdown isDark={false} />
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  ChevronDown,   // Dropdown indicator icon
  FileText,      // Default/detail report icon
  PieChart,      // Budget summary icon
  BarChart3,     // Income statement icon
  TrendingUp,    // Revenue breakdown icon
  TrendingDown   // Expense breakdown icon
} from 'lucide-react';

/**
 * Props Interface (TypeScript-style documentation)
 * 
 * @typedef {Object} FinancialReportsDropdownProps
 * @property {boolean} [isDark=false] - Enable dark mode styling
 */

const FinancialReportsDropdown = ({ isDark = false }) => {
  // ========================================================================
  // STATE & HOOKS
  // ========================================================================
  
  // Dropdown open/close state
  const [isOpen, setIsOpen] = useState(false);
  
  // Ref for detecting outside clicks
  const dropdownRef = useRef(null);
  
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get dynamic reports based on user permissions
  const { reportItems } = usePermissions();

  // ========================================================================
  // ICON MAPPING
  // ========================================================================
  
  /**
   * Map report types to their corresponding icons
   * Icons from lucide-react library
   */
  const reportIcons = {
    budget_summary: <PieChart size={16} />,
    income_statement: <BarChart3 size={16} />,
    revenue_breakdown: <TrendingUp size={16} />,
    expense_breakdown: <TrendingDown size={16} />,
    detail: <FileText size={16} />
  };

  // ========================================================================
  // EFFECTS
  // ========================================================================
  
  /**
   * Handle click outside dropdown to auto-close
   * Cleanup event listener on unmount
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  /**
   * Toggle dropdown open/close
   */
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Navigate to selected report and close dropdown
   * @param {string} route - Report route to navigate to
   */
  const handleItemClick = (route) => {
    navigate(route);
    setIsOpen(false);
  };

  /**
   * Check if route is currently active
   * @param {string} route - Route to check
   * @returns {boolean} True if route is active
   */
  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

  // ========================================================================
  // CONDITIONAL RENDERING
  // ========================================================================
  
  /**
   * Hide component if no reports available
   * This respects user permissions automatically
   */
  if (!reportItems || reportItems.length === 0) {
    return null;
  }

  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* ---------------------------------------------------------------- */}
      {/* DROPDOWN BUTTON                                                  */}
      {/* ---------------------------------------------------------------- */}
      <button
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200 shadow-sm
          ${isDark 
            ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }
          ${isOpen ? 'ring-2 ring-blue-500' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Icon */}
        <FileText size={18} />
        
        {/* Label */}
        <span>Laporan Kewangan</span>
        
        {/* Chevron (rotates when open) */}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ---------------------------------------------------------------- */}
      {/* DROPDOWN MENU                                                    */}
      {/* ---------------------------------------------------------------- */}
      {isOpen && (
        <div 
          className={`
            absolute right-0 mt-2 w-64 rounded-lg shadow-xl border z-50
            ${isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}
        >
          <div className={`py-1 ${isDark ? 'divide-gray-700' : 'divide-gray-100'} divide-y`}>
            {/* Header */}
            <div className={`px-4 py-2 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Laporan Kewangan
            </div>
            
            {/* Menu Items */}
            {reportItems.map((item) => {
              const isActive = isActiveRoute(item.route);
              const icon = reportIcons[item.type] || <FileText size={16} />;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.route)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm
                    transition-all duration-150
                    ${isActive
                      ? isDark
                        ? 'bg-blue-900 text-blue-100 font-medium'
                        : 'bg-blue-50 text-blue-700 font-medium'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Icon */}
                  <span className={isActive ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {icon}
                  </span>
                  
                  {/* Title */}
                  <span className="flex-1 text-left">{item.title}</span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================================
// EXPORTS
// ========================================================================

export default FinancialReportsDropdown;

/**
 * COMPONENT STRUCTURE:
 * 
 * FinancialReportsDropdown
 * ├── Button (Toggle)
 * │   ├── FileText Icon
 * │   ├── "Laporan Kewangan" Label
 * │   └── ChevronDown Icon (rotates when open)
 * │
 * └── Dropdown Menu (conditional)
 *     ├── Header ("Laporan Kewangan")
 *     └── Menu Items (dynamic from reportItems)
 *         ├── Icon (per report type)
 *         ├── Title
 *         └── Active Indicator (if active)
 * 
 * 
 * STATE FLOW:
 * 
 * 1. User clicks button → setIsOpen(true)
 * 2. Menu appears below button
 * 3. User clicks menu item → navigate(route) → setIsOpen(false)
 * 4. User clicks outside → handleClickOutside → setIsOpen(false)
 * 
 * 
 * PERMISSION FLOW:
 * 
 * 1. usePermissions() → get reportItems
 * 2. reportItems filtered by user abilities (in menuUtils/reportUtils)
 * 3. If reportItems.length === 0 → component returns null
 * 4. Otherwise → render dropdown with filtered items
 * 
 * 
 * STYLING VARIANTS:
 * 
 * Light Mode:
 * - Button: white bg, gray border, gray text
 * - Menu: white bg, gray border
 * - Active: blue bg, blue text
 * - Hover: gray bg
 * 
 * Dark Mode:
 * - Button: gray-700 bg, gray-600 border, white text
 * - Menu: gray-800 bg, gray-700 border
 * - Active: blue-900 bg, blue-100 text
 * - Hover: gray-700 bg
 */
