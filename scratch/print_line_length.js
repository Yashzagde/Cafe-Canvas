const fs = require('fs');
const filePath = 'overview_log_content.txt';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("theme-01") && lines[i].includes("primary")) {
      console.log(`Line ${i + 1} length:`, lines[i].length);
      console.log("Substr 0-500:", lines[i].substring(0, 500));
      console.log("Substr 500-1000:", lines[i].substring(500, 1000));
      console.log("Contains '<truncated':", lines[i].includes("<truncated"));
      break;
    }
  }
} catch (e) {
  console.error(e.message);
}
