const fs = require('fs');
const path = require('path');

const projectPath = 'd:\\Cafe Canva';

function findCssFiles(dir) {
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
        if (file === 'node_modules' || file === '.git' || file === '.next') return;
        results = results.concat(findCssFiles(fullPath));
      } else {
        if (file.endsWith('.css') && file.startsWith('theme-')) {
          results.push(fullPath);
        }
      }
    });
  } catch (err) {}
  return results;
}

console.log('Searching for "theme-*.css" files in workspace...');
const found = findCssFiles(projectPath);
console.log(`Found ${found.length} CSS files:`);
found.forEach((f, i) => {
  console.log(`${i + 1}. ${f}`);
});
