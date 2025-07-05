import { RotateCcw } from 'lucide-react';
import TButton from '../Core/TButton';
import UnifiedCard from '../Core/UnifiedCard';

/**
 * Generic Layout Component untuk Billing Tables
 * Menyediakan struktur konsisten: Header → Tabs → Content
 */
function BillingTableLayout({
  // Header Props
  icon,
  title,
  description,
  statsDisplay,
  headerActions = [],
  
  // Loading state
  loading = false,
  onRefresh,
  
  // Alert Props (optional)
  alertContent = null,
  
  // Tabs Props
  tabs = [],
  activeTab,
  onTabChange,
  tabGridCols = "grid-cols-2 md:grid-cols-4",
  
  // Content Props
  children,
  
  // Container Props
  className = "p-6 bg-gray-50 min-h-full"
}) {
  
  return (
    <div className={className}>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">{icon}</span>
              {title}
            </h1>
            <p className="text-gray-600 mt-1">{description}</p>
            {statsDisplay && (
              <div className="mt-2 text-sm text-gray-500">
                {statsDisplay}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {headerActions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
            {onRefresh && (
              <TButton color="refresh" onClick={onRefresh} title="Refresh Data">
                <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </TButton>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section (Statistics Cards) */}
      {tabs.length > 0 && (
        <div className={`grid ${tabGridCols} gap-6 mb-8`}>
          {tabs.map((tab, index) => (
            <UnifiedCard
              key={tab.key || index}
              icon={tab.icon}
              title={tab.title}
              value={tab.value}
              color={tab.color}
              description={tab.description}
              tabKey={tab.key}
              isActive={activeTab === tab.key}
              onClick={() => onTabChange && onTabChange(tab.key)}
              interactive={tab.interactive !== false}
              showActiveIndicator={tab.showActiveIndicator !== false}
              useScaleEffect={tab.useScaleEffect !== false}
              ariaTitle={tab.ariaTitle}
            />
          ))}
        </div>
      )}

      {/* Alert Section (optional) */}
      {alertContent && (
        <div className="mb-6">
          {alertContent}
        </div>
      )}

      {/* Content Section */}
      <div>
        {children}
      </div>
    </div>
  );
}

export default BillingTableLayout;