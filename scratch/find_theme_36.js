const fs = require('fs');
const path = require('path');

const paths = [
  path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain'),
  path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-backup', 'brain')
];

function search() {
  for (const baseDir of paths) {
    if (!fs.existsSync(baseDir)) continue;
    const folders = fs.readdirSync(baseDir);
    for (const folder of folders) {
      const logFile = path.join(baseDir, folder, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        if (content.includes('theme-36')) {
          console.log(`Found theme-36 in: ${logFile}`);
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('theme-36')) {
              console.log(`  Line ${i+1}: ${lines[i].substring(0, 300)}`);
            }
          }
        }
      }
    }
  }
}

search();
