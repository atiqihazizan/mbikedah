import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  ChevronDown, 
  FileText, 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

const FinancialReportsDropdown = ({ isDark = false, isPillButton = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { reportItems } = usePermissions();

  const reportIcons = {
    budget_summary: <PieChart size={16} />,
    income_statement: <BarChart3 size={16} />,
    revenue_breakdown: <TrendingUp size={16} />,
    expense_breakdown: <TrendingDown size={16} />,
    detail: <FileText size={16} />
  };

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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (route) => {
    navigate(route);
    setIsOpen(false);
  };

  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

  if (!reportItems || reportItems.length === 0) {
    return null;
  }

  // Button styling berdasarkan variant (pill atau default)
  const getButtonClasses = () => {
    if (isPillButton) {
      // Pill button style - action button
      return `
        inline-flex items-center gap-2 px-5 py-1 font-semibold text-sm
        transition-all duration-200 shadow-md hover:shadow-lg
        rounded-full
        ${isDark 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-2 border-blue-500' 
          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-2 border-blue-400'
        }
        ${isOpen ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
        active:scale-95
      `;
    } else {
      // Default style - menu item
      return `
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200 shadow-sm
        ${isDark 
          ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }
        ${isOpen ? 'ring-2 ring-blue-500' : ''}
      `;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={getButtonClasses()}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FileText size={18} />
        <span>Laporan Kewangan</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

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
            <div className={`px-4 py-2 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Laporan Kewangan
            </div>
            
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
                  <span className={isActive ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {icon}
                  </span>
                  <span className="flex-1 text-left">{item.title}</span>
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

export default FinancialReportsDropdown;
