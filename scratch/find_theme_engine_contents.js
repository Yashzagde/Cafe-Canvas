const fs = require('fs');
const path = require('path');

const logPath = 'd:\\Cafe Canva\\scratch\\overview_log_content.txt';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  console.log(`Searching through ${lines.length} lines for 'page.tsx'...`);
  
  let count = 0;
  lines.forEach((line, index) => {
    if (line.includes('page.tsx')) {
      count++;
      console.log(`[Line ${index + 1}]: Match ${count}, Length: ${line.length}`);
      if (line.length > 1500) {
        fs.writeFileSync(`scratch/large_page_line_${index + 1}.txt`, line);
        console.log(`  -> Wrote large line to scratch/large_page_line_${index + 1}.txt`);
      } else {
        console.log(`  Snippet: ${line.substring(0, 300)}`);
      }
    }
  });
  
} catch (err) {
  console.error(err.message);
}
