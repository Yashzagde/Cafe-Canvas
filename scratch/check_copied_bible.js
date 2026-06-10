const fs = require('fs');
const path = require('path');

const filePath = 'd:\\Cafe Canva\\scratch\\theme_bible.md';

try {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`File exists! Size: ${stats.size} bytes`);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('First 500 chars of file:');
    console.log(content.substring(0, 500));
    
    // Check if it contains "Bento" or "Korean" or "theme-22"
    console.log('Contains "Bento":', content.toLowerCase().includes('bento'));
    console.log('Contains "Theme 22":', content.includes('Theme 22'));
    console.log('Contains "theme-22":', content.includes('theme-22'));
  } else {
    console.log('File does not exist at ' + filePath);
  }
} catch (err) {
  console.error('Error:', err);
}
