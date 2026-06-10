const fs = require('fs');

try {
  const jsonContent = fs.readFileSync('d:\\Cafe Canva\\extracted_themes.json', 'utf8');
  console.log('JSON file length:', jsonContent.length);
  
  const cssContent = fs.readFileSync('d:\\Cafe Canva\\extracted_theme-styles.css', 'utf8');
  console.log('CSS file length:', cssContent.length);
} catch (e) {
  console.error(e.message);
}
