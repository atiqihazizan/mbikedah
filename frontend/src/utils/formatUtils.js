// Frontend utilities untuk handle formatting yang consistent dengan backend

export const formatUtils = {
  // Format currency untuk Malaysian Ringgit
  formatCurrency: (amount) => {
    if (!amount || isNaN(amount)) return 'RM 0.00';
    
    return `RM ${Number(amount).toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  // Enhanced title formatting dengan sensitive case handling
  formatTitle: (text, options = {}) => {
    if (!text || typeof text !== 'string') return '';
    
    const {
      mode = 'title', // 'title', 'upper', 'lower', 'proper', 'preserve'
      preserveAcronyms = true,
      malaysianContext = true
    } = options;

    // Words yang perlu preserve case mereka
    const preservedWords = new Set([
      // Common acronyms
      'CEO', 'CFO', 'CTO', 'HR', 'IT', 'PR', 'QA', 'API', 'UI', 'UX',
      'PhD', 'MD', 'BSc', 'MSc', 'MBA', 'IP', 'GPS', 'SMS', 'ATM',
      
      // Malaysian specific
      'YB', 'YAB', 'YBhg', 'Dato', "Dato'", 'Datuk', 'Tan Sri', 'Tun',
      'Dr', 'Prof', 'Ir', 'Ar', 'En', 'Pn', 'Cik',
      'UMNO', 'PKR', 'DAP', 'PAS', 'MIC', 'MCA', 'GPS', 'BN', 'PH',
      'KL', 'JB', 'PJ', 'USM', 'UKM', 'UM', 'UTM', 'UPM', 'UiTM',
      'KLCC', 'LRT', 'MRT', 'KTM', 'PLUS', 'TNB', 'TM', 'MAB',
      'JPJ', 'JPN', 'EPF', 'KWSP', 'LHDN', 'IRB', 'MACC', 'PDRM',
      
      // Government departments
      'JKR', 'JPS', 'SPAN', 'MAMPU', 'INTAN', 'BNM', 'SC', 'MCMC',
      'DOE', 'DOSH', 'MOH', 'MOE', 'MOHE', 'MOF', 'MITI', 'KPDNHEP'
    ]);

    // Words yang shouldn't be capitalized dalam title case (articles, prepositions, etc.)
    const lowercaseWords = new Set([
      'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 
      'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet',
      'dengan', 'dan', 'atau', 'untuk', 'dari', 'ke', 'di', 'pada',
      'oleh', 'daripada', 'kepada', 'dalam', 'antara', 'tanpa'
    ]);

    // Malaysian name particles yang perlu proper formatting
    const nameParticles = new Map([
      ['bin', 'bin'],
      ['binti', 'binti'],
      ['bt', 'bt'],
      ['b', 'b'],
      ['al', 'al'],
      ['abdul', 'Abdul'],
      ['abu', 'Abu'],
      ['ahmad', 'Ahmad'],
      ['mohammed', 'Mohammed'],
      ['muhammad', 'Muhammad'],
      ['mohd', 'Mohd'],
      ['mohamed', 'Mohamed'],
      ['siti', 'Siti'],
      ['nur', 'Nur'],
      ['wan', 'Wan'],
      ['raja', 'Raja'],
      ['tengku', 'Tengku'],
      ['megat', 'Megat'],
      ['nik', 'Nik']
    ]);

    const processWord = (word, index, words) => {
      const lowerWord = word.toLowerCase();
      const originalCase = word;

      // Preserve acronyms if enabled
      if (preserveAcronyms && preservedWords.has(word.toUpperCase())) {
        return word.toUpperCase();
      }

      // Check if it's a preserved word with exact case
      if (preservedWords.has(originalCase)) {
        return originalCase;
      }

      // Handle Malaysian name particles
      if (malaysianContext && nameParticles.has(lowerWord)) {
        return nameParticles.get(lowerWord);
      }

      // Apply formatting based on mode
      switch (mode) {
        case 'upper':
          return word.toUpperCase();
          
        case 'lower':
          return word.toLowerCase();
          
        case 'preserve':
          return originalCase;
          
        case 'proper':
          // Proper case: First letter uppercase, rest lowercase
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          
        case 'title':
        default:
          // Title case logic
          const isFirstWord = index === 0;
          const isLastWord = index === words.length - 1;
          
          // Always capitalize first and last words
          if (isFirstWord || isLastWord) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
          
          // Don't capitalize articles and prepositions in the middle
          if (lowercaseWords.has(lowerWord)) {
            return lowerWord;
          }
          
          // Capitalize everything else
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    };

    // Process the text
    let processedText = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Split by spaces and process each word
    const words = processedText.split(' ');
    const formattedWords = words.map((word, index) => {
      // Handle hyphenated words
      if (word.includes('-')) {
        return word.split('-')
          .map((part, partIndex) => processWord(part, index + partIndex, words))
          .join('-');
      }
      
      // Handle words with apostrophes
      if (word.includes("'")) {
        const parts = word.split("'");
        return parts[0] + "'" + (parts[1] || '');
      }
      
      return processWord(word, index, words);
    });

    return formattedWords.join(' ');
  },

  // Quick title formatting shortcuts
  formatTitleUpper: (text) => formatUtils.formatTitle(text, { mode: 'upper' }),
  formatTitleProper: (text) => formatUtils.formatTitle(text, { mode: 'proper' }),
  formatTitlePreserve: (text) => formatUtils.formatTitle(text, { mode: 'preserve' }),

  // Format Malaysian names specifically
  formatMalaysianName: (name) => {
    if (!name) return '';
    
    return formatUtils.formatTitle(name, {
      mode: 'proper',
      preserveAcronyms: true,
      malaysianContext: true
    });
  },

  // Format position/title dengan proper capitalization
  formatPosition: (position) => {
    if (!position) return '';
    
    const result = formatUtils.formatTitle(position, {
      mode: 'title',
      preserveAcronyms: true,
      malaysianContext: true
    });

    // Special handling untuk common positions
    const positionMappings = {
      'ceo': 'CEO',
      'cfo': 'CFO', 
      'cto': 'CTO',
      'general manager': 'General Manager',
      'assistant manager': 'Assistant Manager',
      'senior manager': 'Senior Manager',
      'executive': 'Executive',
      'senior executive': 'Senior Executive',
      'assistant executive': 'Assistant Executive',
      'ketua jabatan': 'Ketua Jabatan',
      'ketua pegawai': 'Ketua Pegawai',
      'pegawai kewangan': 'Pegawai Kewangan',
      'eksekutif': 'Eksekutif'
    };

    const lowerResult = result.toLowerCase();
    return positionMappings[lowerResult] || result;
  },

  // Format department names
  formatDepartment: (department) => {
    if (!department) return '';
    
    return formatUtils.formatTitle(department, {
      mode: 'title',
      preserveAcronyms: true,
      malaysianContext: true
    });
  },

  // Validate and clean text input
  cleanText: (text, options = {}) => {
    if (!text || typeof text !== 'string') return '';
    
    const {
      removeExtraSpaces = true,
      removeSpecialChars = false,
      allowedChars = /[a-zA-Z0-9\s\-'./,()]/g
    } = options;

    let cleaned = text;

    if (removeSpecialChars) {
      cleaned = cleaned.match(allowedChars)?.join('') || '';
    }

    if (removeExtraSpaces) {
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
    }

    return cleaned;
  },

  // Format days pending dengan proper handling
  formatDaysPending: (days) => {
    if (days === null || days === undefined || isNaN(days)) {
      return 'Tidak diketahui';
    }

    days = Math.round(Number(days));

    if (days <= 0) {
      return 'Baru sahaja';
    }

    if (days < 7) {
      return `${days} hari`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return `${weeks} minggu${remainingDays > 0 ? ` ${remainingDays} hari` : ''}`;
    } else {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      
      if (months > 12) {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return `${years} tahun${remainingMonths > 0 ? ` ${remainingMonths} bulan` : ''}`;
      }
      
      return `${months} bulan${remainingDays > 0 ? ` ${remainingDays} hari` : ''}`;
    }
  },

  // Format percentage dengan proper rounding
  formatPercentage: (value, decimals = 1) => {
    if (!value || isNaN(value)) return '0%';
    
    return `${Number(value).toFixed(decimals)}%`;
  },

  // Format large numbers dengan K, M notation
  formatLargeNumber: (num) => {
    if (!num || isNaN(num)) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toString();
  },

  // Format time ago dalam Bahasa Malaysia
  formatTimeAgo: (dateString) => {
    if (!dateString) return 'Tidak diketahui';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Baru sahaja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minit yang lalu`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam yang lalu`;
    } else if (diffInMinutes < 10080) {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} hari yang lalu`;
    } else {
      return date.toLocaleDateString('ms-MY');
    }
  },

  // Get status badge configuration
  getStatusConfig: (statusId) => {
    const statusConfigs = {
      1: { label: 'Draf', className: 'bg-gray-100 text-gray-800' },
      2: { label: 'Menunggu HOD', className: 'bg-yellow-100 text-yellow-800' },
      3: { label: 'Semakan Kewangan', className: 'bg-blue-100 text-blue-800' },
      4: { label: 'Pengesahan Kewangan', className: 'bg-indigo-100 text-indigo-800' },
      5: { label: 'Kelulusan Kewangan', className: 'bg-purple-100 text-purple-800' },
      6: { label: 'Proses Bayaran', className: 'bg-orange-100 text-orange-800' },
      7: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      8: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
      9: { label: 'Dikembalikan', className: 'bg-yellow-100 text-yellow-800' },
      10: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' }
    };
    
    return statusConfigs[statusId] || { 
      label: 'Tidak Diketahui', 
      className: 'bg-gray-100 text-gray-800' 
    };
  },

  // Get priority configuration based on days pending
  getPriorityConfig: (days) => {
    if (!days || isNaN(days)) {
      return { text: 'Biasa', className: 'bg-green-100 text-green-800' };
    }

    days = Number(days);

    if (days >= 14) {
      return { text: 'Sangat Segera', className: 'bg-red-100 text-red-800' };
    } else if (days >= 7) {
      return { text: 'Segera', className: 'bg-orange-100 text-orange-800' };
    } else if (days >= 3) {
      return { text: 'Sederhana', className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Biasa', className: 'bg-green-100 text-green-800' };
    }
  },

  // Truncate text dengan proper handling
  truncateText: (text, length = 50, suffix = '...') => {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return text.substr(0, length) + suffix;
  },

  // Format date untuk display
  formatDate: (dateString, format = 'dd/MM/yyyy') => {
    if (!dateString) return 'Tidak diketahui';
    
    try {
      let date;
      
      const parseDDMMYYYY = (dateStr) => {
        const ddmmyyyyPattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
        const match = dateStr.match(ddmmyyyyPattern);
        
        if (match) {
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      };
      
      const parseYYYYMMDD = (dateStr) => {
        const isoPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
        const match = dateStr.match(isoPattern);
        
        if (match) {
          const [, year, month, day] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return null;
      };
      
      if (typeof dateString === 'string') {
        date = parseDDMMYYYY(dateString);
        
        if (!date || isNaN(date.getTime())) {
          date = parseYYYYMMDD(dateString);
        }
        
        if (!date || isNaN(date.getTime())) {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Format tarikh tidak sah';
      }
      
      switch (format) {
        case 'dd/MM/yyyy':
          return date.toLocaleDateString('en-GB');
          
        case 'dd/MM/yyyy HH:mm':
          return date.toLocaleDateString('en-GB') + ' ' + 
                 date.toLocaleTimeString('en-GB', { 
                   hour: '2-digit', 
                   minute: '2-digit',
                   hour12: false 
                 });
                 
        case 'dd-MM-yyyy':
          return date.toLocaleDateString('en-GB').replace(/\//g, '-');
          
        case 'yyyy-MM-dd':
          return date.toISOString().split('T')[0];
          
        case 'dd MMM yyyy':
          return date.toLocaleDateString('ms-MY', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          });
          
        case 'dd MMMM yyyy':
          return date.toLocaleDateString('ms-MY', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          });
          
        case 'relative':
          return formatUtils.formatRelativeTime(date);
          
        default:
          return date.toLocaleDateString('ms-MY');
      }
      
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Format tarikh tidak sah';
    }
  },
  
  // Helper function untuk relative time formatting
  formatRelativeTime: (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) {
      return 'Baru sahaja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else if (diffInDays < 7) {
      return `${diffInDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString('ms-MY');
    }
  },

  // Safe number formatting
  safeNumber: (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  },

  // Format decimal places safely with comma separators
  formatDecimal: (value, decimals = 2) => {
    const num = formatUtils.safeNumber(value);
    const fixed = num.toFixed(decimals);
    
    // Split into integer and decimal parts
    const parts = fixed.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Add comma separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted number with decimal if needed
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  },

  // Check if value is empty or null
  isEmpty: (value) => {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  },

  // Get display value dengan fallback
  getDisplayValue: (value, fallback = 'Tiada data') => {
    return formatUtils.isEmpty(value) ? fallback : value;
  }
};

// React hook untuk safe formatting
import { useMemo } from 'react';

export const useFormattedValue = (value, formatter, dependencies = []) => {
  return useMemo(() => {
    try {
      return formatter(value);
    } catch (error) {
      console.warn('Formatting error:', error);
      return 'Format error';
    }
  }, [value, ...dependencies]);
};

// Enhanced dashboard helpers dengan error handling
export const dashboardHelpers = {
  ...formatUtils,

  // Safe data extraction dari API response
  extractSafeData: (response, path, defaultValue = null) => {
    try {
      const pathArray = path.split('.');
      let current = response;
      
      for (const key of pathArray) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          return defaultValue;
        }
      }
      
      return current;
    } catch (error) {
      console.warn('Data extraction error:', error);
      return defaultValue;
    }
  },

  // Handle API response dengan proper error checking
  handleApiResponse: (response, successCallback, errorCallback) => {
    try {
      if (response?.success && response?.data) {
        successCallback(response.data);
      } else {
        const error = response?.message || 'Unknown error occurred';
        errorCallback(error);
      }
    } catch (error) {
      console.error('API response handling error:', error);
      errorCallback('Failed to process response');
    }
  },

  // Calculate stats dengan safe arithmetic
  calculateStats: (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0
      };
    }

    const values = data.map(item => formatUtils.safeNumber(item.value || item.amount || 0));
    
    return {
      total: values.reduce((sum, val) => sum + val, 0),
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values)
    };
  },

  // Group data dengan safe grouping
  groupData: (data, groupBy) => {
    if (!Array.isArray(data)) return {};
    
    return data.reduce((groups, item) => {
      const key = dashboardHelpers.extractSafeData(item, groupBy, 'unknown');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }
};

export default {
  formatUtils,
  useFormattedValue,
  dashboardHelpers
};