// scripts/generateComponentsIndex.js
// Enhanced script untuk generate dialog, core components, dan hooks index

import fs from 'fs';
import path from 'path';

// Configuration
const configs = {
  dialogs: {
    dir: 'src/components/dialogs',
    filter: (file) => file.includes('Dialog') && (file.endsWith('.jsx') || file.endsWith('.js')) && file !== 'index.js',
    categories: {
      hod: (name) => name.toLowerCase().includes('hod'),
      finance: (name) => name.toLowerCase().includes('finance'),
      billing: (name) => name.toLowerCase().includes('billing') || name.toLowerCase().includes('recipient'),
      user: (name) => name.toLowerCase().includes('password') || name.toLowerCase().includes('user'),
      general: () => true // default category
    }
  },
  core: {
    dir: 'src/components/Core',
    filter: (file) => (file.endsWith('.jsx') || file.endsWith('.js')) && file !== 'index.js' && !file.startsWith('.'),
    categories: {
      buttons: (name) => name.toLowerCase().includes('button'),
      inputs: (name) => name.toLowerCase().includes('input') || name.toLowerCase().includes('select') || name.toLowerCase().includes('check'),
      loading: (name) => name.toLowerCase().includes('loading') || name.toLowerCase().includes('spinner') || name.toLowerCase().includes('pulse'),
      tables: (name) => name.toLowerCase().includes('table'),
      icons: (name) => name.toLowerCase().includes('icon'),
      cards: (name) => name.toLowerCase().includes('card'),
      general: () => true // default category
    }
  },
  hooks: {
    dir: 'src/hooks',
    filter: (file) => file.startsWith('use') && (file.endsWith('.jsx') || file.endsWith('.js')) && file !== 'index.js',
    categories: {
      data: (name) => {
        const dataKeywords = ['userdata', 'realtime', 'async', 'fetch', 'api'];
        return dataKeywords.some(keyword => name.toLowerCase().includes(keyword));
      },
      form: (name) => {
        const formKeywords = ['form', 'password', 'input', 'validation'];
        return formKeywords.some(keyword => name.toLowerCase().includes(keyword));
      },
      ui: (name) => {
        const uiKeywords = ['theme', 'notification', 'tab', 'dialog', 'modal', 'table', 'breakpoint'];
        return uiKeywords.some(keyword => name.toLowerCase().includes(keyword));
      },
      business: (name) => {
        const businessKeywords = ['billing', 'role', 'permission', 'active', 'applicant', 'finance', 'hod'];
        return businessKeywords.some(keyword => name.toLowerCase().includes(keyword));
      },
      utility: (name) => {
        const utilityKeywords = ['debounce', 'localstorage', 'display', 'keyboard', 'confirm'];
        return utilityKeywords.some(keyword => name.toLowerCase().includes(keyword));
      },
      auth: (name) => {
        const authKeywords = ['user', 'actions', 'logout', 'login'];
        return authKeywords.some(keyword => name.toLowerCase().includes(keyword));
      },
      general: () => true // default category
    }
  }
};

function generateIndex(type) {
  const config = configs[type];
  if (!config) {
    console.error(`❌ Unknown type: ${type}`);
    return;
  }

  console.log(`🚀 Generating ${type} index...`);

  try {
    // Check if directory exists
    if (!fs.existsSync(config.dir)) {
      console.log(`❌ Directory not found: ${config.dir}`);
      return;
    }

    // Scan files
    const files = fs.readdirSync(config.dir);
    const componentFiles = files.filter(config.filter).sort();

    console.log(`📁 Found ${componentFiles.length} ${type} files`);

    if (componentFiles.length === 0) {
      console.log(`⚠️  No ${type} files found`);
      return;
    }

    // Generate content
    const timestamp = new Date().toLocaleString();
    const dirName = type === 'core' ? 'Core' : type;
    let content = `// ${type === 'hooks' ? 'hooks' : `components/${dirName}`}/index.js
// Auto-generated on: ${timestamp}
// Total ${type}: ${componentFiles.length}

`;

    // Add hook-specific header comments
    if (type === 'hooks') {
      content += `/**
 * Centralized exports for all custom React hooks
 * 
 * Categories:
 * - data: Data fetching and state management hooks
 * - form: Form handling and validation hooks  
 * - ui: UI state and interaction hooks
 * - business: Business logic and domain-specific hooks
 * - utility: General utility and helper hooks
 * - auth: Authentication and user action hooks
 */

`;
    }

    // Categorize components
    const categories = {};
    Object.keys(config.categories).forEach(cat => {
      categories[cat] = [];
    });

    componentFiles.forEach(file => {
      const name = path.parse(file).name;
      let assigned = false;

      // Check each category (except general)
      Object.entries(config.categories).forEach(([category, checkFn]) => {
        if (category !== 'general' && !assigned && checkFn(name)) {
          categories[category].push(name);
          assigned = true;
        }
      });

      // If not assigned to any category, put in general
      if (!assigned) {
        categories.general.push(name);
      }
    });

    // Generate exports by category
    Object.entries(categories).forEach(([category, components]) => {
      if (components.length > 0) {
        content += `// ==================== ${category.toUpperCase()} ${type.toUpperCase()} ====================\n`;
        
        if (type === 'hooks') {
          // Add category description for hooks
          const descriptions = {
            data: '// Hooks for data fetching, API calls, and remote state management',
            form: '// Hooks for form handling, validation, and user input management',
            ui: '// Hooks for UI state, theme, notifications, and user interactions',
            business: '// Hooks for business logic, roles, permissions, and domain operations',
            utility: '// General utility hooks for common functionality',
            auth: '// Authentication, user management, and security-related hooks'
          };
          
          if (descriptions[category]) {
            content += `${descriptions[category]}\n`;
          }
        }
        
        components.forEach(component => {
          content += `export { ${component} } from './${component}';\n`;
        });
        content += '\n';
      }
    });

    // Add usage examples
    const firstFewComponents = componentFiles.slice(0, 3).map(f => path.parse(f).name);
    const importPath = type === 'hooks' ? '../hooks' : type === 'core' ? './Core' : './dialogs';
    
    if (type === 'hooks') {
      content += `// ==================== USAGE EXAMPLES ====================
// Single hook import:
// import { ${firstFewComponents[0]} } from '../hooks';

// Multiple hooks import:
// import { ${firstFewComponents.join(', ')} } from '../hooks';

// Category-specific import (recommended for large files):
// import { useUserData, useRealTimeUpdates } from '../hooks';        // data hooks
// import { useTheme, useTabNotifications } from '../hooks';           // ui hooks  
// import { useBillingTableApplicant, useActiveRole } from '../hooks'; // business hooks
`;
    } else {
      content += `// Usage: import { ${firstFewComponents.join(', ')} } from '${importPath}';\n`;
    }

    // Write file
    const indexPath = path.join(config.dir, 'index.js');
    fs.writeFileSync(indexPath, content);

    console.log(`✅ Generated ${type}/index.js successfully!`);
    console.log(`📄 File: ${indexPath}`);

    // Show components by category
    console.log(`\n📊 ${type} by category:`);
    Object.entries(categories).forEach(([category, components]) => {
      if (components.length > 0) {
        console.log(`   ${category} (${components.length}): ${components.join(', ')}`);
      }
    });

  } catch (error) {
    console.error(`❌ Error generating ${type} index:`, error.message);
  }
}

