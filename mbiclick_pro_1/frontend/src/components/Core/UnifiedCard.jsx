import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

/**
 * Unified Card Component untuk semua jenis card dalam aplikasi
 * Boleh digunakan sebagai TabCard (interactive) atau StatCard (static)
 */
const UnifiedCard = ({
  // Core props
  icon: Icon,
  title,
  value,
  description,
  color = "bg-blue-500",
  
  // Interactive props
  interactive = false,
  isActive = false,
  onClick = null,
  tabKey = null,
  
  // Visual options
  showActiveIndicator = false,
  useScaleEffect = false,
  borderWidth = "border-2",
  
  // Custom styling
  className = "",
  titleClassName = "",
  valueClassName = "",
  descriptionClassName = "",
  
  // Accessibility
  title: ariaTitle = "",
  disabled = false,
}) => {
  const isClickable = interactive && onClick && !disabled;
  
  // Base classes
  const baseClasses = `
    bg-white rounded-lg shadow-sm p-6 transition-all duration-200
    ${borderWidth}
    ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;
  
  // Border and active state classes
  const borderClasses = isActive 
    ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
    : 'border-gray-200 hover:border-gray-300';
    
  // Scale effect for active state (optional)
  const scaleClasses = isActive && useScaleEffect && interactive 
    ? 'transform scale-105' 
    : '';
  
  // Icon container classes
  const iconContainerClasses = `
    p-3 rounded-full ${color}
    ${isActive ? 'ring-2 ring-blue-200' : ''}
  `;
  
  // Text classes
  const titleClasses = `
    text-lg font-semibold
    ${isActive ? 'text-blue-900' : 'text-gray-900'}
    ${titleClassName}
  `;
  
  const valueClasses = `
    text-3xl font-bold
    ${isActive ? 'text-blue-700' : 'text-gray-700'}
    ${valueClassName}
  `;
  
  const descriptionClasses = `
    text-sm text-gray-500 mt-1
    ${descriptionClassName}
  `;
  
  // Handle click
  const handleClick = () => {
    if (isClickable) {
      onClick(tabKey);
    }
  };
  
  return (
    <div 
      className={`${baseClasses} ${borderClasses} ${scaleClasses}`}
      onClick={handleClick}
      title={ariaTitle}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center">
        {/* Icon */}
        <div className={iconContainerClasses}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Content */}
        <div className="ml-4 flex-1">
          <h3 className={titleClasses}>
            {title}
          </h3>
          <p className={valueClasses}>
            {value}
          </p>
          <p className={descriptionClasses}>
            {description}
          </p>
        </div>
        
        {/* Active Indicator (optional) */}
        {isActive && showActiveIndicator && (
          <div className="ml-2">
            <FaCheckCircle className="w-5 h-5 text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedCard;

// =====================================================
// CONTOH PENGGUNAAN UNTUK SETIAP KOMPONEN
// =====================================================

/*
// 1. BillingTableActive.jsx - Interactive tabs dengan scale effect
import { Edit, Clock, CheckCircle, XCircle } from 'lucide-react';

<UnifiedCard
  icon={Edit}
  title="Draf"
  value={statusCounts.draft}
  color="bg-gray-500"
  description="Belum dihantar"
  interactive={true}
  isActive={activeTab === 'draft'}
  onClick={handleTabChange}
  tabKey="draft"
  useScaleEffect={true}
  ariaTitle="Lihat permohonan draf"
/>

<UnifiedCard
  icon={Clock}
  title="Menunggu"
  value={statusCounts.pending}
  color="bg-yellow-500"
  description="Perlu kelulusan"
  interactive={true}
  isActive={activeTab === 'pending'}
  onClick={handleTabChange}
  tabKey="pending"
  useScaleEffect={true}
/>

<UnifiedCard
  icon={CheckCircle}
  title="Selesai"
  value={statusCounts.completed}
  color="bg-green-500"
  description="Permohonan selesai"
  interactive={true}
  isActive={activeTab === 'completed'}
  onClick={handleTabChange}
  tabKey="completed"
  useScaleEffect={true}
/>

<UnifiedCard
  icon={XCircle}
  title="Ditolak"
  value={statusCounts.rejected}
  color="bg-red-500"
  description="Perlu tindakan"
  interactive={true}
  isActive={activeTab === 'rejected'}
  onClick={handleTabChange}
  tabKey="rejected"
  useScaleEffect={true}
/>
*/

/*
// 2. BillingTableFinance.jsx - Interactive tabs dengan checkmark indicator
import { FaClock, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';

<UnifiedCard
  icon={FaClock}
  title="Menunggu Semakan"
  value={stats.pending_review || 0}
  color="bg-blue-500"
  description="Perlu disemak"
  interactive={true}
  isActive={activeTab === 'review'}
  onClick={handleTabClick}
  tabKey="review"
  showActiveIndicator={true}
/>

<UnifiedCard
  icon={FaExclamationTriangle}
  title="Menunggu Verifikasi"
  value={stats.pending_verify || 0}
  color="bg-orange-500"
  description="Perlu diverifikasi"
  interactive={true}
  isActive={activeTab === 'verify'}
  onClick={handleTabClick}
  tabKey="verify"
  showActiveIndicator={true}
/>

<UnifiedCard
  icon={FaMoneyBillWave}
  title="Menunggu Pengesahan"
  value={stats.pending_approval || 0}
  color="bg-red-500"
  description="Perlu dihantar"
  interactive={true}
  isActive={activeTab === 'approval'}
  onClick={handleTabClick}
  tabKey="approval"
  showActiveIndicator={true}
/>

<UnifiedCard
  icon={FaMoneyBillWave}
  title="Menunggu Bayaran"
  value={stats.pending_payment || 0}
  color="bg-red-500"
  description="Perlu dibayar"
  interactive={true}
  isActive={activeTab === 'payment'}
  onClick={handleTabClick}
  tabKey="payment"
  showActiveIndicator={true}
/>
*/

/*
// 3. BillingTableHOD.jsx - Static cards (non-interactive)
import { FaClock, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

<UnifiedCard
  icon={FaClock}
  title="Jumlah Pending"
  value={stats.pending_approvals || 0}
  color="bg-orange-500"
  description="Permohonan yang perlu diluluskan"
  interactive={false}
/>

<UnifiedCard
  icon={FaCalendarAlt}
  title="Jumlah Bulan Ini"
  value={performance.this_month || 0}
  color="bg-blue-500"
  description="Permohonan bulan semasa"
  interactive={false}
/>

<UnifiedCard
  icon={FaMoneyBillWave}
  title="Jumlah Diluluskan"
  value={stats.total_approved_amount ? formatCurrency(stats.total_approved_amount) : 'RM 0.00'}
  color="bg-green-500"
  description="Total amount yang diluluskan"
  interactive={false}
  // Custom styling untuk value yang panjang
  valueClassName="text-2xl"
/>
*/

// =====================================================
// ADVANCED USAGE EXAMPLES
// =====================================================

/*
// Card dengan custom styling
<UnifiedCard
  icon={FaMoneyBillWave}
  title="Revenue"
  value="RM 1,234,567.89"
  color="bg-gradient-to-r from-green-500 to-green-600"
  description="Total untuk bulan ini"
  valueClassName="text-green-600 text-2xl"
  className="hover:scale-102"
/>

// Disabled card
<UnifiedCard
  icon={FaClock}
  title="Maintenance"
  value="0"
  color="bg-gray-400"
  description="Sistem dalam penyelenggaraan"
  disabled={true}
/>

// Card dengan border yang berbeza
<UnifiedCard
  icon={FaExclamationTriangle}
  title="Alert"
  value="5"
  color="bg-red-500"
  description="Perlu perhatian"
  borderWidth="border-4"
  className="border-red-300"
/>
*/