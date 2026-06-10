const fs = require('fs');

const cssPath = 'd:\\Cafe Canva\\extracted_theme-styles.css';

try {
  const content = fs.readFileSync(cssPath, 'utf8');
  console.log('CSS file length:', content.length);
  
  // Regex to match theme classes
  const regex = /\.theme-(\d+)\s*\{([\s\S]*?)\}/g;
  let match;
  let count = 0;
  const foundThemes = [];
  
  while ((match = regex.exec(content)) !== null) {
    count++;
    foundThemes.push(`theme-${match[1]}`);
  }
  
  console.log(`Found ${count} themes in CSS:`);
  console.log(foundThemes.join(', '));
  
} catch (err) {
  console.error('Error:', err);
}
