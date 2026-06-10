const fs = require('fs');
const path = require('path');

const pathsToSearch = [
  'C:\\Users\\yash\\.gemini',
  'd:\\Cafe Canva'
];

function searchForPrompt(dir) {
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
        if (file === 'node_modules' || file === '.git' || file === 'cache') return;
        results = results.concat(searchForPrompt(fullPath));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.md' || ext === '.json' || ext === '.txt' || ext === '.sql' || ext === '.js' || ext === '.ts') {
          try {
            if (stat.size < 5000000) { // < 5MB
              const content = fs.readFileSync(fullPath, 'utf8');
              if (content.includes('THEME MASTER PROMPT') && content.includes('THEME-22')) {
                results.push({ path: fullPath, size: stat.size });
              }
            }
          } catch (e) {}
        }
      }
    });
  } catch (err) {}
  return results;
}

pathsToSearch.forEach(searchPath => {
  console.log(`Searching in ${searchPath}...`);
  const found = searchForPrompt(searchPath);
  console.log(`Found ${found.length} matching files in ${searchPath}:`);
  found.forEach((f, i) => {
    console.log(`${i + 1}. ${f.path} (${f.size} bytes)`);
  });
});
