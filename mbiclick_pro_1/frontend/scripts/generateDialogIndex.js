// scripts/generateDialogIndex.js
// Simple script untuk generate dialog index saja

import fs from 'fs';
import path from 'path';

const dialogsDir = 'src/components/dialogs';

console.log('🚀 Generating dialog index...');

try {
  // Scan untuk dialog files
  const files = fs.readdirSync(dialogsDir);
  
  const dialogFiles = files.filter(file => 
    file.includes('Dialog') && 
    (file.endsWith('.jsx') || file.endsWith('.js')) &&
    file !== 'index.js'
  ).sort();

  console.log(`📁 Found ${dialogFiles.length} dialog files`);

  // Generate content
  const timestamp = new Date().toLocaleString();
  let content = `// components/dialogs/index.js
// Auto-generated on: ${timestamp}
// Total dialogs: ${dialogFiles.length}

`;

  // Group by category untuk better organization
  const categories = {
    hod: [],
    finance: [],
    billing: [],
    user: [],
    general: []
  };

  dialogFiles.forEach(file => {
    const name = path.parse(file).name;
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('hod')) {
      categories.hod.push(name);
    } else if (lowerName.includes('finance')) {
      categories.finance.push(name);
    } else if (lowerName.includes('billing') || lowerName.includes('recipient')) {
      categories.billing.push(name);
    } else if (lowerName.includes('password') || lowerName.includes('user')) {
      categories.user.push(name);
    } else {
      categories.general.push(name);
    }
  });

  // Generate exports by category
  Object.entries(categories).forEach(([category, dialogs]) => {
    if (dialogs.length > 0) {
      content += `// ==================== ${category.toUpperCase()} DIALOGS ====================\n`;
      dialogs.forEach(dialog => {
        content += `export { default as ${dialog} } from './${dialog}';\n`;
      });
      content += '\n';
    }
  });

  // Add usage example
  const firstFewDialogs = dialogFiles.slice(0, 3).map(f => path.parse(f).name);
  content += `// Usage: import { ${firstFewDialogs.join(', ')} } from './dialogs';\n`;

  // Write file
  const indexPath = path.join(dialogsDir, 'index.js');
  fs.writeFileSync(indexPath, content);

  console.log('✅ Generated index.js successfully!');
  console.log(`📄 File: ${indexPath}`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}