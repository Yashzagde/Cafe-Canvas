const fs = require('fs');
const path = require('path');

console.log("Searching Program Files for java.exe...");

function search(dir, depth = 0) {
  if (depth > 4) return; // limit depth
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
        // Skip some system/common directories to speed up
        const lower = file.toLowerCase();
        if (lower === 'windows' || lower === 'system32' || lower === 'syswow64' || lower === 'microsoft' || lower === 'common files') {
          continue;
        }
        search(fullPath, depth + 1);
      } else if (file.toLowerCase() === 'java.exe') {
        console.log(`✅ Found: ${fullPath}`);
      }
    }
  } catch (err) {}
}

search('C:\\Program Files');
search('C:\\Program Files (x86)');
search('D:\\Program Files');
search('D:\\Program Files (x86)');
console.log("Search complete.");
