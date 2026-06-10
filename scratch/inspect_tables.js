const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (name.includes('node_modules') || name.includes('.next') || name.includes('.git') || name.includes('cafecanva_flutter')) {
      continue;
    }
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.sql')) {
        files.push(name);
      }
    }
  }
  return files;
}

const sqlFiles = getFiles(path.join(__dirname, '..'));
console.log("--- SQL FILES FOUND ---");
sqlFiles.forEach(f => console.log(f));
