import React from 'react';

export default function PulseTable() {
  // Number of columns for the table
  const columns = 5;
  // Number of rows for the table
  const rows = 5;

  return (
    <div className="w-full mx-auto">
      {/* Table header */}
      <div className="flex border-b pb-2 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div 
            key={`header-${i}`} 
            className={`animate-pulse h-8 bg-gray-200 rounded mx-1 ${
              i === 1 ? 'flex-2' : 'flex-1'
            }`}
          ></div>
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex py-3 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={`animate-pulse h-4 bg-gray-200 rounded mx-1 ${
                colIndex === 1 ? 'flex-2' : 'flex-1'
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// export default function PulseTable() {
//   return (
//     <div className="animate-pulse">
//       <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
//       <div className="space-y-3">
//         {[1, 2, 3, 4, 5].map((n) => (
//           <div key={n} className="h-4 bg-gray-200 rounded"></div>
//         ))}
//       </div>
//     </div>
//   );
// }
