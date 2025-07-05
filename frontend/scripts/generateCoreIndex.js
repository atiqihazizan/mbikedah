// scripts/generateCoreIndex.js
// Simple script untuk generate core components index

import fs from 'fs';
import path from 'path';

const coreDir = 'src/components/Core';

console.log('🚀 Generating core components index...');

try {
  // Scan untuk core component files
  const files = fs.readdirSync(coreDir);
  
  const componentFiles = files.filter(file => 
    (file.endsWith('.jsx') || file.endsWith('.js')) &&
    file !== 'index.js' && // Skip index.js sendiri
    !file.startsWith('.') // Skip hidden files
  ).sort();

  console.log(`📁 Found ${componentFiles.length} core component files`);

  // Generate content
  const timestamp = new Date().toLocaleString();
  let content = `// components/Core/index.js
// Auto-generated on: ${timestamp}
// Total components: ${componentFiles.length}

`;

  // Group by category untuk better organization
  const categories = {
    buttons: [],
    inputs: [],
    loading: [],
    tables: [],
    icons: [],
    cards: [],
    general: []
  };

  componentFiles.forEach(file => {
    const name = path.parse(file).name;
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('button')) {
      categories.buttons.push(name);
    } else if (lowerName.includes('input') || lowerName.includes('select') || lowerName.includes('check')) {
      categories.inputs.push(name);
    } else if (lowerName.includes('loading') || lowerName.includes('spinner') || lowerName.includes('pulse')) {
      categories.loading.push(name);
    } else if (lowerName.includes('table')) {
      categories.tables.push(name);
    } else if (lowerName.includes('icon')) {
      categories.icons.push(name);
    } else if (lowerName.includes('card')) {
      categories.cards.push(name);
    } else {
      categories.general.push(name);
    }
  });

  // Generate exports by category
  Object.entries(categories).forEach(([category, components]) => {
    if (components.length > 0) {
      content += `// ==================== ${category.toUpperCase()} ====================\n`;
      components.forEach(component => {
        content += `export { default as ${component} } from './${component}';\n`;
      });
      content += '\n';
    }
  });

  // Add usage example
  const firstFewComponents = componentFiles.slice(0, 3).map(f => path.parse(f).name);
  content += `// Usage: import { ${firstFewComponents.join(', ')} } from './Core';\n`;

  // Write file
  const indexPath = path.join(coreDir, 'index.js');
  fs.writeFileSync(indexPath, content);

  console.log('✅ Generated Core/index.js successfully!');
  console.log(`📄 File: ${indexPath}`);

  // Show components by category
  console.log('\n📊 Components by category:');
  Object.entries(categories).forEach(([category, components]) => {
    if (components.length > 0) {
      console.log(`   ${category}: ${components.join(', ')}`);
    }
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}