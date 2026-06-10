const fs = require('fs');
const path = require('path');

const geminiPath = 'C:\\Users\\yash\\.gemini';

function findFile(dir, fileNamePattern) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        return; // Skip if stat fails
      }
      if (stat && stat.isDirectory()) {
        results = results.concat(findFile(fullPath, fileNamePattern));
      } else {
        if (file.toLowerCase().includes(fileNamePattern.toLowerCase())) {
          results.push(fullPath);
        }
      }
    });
  } catch (err) {
    // Ignore permission errors etc.
  }
  return results;
}

console.log('Searching for files matching "theme_bible"...');
const foundFiles = findFile(geminiPath, 'theme_bible');
console.log(`Found ${foundFiles.length} files:`);
foundFiles.forEach((f, i) => {
  console.log(`${i + 1}. ${f}`);
  // Copy the first one to scratch
  if (i === 0) {
    fs.copyFileSync(f, 'd:\\Cafe Canva\\scratch\\theme_bible.md');
    console.log('Copied to d:\\Cafe Canva\\scratch\\theme_bible.md');
  }
});
