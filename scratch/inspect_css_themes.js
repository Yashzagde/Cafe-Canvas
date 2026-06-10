const fs = require('fs');

const cssPath = 'd:\\Cafe Canva\\extracted_theme-styles.css';

try {
  const content = fs.readFileSync(cssPath, 'utf8');
  console.log('CSS file length:', content.length);
  
  // Find all theme classes like .theme-01 through .theme-52
  const matches = content.match(/\.theme-\d+/g);
  if (matches) {
    console.log(`Found ${matches.length} theme class occurrences.`);
    const unique = [...new Set(matches)];
    console.log(`Unique theme classes (${unique.length}):`, unique.sort());
  } else {
    console.log('No theme classes found.');
  }
} catch (err) {
  console.error('Error:', err);
}
