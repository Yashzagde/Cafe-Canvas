const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'frontend', 'src', 'components', 'admin', 'StorefrontEditor.tsx');
if (!fs.existsSync(file)) {
  console.error("File not found");
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log("LINES IN StorefrontEditor.tsx CONTAINING 'show' or 'price':");
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('show') || line.toLowerCase().includes('price') || line.toLowerCase().includes('blog')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
