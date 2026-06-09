const fs = require('fs');
const path = require('path');

const targetDir = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-backup', 'brain', 'ae5da39d-b719-4810-9055-c3d70d29a37d');

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (stat.isFile()) {
        if (file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.jsonl') || file.endsWith('.log')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes("theme-22") || content.includes("Korean Bento")) {
            console.log(`\n=== Found Match in: ${fullPath} ===`);
            console.log("File size:", content.length);
            // Search for theme-engine code block
            const regex = /const THEMES\s*=\s*{[\s\S]*?}/g;
            const matches = content.match(regex);
            if (matches) {
              console.log("Found matches of THEMES object:", matches.length);
              matches.forEach((m, idx) => {
                fs.writeFileSync(`extracted_themes_obj_${idx}.txt`, m);
                console.log(`Saved object to extracted_themes_obj_${idx}.txt`);
              });
            } else {
              console.log("No THEMES object regex match. Saving entire file contents.");
              fs.writeFileSync('full_matched_file.txt', content);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error searching:", e.message);
  }
}

console.log("Searching folder...");
searchDir(targetDir);
console.log("Search complete.");
