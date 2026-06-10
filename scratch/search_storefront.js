const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'frontend', 'src', 'app', '[store_slug]', 'page.tsx');
if (!fs.existsSync(file)) {
  console.error("File not found");
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);
console.log("Lines containing 'options' or 'show':");
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('options') || line.toLowerCase().includes('show')) {
    if (line.length < 150) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
