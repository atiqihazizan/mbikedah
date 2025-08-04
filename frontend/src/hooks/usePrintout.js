import { useCallback } from 'react';

/**
 * Custom hook for printing content with various options
 * @param {Object} options - Configuration options
 * @returns {Object} - Print functions and state
 */
export const usePrintout = (options = {}) => {
  const defaultOptions = {
    title: document.title || 'Print Document',
    orientation: 'portrait', // 'portrait' or 'landscape'
    paperSize: 'a4', // 'a4', 'letter', etc.
    includeStyles: true, // Whether to include Tailwind CSS
    showHeader: false, // Whether to show header in printout
    showFooter: false, // Whether to show footer in printout
    headerText: '', // Custom header text
    footerText: '', // Custom footer text
    margins: { // Margins in inches
      top: 0.2,
      right: 0.5,
      bottom: 0.2,
      left: 0.5
    },
    debug: false, // Enable debug mode
  };

  // Merge default options with provided options
  const printOptions = { ...defaultOptions, ...options };

  /**
   * Generate styles for the print iframe
   * @returns {string} - CSS styles as string
   */
  const generateStyles = useCallback(() => {
    const { orientation, paperSize, margins } = printOptions;
    
    return `
      @page {
        size: ${paperSize} ${orientation};
        margin: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
      }
      
      /* Base styles */
      body {
        margin: 0;
        padding: 0;
        background: white !important;
        font-family: Arial, sans-serif;
      }
      
      /* Print header & footer */
      .print-header {
        text-align: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #ddd;
      }
      
      .print-header h1 {
        font-size: 1rem !important;
        font-weight: bold;
        margin: 0 0 0.5rem 0 !important;
        text-align: center;
      }
      
      .print-footer {
        text-align: center;
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid #ddd;
        font-size: 0.8rem;
        color: #666;
      }
      
      /* Print utility classes */
      .print\\:hidden {
        display: none !important;
      }
      
      .print\\:block {
        display: block !important;
      }
      
      .print\\:p-4 {
        padding: 0.25rem !important;
      }
      
      .print\\:mx-0 {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      
      /* Table specific print styles */
      .print\\:bg-white {
        background-color: white !important;
      }
      
      .print\\:bg-transparent {
        background-color: transparent !important;
      }
      
      .print\\:bg-green-100 {
        background-color: #dcfce7 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-green-200 {
        background-color: #bbf7d0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-red-200 {
        background-color: #fecaca !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-gray-100 {
        background-color: #f3f4f6 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-gray-200 {
        background-color: #e5e7eb !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-blue-200 {
        background-color: #dbeafe !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-yellow-100 {
        background-color: #fef3c7 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-purple-100 {
        background-color: #f3e8ff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:bg-indigo-200 {
        background-color: #c7d2fe !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print\\:text-black {
        color: black !important;
      }
      
      .print\\:text-sm {
        font-size: 0.65rem !important;
        line-height: 0.9rem !important;
      }
      
      .print\\:shadow-none {
        box-shadow: none !important;
      }
      
      .print\\:rounded-none {
        border-radius: 0 !important;
      }
      
      .print\\:hover\\:bg-transparent:hover {
        background-color: transparent !important;
      }
      
      /* Table print optimization */
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 0.65rem !important;
        margin: 0 !important;
      }
      
      th, td {
        padding: 0.15rem 0.25rem !important;
        border: 1px solid #333 !important;
        page-break-inside: avoid;
        vertical-align: top;
        line-height: 1.1;
      }
      
      th {
        font-weight: bold !important;
        text-align: center !important;
        background-color: #4a5568 !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      tr {
        page-break-inside: avoid;
      }
      
      thead {
        display: table-header-group;
      }
      
      /* Force color printing */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Hide screen-only content */
      .screen-only {
        display: none !important;
      }
      
      /* Ensure table uses full width */
      .overflow-x-auto {
        overflow: visible !important;
      }
      
      /* Optimize text alignment for numbers */
      td:nth-child(n+4) {
        text-align: right !important;
      }
      
      /* Make sure borders are visible */
      .border {
        border: 1px solid #333 !important;
      }
      
      .border-gray-400 {
        border-color: #333 !important;
      }
      
      /* Tailwind-like utility classes */
      .text-right { text-align: right !important; }
      .text-center { text-align: center !important; }
      .text-left { text-align: left !important; }
      
      .font-bold { font-weight: bold !important; }
      .font-medium { font-weight: 500 !important; }
      .font-normal { font-weight: normal !important; }
      
      .p-0 { padding: 0 !important; }
      .p-1 { padding: 0.25rem !important; }
      .p-2 { padding: 0.5rem !important; }
      .p-4 { padding: 1rem !important; }
      
      .m-0 { margin: 0 !important; }
      .m-1 { margin: 0.25rem !important; }
      .m-2 { margin: 0.5rem !important; }
      .m-4 { margin: 1rem !important; }
      
      /* Background colors */
      .bg-white { background-color: #ffffff !important; }
      .bg-gray-100 { background-color: #f3f4f6 !important; }
      .bg-gray-200 { background-color: #e5e7eb !important; }
      .bg-green-100 { background-color: #dcfce7 !important; }
      .bg-red-100 { background-color: #fee2e2 !important; }
      .bg-blue-100 { background-color: #dbeafe !important; }
      .bg-yellow-100 { background-color: #fef3c7 !important; }
      .bg-purple-100 { background-color: #f3e8ff !important; }
      .bg-indigo-100 { background-color: #e0e7ff !important; }
      
      /* Text colors */
      .text-black { color: #000000 !important; }
      .text-gray-800 { color: #1f2937 !important; }
      .text-gray-600 { color: #4b5563 !important; }
      .text-green-800 { color: #166534 !important; }
      .text-red-800 { color: #991b1b !important; }
      .text-blue-800 { color: #1e40af !important; }
    `;
  }, [printOptions]);

  /**
   * Print specific content by selector
   * @param {string} selector - CSS selector for content to print
   */
  const printElement = useCallback((selector) => {
    try {
      const contentElement = document.querySelector(selector);
      
      if (!contentElement) {
        console.error(`Element not found: ${selector}`);
        return;
      }
      
      // Create iframe for printing
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.top = '-9999px';
      printIframe.style.left = '-9999px';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      document.body.appendChild(printIframe);
      
      // Clone content to avoid modifying original
      const contentClone = contentElement.cloneNode(true);
      
      // Get document inside iframe
      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
      
      // Get current date for footer if needed
      const currentDate = new Date().toLocaleDateString('ms-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create header and footer content
      const headerContent = printOptions.showHeader ? `
        <div class="print-header">
          <h1>${printOptions.headerText || printOptions.title}</h1>
        </div>
      ` : '';
      
      const footerContent = printOptions.showFooter ? `
        <div class="print-footer">
          <p>${printOptions.footerText || `Dicetak pada: ${currentDate}`}</p>
        </div>
      ` : '';
      
      // Apply print-specific classes to cloned content if needed
      if (contentClone.classList) {
        contentClone.classList.add('print-content');
      }
      
      // Write content to iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${printOptions.title}</title>
            <style>
              ${generateStyles()}
              
              ${printOptions.includeStyles ? `
                /* Import Tailwind if needed */
                @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
              ` : ''}
            </style>
          </head>
          <body class="print:bg-white">
            ${headerContent}
            <div class="print-content print:p-4 print:mx-0">
              ${contentClone.outerHTML}
            </div>
            ${footerContent}
          </body>
        </html>
      `);
      iframeDoc.close();
      
      // Wait for iframe to load before printing
      printIframe.onload = () => {
        try {
          // Apply any additional transformations to the content if needed
          if (printOptions.debug) {
            console.log('Print preview ready - DEBUG MODE');
            return; // Don't print in debug mode
          }
          
          // Print the iframe
          printIframe.contentWindow.print();
          
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(printIframe);
          }, 1000);
        } catch (error) {
          console.error('Error during print process:', error);
          document.body.removeChild(printIframe);
        }
      };
    } catch (error) {
      console.error('Error setting up print:', error);
    }
  }, [printOptions, generateStyles]);

  /**
   * Print HTML content
   * @param {string} htmlContent - HTML content to print
   */
  const printHtml = useCallback((htmlContent) => {
    try {
      // Create iframe for printing
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.top = '-9999px';
      printIframe.style.left = '-9999px';
      document.body.appendChild(printIframe);
      
      // Get document inside iframe
      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
      
      // Get current date for footer if needed
      const currentDate = new Date().toLocaleDateString('ms-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create header and footer content
      const headerContent = printOptions.showHeader ? `
        <div class="print-header">
          <h1>${printOptions.headerText || printOptions.title}</h1>
        </div>
      ` : '';
      
      const footerContent = printOptions.showFooter ? `
        <div class="print-footer">
          <p>${printOptions.footerText || `Dicetak pada: ${currentDate}`}</p>
        </div>
      ` : '';
      
      // Write content to iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${printOptions.title}</title>
            <style>
              ${generateStyles()}
              
              ${printOptions.includeStyles ? `
                /* Import Tailwind if needed */
                @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
              ` : ''}
            </style>
          </head>
          <body class="print:bg-white">
            ${headerContent}
            <div class="print-content print:p-4 print:mx-0">
              ${htmlContent}
            </div>
            ${footerContent}
          </body>
        </html>
      `);
      iframeDoc.close();
      
      // Wait for iframe to load before printing
      printIframe.onload = () => {
        try {
          // Apply any additional transformations to the content if needed
          if (printOptions.debug) {
            console.log('Print preview ready - DEBUG MODE');
            return; // Don't print in debug mode
          }
          
          // Print the iframe
          printIframe.contentWindow.print();
          
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(printIframe);
          }, 1000);
        } catch (error) {
          console.error('Error during print process:', error);
          document.body.removeChild(printIframe);
        }
      };
    } catch (error) {
      console.error('Error setting up print:', error);
    }
  }, [printOptions, generateStyles]);

  /**
   * Print a table with data
   * @param {Array} data - Array of objects to display in table
   * @param {Object} tableOptions - Table configuration
   */
  const printTable = useCallback((data, tableOptions = {}) => {
    try {
      const defaultTableOptions = {
        columns: [], // Array of column definitions: [{ header: 'Name', field: 'name', width: '30%' }]
        caption: '', // Table caption
        tableClass: '', // Additional CSS classes for table
        zebra: true, // Zebra striping
        bordered: true, // Table borders
      };
      
      const finalTableOptions = { ...defaultTableOptions, ...tableOptions };
      
      // Generate columns if not provided
      if (finalTableOptions.columns.length === 0 && data.length > 0) {
        finalTableOptions.columns = Object.keys(data[0]).map(key => ({
          header: key.charAt(0).toUpperCase() + key.slice(1),
          field: key
        }));
      }
      
      // Generate table HTML
      let tableHtml = `
        <table class="${finalTableOptions.tableClass} ${finalTableOptions.bordered ? 'border' : ''}">
      `;
      
      // Add caption if provided
      if (finalTableOptions.caption) {
        tableHtml += `<caption>${finalTableOptions.caption}</caption>`;
      }
      
      // Add header row
      tableHtml += '<thead><tr>';
      finalTableOptions.columns.forEach(column => {
        const width = column.width ? `width="${column.width}"` : '';
        tableHtml += `<th ${width} class="${column.headerClass || ''}">${column.header}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      // Add body rows
      tableHtml += '<tbody>';
      data.forEach((row, rowIndex) => {
        const zebraClass = finalTableOptions.zebra && rowIndex % 2 === 1 ? 'bg-gray-100' : '';
        tableHtml += `<tr class="${zebraClass}">`;
        
        finalTableOptions.columns.forEach(column => {
          const cellValue = row[column.field] !== undefined ? row[column.field] : '';
          const cellClass = column.cellClass || '';
          const cellAlign = column.align ? `text-${column.align}` : '';
          
          tableHtml += `<td class="${cellClass} ${cellAlign}">${cellValue}</td>`;
        });
        
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';
      
      // Print the table
      printHtml(tableHtml);
      
    } catch (error) {
      console.error('Error generating table for print:', error);
    }
  }, [printHtml]);

  /**
   * Create an alternative version of print element that returns a promise
   * @param {string} selector - CSS selector for content to print
   * @returns {Promise} - Resolves when print is complete or fails
   */
  const printElementAsync = useCallback((selector) => {
    return new Promise((resolve, reject) => {
      try {
        const contentElement = document.querySelector(selector);
        
        if (!contentElement) {
          reject(new Error(`Element not found: ${selector}`));
          return;
        }
        
        // Create iframe for printing
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'absolute';
        printIframe.style.top = '-9999px';
        printIframe.style.left = '-9999px';
        document.body.appendChild(printIframe);
        
        // Clone content to avoid modifying original
        const contentClone = contentElement.cloneNode(true);
        
        // Get document inside iframe
        const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
        
        // Get current date for footer
        const currentDate = new Date().toLocaleDateString('ms-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Create header and footer content
        const headerContent = printOptions.showHeader ? `
          <div class="print-header">
            <h1>${printOptions.headerText || printOptions.title}</h1>
          </div>
        ` : '';
        
        const footerContent = printOptions.showFooter ? `
          <div class="print-footer">
            <p>${printOptions.footerText || `Dicetak pada: ${currentDate}`}</p>
          </div>
        ` : '';
        
        // Write content to iframe
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${printOptions.title}</title>
              <style>${generateStyles()}</style>
            </head>
            <body class="print:bg-white">
              ${headerContent}
              <div class="print-content print:p-4 print:mx-0">${contentClone.outerHTML}</div>
              ${footerContent}
            </body>
          </html>
        `);
        iframeDoc.close();
        
        // Wait for iframe to load before printing
        printIframe.onload = () => {
          try {
            if (printOptions.debug) {
              console.log('Print preview ready - DEBUG MODE');
              resolve('Debug mode - print preview ready');
              return;
            }
            
            // Print the iframe
            printIframe.contentWindow.print();
            
            // Remove iframe after printing
            setTimeout(() => {
              document.body.removeChild(printIframe);
              resolve('Print completed');
            }, 1000);
          } catch (error) {
            document.body.removeChild(printIframe);
            reject(error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }, [printOptions, generateStyles]);

  return {
    printElement,
    printHtml,
    printTable,
    printElementAsync,
    options: printOptions,
  };
};

export default usePrintout;