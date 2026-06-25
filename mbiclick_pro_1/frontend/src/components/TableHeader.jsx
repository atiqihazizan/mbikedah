import React from 'react';

const TableHeader = ({ 
  rows = [], 
  isDark, 
  customClasses = {},
  className = '' 
}) => {
  const defaultHeaderClasses = `border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`;
  
  return (
    <thead className={className}>
      {rows.map((row, rowIndex) => {
        const headerRowClasses = row.customClasses?.headerRow || defaultHeaderClasses;
        
        return (
          <tr key={rowIndex} className={headerRowClasses}>
            {row.columns.map((column, colIndex) => {
              const {
                name,
                textAlign = 'left',
                customClass = '',
                width = '',
                rowspan = 1,
                colspan = 1
              } = column;
              
              const baseClasses = 'py-4 px-4 font-semibold';
              const textAlignClass = textAlign === 'center' ? 'text-center' : 'text-left';
              const darkModeClass = isDark ? 'text-gray-300' : 'text-gray-700';
              const widthClass = width ? `w-${width}` : '';
              
              return (
                <th 
                  key={colIndex}
                  rowSpan={rowspan > 1 ? rowspan : undefined}
                  colSpan={colspan > 1 ? colspan : undefined}
                  className={`${baseClasses} ${textAlignClass} ${darkModeClass} ${widthClass} ${customClass}`}
                >
                  {name}
                </th>
              );
            })}
          </tr>
        );
      })}
    </thead>
  );
};

export default TableHeader;
