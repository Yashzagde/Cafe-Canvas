const fs = require('fs');
const path = require('path');

const targetDir = path.join('C:', 'Users', 'yash', '.gemini');

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try { stat = fs.statSync(fullPath); } catch (e) { continue; }
      
      if (stat.isDirectory()) {
        // Skip some standard big directories to speed up
        if (file === 'node_modules' || file === 'bin' || file === 'implicit' || file === 'browser_recordings' || file === 'html_artifacts') continue;
        searchDir(fullPath);
      } else if (stat.isFile()) {
        if (file.endsWith('.log') || file.endsWith('.jsonl') || file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes("Korean Bento")) {
              console.log(`\n=== Found "Korean Bento" in: ${fullPath} ===`);
              // Print around matching text
              const index = content.indexOf("Korean Bento");
              console.log(content.substring(Math.max(0, index - 200), Math.min(content.length, index + 1500)));
            }
          } catch (e) {
            // ignore read errors
          }
        }
      }
    }
  } catch (err) {
    // ignore dir errors
  }
}

console.log("Searching .gemini directory...");
searchDir(targetDir);
console.log("Search complete.");
