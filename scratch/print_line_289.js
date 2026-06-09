const fs = require('fs');
const path = require('path');

const logFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain', '549e09f5-dc99-4164-8538-1e40fad751d5', '.system_generated', 'logs', 'transcript.jsonl');

async function main() {
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n');
    const json = JSON.parse(lines[288]); // Index 288 is line 289
    console.log("Type:", json.type);
    console.log("Tool calls:", JSON.stringify(json.tool_calls, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
