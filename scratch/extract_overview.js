const fs = require('fs');
const path = require('path');

const sourceFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-backup', 'brain', 'ae5da39d-b719-4810-9055-c3d70d29a37d', '.system_generated', 'logs', 'overview.txt');
const destFile = 'overview_log_content.txt';

try {
  const content = fs.readFileSync(sourceFile, 'utf8');
  fs.writeFileSync(destFile, content);
  console.log("Successfully extracted overview.txt! Size:", content.length);
} catch (e) {
  console.error("Error:", e.message);
}
