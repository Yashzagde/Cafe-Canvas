const fs = require('fs');
const path = require('path');

const logFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain', '549e09f5-dc99-4164-8538-1e40fad751d5', '.system_generated', 'logs', 'transcript.jsonl');

async function main() {
  try {
    if (!fs.existsSync(logFile)) {
      console.log("Log file does not exist at path:", logFile);
      return;
    }
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n');
    console.log(`Total lines in log: ${lines.length}`);
    
    // Find lines mentioning THEME BIBLE or 52 themes
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("THEME BIBLE v4.0") || lines[i].includes("52 themes")) {
        console.log(`\n=== Found on line ${i + 1} ===`);
        const json = JSON.parse(lines[i]);
        console.log("Type:", json.type);
        // Print part of content to check
        console.log("Content preview:", json.content ? json.content.substring(0, 1000) : "NO CONTENT");
        // Save full content of this message if it's the user request
        if (json.content && json.content.includes("THEME BIBLE")) {
          fs.writeFileSync('extracted_theme_bible.txt', json.content);
          console.log("Saved full message to extracted_theme_bible.txt");
        }
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
