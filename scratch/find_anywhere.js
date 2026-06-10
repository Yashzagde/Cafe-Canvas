const fs = require('fs');
const path = require('path');

const rootDirs = [
  'D:\\Cafe Canva',
  'D:\\final-clean',
  'D:\\test-clone',
  'D:\\src'
];

function searchFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 5000000) return; // Skip files > 5MB
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Korean Bento') && content.includes('theme-52')) {
      console.log(`Found complete theme match: ${filePath} (${stat.size} bytes)`);
    }
  } catch (e) {}
}

function walk(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        return;
      }
      if (stat && stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist') return;
        walk(fullPath);
      } else {
        if (file.endsWith('.css') || file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.txt') || file.endsWith('.ts') || file.endsWith('.tsx')) {
          searchFile(fullPath);
        }
      }
    });
  } catch (e) {}
}

console.log('Searching folders for themes...');
rootDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Scanning ${dir}...`);
    walk(dir);
  }
});
console.log('Search completed.');
