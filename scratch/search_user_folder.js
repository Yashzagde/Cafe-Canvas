const fs = require('fs');
const path = require('path');

console.log("Searching user folder for java.exe...");

/**
 * @param {string} dir
 * @param {number} [depth=0]
 */
function search(dir, depth = 0) {
  if (depth > 5) return; // limit depth
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      
      if (stat.isDirectory()) {
        const lower = file.toLowerCase();
        // Skip large cache/config folders to speed up search
        if (lower === 'temp' || lower === 'cache' || lower === 'package-cache' || lower === 'npm-cache' || lower === 'yarn-cache' || lower === 'node_modules' || lower === '.git' || lower === 'microsoft' || lower === 'windows') {
          continue;
        }
        search(fullPath, depth + 1);
      } else if (file.toLowerCase() === 'java.exe') {
        console.log(`✅ Found: ${fullPath}`);
      }
    }
  } catch (err) {}
}

search('C:\\Users\\yash\\AppData\\Local\\Programs');
search('C:\\Users\\yash\\AppData\\Local');
search('D:\\src');
console.log("Search complete.");
