import { useState, useEffect, useRef, useMemo } from 'react';

export default function TAutocomplete({
  field,
  setValue,
  data,
  list = [],
  keyval = "id,name",
  error,
  option = {},
  className = "",
  wrapperClassName = "",
  placeholder = "Taip untuk mencari...",
  onChange,
  onSearch,
  maxLength = 30,
  maxResults = 10,
  minSearchLength = 1,
  debounceMs = 300,
  searchFields = [], // Array of fields to search in, defaults to display field
  highlightMatches = true,
  allowCustomValue = false, // Allow typing custom values
  autoFitWidth = true, // Auto-fit dropdown width to content
  maxDropdownWidth = 400, // Maximum dropdown width in pixels
  path = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Parse keyval similar to TSelect
  const keyvalParts = (keyval || '').split(',');
  const oKey = keyvalParts[0] || 'id';
  const oValParts = keyvalParts.slice(1);

  // Determine search fields
  const actualSearchFields = useMemo(() => {
    if (searchFields.length > 0) return searchFields;
    if (oValParts.length > 0) return oValParts;
    return ['name']; // default
  }, [searchFields, oValParts]);

  // Get current value and display text
  const getCurrentValue = () => {
    if (!path) return data?.[field] ?? "";
    return path.split('.').reduce((acc, curr) => acc?.[curr], data) ?? "";
  };

  const getCurrentDisplayText = () => {
    const currentValue = getCurrentValue();
    if (!currentValue) return '';
    
    const foundItem = list.find(item => item?.[oKey] === currentValue);
    if (foundItem) {
      return generateLabel(foundItem);
    }
    
    // If allowCustomValue is true and no item found, return the value itself
    return allowCustomValue ? currentValue : '';
  };

  // Generate label similar to TSelect
  function generateLabel(item) {
    if (oValParts.length === 0) {
      return truncateText(item?.['name'] || 'Tiada Label');
    }
    
    if (oValParts.length === 1) {
      return truncateText(item?.[oValParts[0]] || 'Tiada Label');
    }
    
    const combinedLabel = oValParts.map(part => {
      if (part.includes('|')) {
        const [fieldName] = part.split('|');
        return item?.[fieldName] || '';
      } else {
        return item?.[part] || '';
      }
    }).filter(Boolean).join(' - ');
    
    return truncateText(combinedLabel);
  }

  function truncateText(text, maxLen = maxLength) {
    if (!text) return '';
    if (maxLen === null) return text;
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }

  // Filter and search logic
  const filteredItems = useMemo(() => {
    if (!searchQuery || searchQuery.length < minSearchLength) {
      return list.slice(0, maxResults);
    }

    const query = searchQuery.toLowerCase();
    const filtered = list.filter(item => {
      return actualSearchFields.some(field => {
        const fieldValue = item?.[field]?.toString().toLowerCase() || '';
        return fieldValue.includes(query);
      });
    });

    return filtered.slice(0, maxResults);
  }, [list, searchQuery, actualSearchFields, minSearchLength, maxResults]);

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!highlightMatches || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : 
        part
    );
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    setJustSelected(false); // Reset the flag when user starts typing

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for external search
    if (onSearch && value.length >= minSearchLength) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(value).finally(() => setIsLoading(false));
      }, debounceMs);
    }

    // If allowCustomValue, update the field value immediately
    if (allowCustomValue) {
      updateValue(value);
    }

    if (onChange) onChange(e);
  };

  // Update value function
  const updateValue = (value) => {
    if (!path) {
      setValue({ ...data, [field]: value });
    } else {
      const paths = path.split('.');
      const lastKey = paths.pop();
      let newData = { ...data };
      let current = newData;
      for (let key of paths) {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
      current[lastKey] = value;
      setValue(newData);
    }
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    const value = item?.[oKey];
    updateValue(value);
    setSearchQuery(generateLabel(item));
    setIsOpen(false);
    setHighlightedIndex(-1);
    setJustSelected(true);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
          handleItemSelect(filteredItems[highlightedIndex]);
        } else if (allowCustomValue && searchQuery.trim()) {
          updateValue(searchQuery.trim());
          setIsOpen(false);
          setJustSelected(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    // Don't open immediately if just selected an item
    if (justSelected) {
      setJustSelected(false);
      return;
    }
    
    setIsOpen(true);
    // Show current value when focused
    if (!searchQuery) {
      setSearchQuery(getCurrentDisplayText());
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setJustSelected(false); // Clear the flag on blur
        
        // Reset to display text if not allowing custom values
        if (!allowCustomValue) {
          setSearchQuery(getCurrentDisplayText());
        }
      }
    }, 150);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setJustSelected(false); // Clear the flag when clicking outside
        
        if (!allowCustomValue) {
          setSearchQuery(getCurrentDisplayText());
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [allowCustomValue]);

  // Update search query when external value changes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(getCurrentDisplayText());
    }
  }, [data, field, path, list, isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const { disabled, ...domProps } = option;

  return (
    <div className={`relative flex flex-col w-full ${wrapperClassName}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`input block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${className}`}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete="off"
          {...domProps}
        />
        
        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className={`absolute z-[9999] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${
            autoFitWidth ? 'min-w-full w-auto whitespace-nowrap' : 'w-full'
          }`}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 9999,
            ...(autoFitWidth ? {
              minWidth: '100%',
              width: 'max-content',
              maxWidth: `${maxDropdownWidth}px`
            } : {
              width: '100%'
            })
          }}
        >
          {isLoading && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Mencari...
              </div>
            </div>
          )}
          
          {!isLoading && filteredItems.length === 0 && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchQuery ? 'Tiada hasil ditemui' : 'Taip untuk mencari'}
            </div>
          )}
          
          {!isLoading && filteredItems.map((item, index) => {
            const label = generateLabel(item);
            const isHighlighted = index === highlightedIndex;
            
            return (
              <div
                key={item?.[oKey] || index}
                className={`px-3 py-2 cursor-pointer text-sm ${
                  isHighlighted 
                    ? 'bg-blue-50 text-blue-900' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleItemSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {highlightMatches ? highlightText(label, searchQuery) : label}
              </div>
            );
          })}
        </div>
      )}

      {/* Error message */}
      {error?.[field] && (
        <span className="text-xs mt-2 text-red-600">
          {error?.[field]}
        </span>
      )}
    </div>
  );
}
