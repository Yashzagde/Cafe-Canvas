const fs = require('fs');

const filePath = 'd:/Cafe Canva/homepage.cafecanvas.bar/index.html';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log('Total lines:', lines.length);

const startIdx = lines.findIndex(l => l.includes('Hero Centerpiece Content'));
console.log('Start index:', startIdx);

if (startIdx === -1) {
  console.log('Pattern not found');
  process.exit(1);
}

// Find the line with </div><div class="hero-cards">
const endIdx = lines.findIndex((l, i) => i >= startIdx && l.includes('hero-cards'));
console.log('End index:', endIdx);
console.log('Line at endIdx:', JSON.stringify(lines[endIdx]));

// Replace lines startIdx through endIdx with just the hero-cards opening
const newLines = [
  ...lines.slice(0, startIdx),
  '  <div class="hero-cards">',
  ...lines.slice(endIdx + 1)
];

console.log('New total lines:', newLines.length);

const newContent = newLines.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('File written successfully');
