const fs = require('fs');
const path = require('path');

const baseDirs = [
  'C:\\Users\\yash\\.gemini\\antigravity-ide\\brain',
  'C:\\Users\\yash\\.gemini\\antigravity-backup\\brain'
];

function findThemeFiles(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        return;
      }
      if (stat && stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'cache') return;
        results = results.concat(findThemeFiles(fullPath));
      } else {
        const lowerFile = file.toLowerCase();
        if (lowerFile.includes('theme-styles') || lowerFile.includes('themes.json') || lowerFile.includes('theme_styles')) {
          results.push({ path: fullPath, size: stat.size });
        }
      }
    });
  } catch (err) {}
  return results;
}

console.log('Searching all brain folders for theme files...');
let allResults = [];
baseDirs.forEach(base => {
  if (fs.existsSync(base)) {
    allResults = allResults.concat(findThemeFiles(base));
  }
});

console.log(`Found ${allResults.length} matching files:`);
allResults.sort((a, b) => b.size - a.size);
allResults.forEach((f, i) => {
  console.log(`${i + 1}. ${f.path} (${f.size} bytes)`);
});
