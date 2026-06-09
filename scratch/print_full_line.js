const fs = require('fs');
const path = require('path');

const logFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain', '549e09f5-dc99-4164-8538-1e40fad751d5', '.system_generated', 'logs', 'transcript.jsonl');

async function main() {
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n');
    // Line 288 is index 287
    const json = JSON.parse(lines[287]);
    fs.writeFileSync('full_theme_bible.txt', json.content);
    console.log("Full theme bible written to full_theme_bible.txt, length:", json.content.length);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
