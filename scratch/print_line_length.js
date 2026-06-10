const fs = require('fs');

const cssPath = 'd:\\Cafe Canva\\extracted_theme-styles.css';

try {
  const content = fs.readFileSync(cssPath, 'utf8');
  console.log('Total character length:', content.length);
  console.log('Number of lines:', content.split('\n').length);
  const first200 = content.substring(0, 1000);
  console.log('First 1000 characters:', first200);
} catch (err) {
  console.error(err.message);
}