function generateAll() {
  console.log('🚀 Generating all component indices...\n');
  
  generateIndex('dialogs');
  console.log(''); // Add spacing
  generateIndex('core');
  console.log(''); // Add spacing
  generateIndex('hooks');
  
  console.log('\n🎉 All component indices generated successfully!');
}

function listFiles(type) {
  const config = configs[type];
  if (!config) {
    console.error(`❌ Unknown type: ${type}`);
    return;
  }

  console.log(`📋 Listing ${type} files in ${config.dir}:`);

  try {
    if (!fs.existsSync(config.dir)) {
      console.log(`❌ Directory not found: ${config.dir}`);
      return;
    }

    const files = fs.readdirSync(config.dir);
    const componentFiles = files.filter(config.filter).sort();

    if (componentFiles.length === 0) {
      console.log(`⚠️  No ${type} files found`);
      return;
    }

    componentFiles.forEach((file, index) => {
      const name = path.parse(file).name;
      console.log(`   ${index + 1}. ${name} (${file})`);
    });

    console.log(`\n📊 Total: ${componentFiles.length} ${type} files`);

  } catch (error) {
    console.error(`❌ Error listing ${type} files:`, error.message);
  }
}

// CLI handling
const command = process.argv[2];

switch (command) {
  case 'dialogs':
    generateIndex('dialogs');
    break;
  case 'core':
    generateIndex('core');
    break;
  case 'hooks':
    generateIndex('hooks');
    break;
  case 'all':
  case undefined:
    generateAll();
    break;
  case 'list':
    const listType = process.argv[3];
    if (listType && configs[listType]) {
      listFiles(listType);
    } else {
      console.log('📋 Available types to list: dialogs, core, hooks');
      console.log('📚 Usage: node scripts/generateComponentsIndex.js list [type]');
    }
    break;
  case 'help':
    console.log(`
🤖 Component Index Generator

📋 Usage:
  node scripts/generateComponentsIndex.js [command]

🔧 Commands:
  dialogs     Generate dialogs index only
  core        Generate core components index only
  hooks       Generate hooks index only
  all         Generate all indices (default)
  list [type] List files in directory (type: dialogs|core|hooks)
  help        Show this help

📚 Examples:
  node scripts/generateComponentsIndex.js           # Generate all indices
  node scripts/generateComponentsIndex.js dialogs   # Generate dialogs only
  node scripts/generateComponentsIndex.js hooks     # Generate hooks only
  node scripts/generateComponentsIndex.js list hooks # List all hook files

🎯 Hook Categories:
  data        Data fetching and API hooks (useUserData, useRealTimeUpdates)
  form        Form and validation hooks (useBillingForm, usePasswordChange)
  ui          UI state and interaction hooks (useTheme, useTabNotifications)
  business    Business logic hooks (useActiveRole, useBillingTableHOD, useBillingTableApplicant, useBillingTableFinance)
  utility     General utility hooks (useDebounce, useLocalStorage)
  auth        Authentication hooks (useUserActions, usePasswordChange)
`);
    break;
  default:
    console.log(`❌ Unknown command: ${command}`);
    console.log('Use "help" for usage information');
    process.exit(1);
}