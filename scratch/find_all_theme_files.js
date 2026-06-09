const fs = require('fs');
const path = require('path');

const backupDir = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-backup', 'brain');

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (stat.isFile()) {
        if (file.toLowerCase().includes("theme") || file.toLowerCase().includes("engine")) {
          if (!fullPath.includes('.system_generated')) {
            console.log(`Found file: ${fullPath} (Size: ${stat.size} bytes)`);
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

console.log("Searching backup brains for files containing 'theme' or 'engine' in name...");
searchDir(backupDir);
console.log("Search finished.");
