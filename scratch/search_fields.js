const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'frontend', 'src', 'components', 'admin', 'StorefrontEditor.tsx');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);
console.log("Lines containing checkbox or input or select:");
lines.forEach((line, idx) => {
  if (line.includes('type="checkbox"') || line.includes('<select') || line.includes('input') || line.includes('show')) {
    if (line.length < 150) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
