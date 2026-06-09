const fs = require('fs');
const path = require('path');

const paths = [
  path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain'),
  path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-backup', 'brain')
];

function search() {
  const matches = new Set();
  for (const baseDir of paths) {
    if (!fs.existsSync(baseDir)) continue;
    const folders = fs.readdirSync(baseDir);
    for (const folder of folders) {
      const logFile = path.join(baseDir, folder, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        const regex = /\.theme-(\d+)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          matches.add(match[1]);
        }
      }
    }
  }
  console.log("Found theme classes in all logs:", Array.from(matches).sort().join(', '));
}

search();
