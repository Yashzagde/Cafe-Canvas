const fs = require('fs');
const path = require('path');

const logFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain', '549e09f5-dc99-4164-8538-1e40fad751d5', '.system_generated', 'logs', 'transcript.jsonl');

if (fs.existsSync(logFile)) {
  const content = fs.readFileSync(logFile, 'utf8');
  const lines = content.split('\n');
  console.log(`Total lines in log: ${lines.length}`);
  // Let's print the first 10 lines
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    if (!lines[i].trim()) continue;
    try {
      const json = JSON.parse(lines[i]);
      console.log(`Line ${i + 1} type: ${json.type}, content length: ${json.content ? json.content.length : 0}`);
      if (json.content && json.content.includes("THEME BIBLE")) {
        console.log(`  -> Found THEME BIBLE in message of length ${json.content.length}`);
        fs.writeFileSync('scratch/original_user_request.txt', json.content);
        console.log("  -> Saved to scratch/original_user_request.txt");
      }
    } catch (e) {
      console.log(`Error parsing line ${i + 1}: ${e.message}`);
    }
  }
} else {
  console.log("Log file not found:", logFile);
}
