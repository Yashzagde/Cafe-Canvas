const fs = require('fs');
const path = require('path');

const brainDir = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain');

async function main() {
  try {
    const folders = fs.readdirSync(brainDir);
    console.log(`Checking ${folders.length} brain folders...`);
    
    for (const folder of folders) {
      const logFile = path.join(brainDir, folder, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        if (content.includes("Theme 22  Korean Bento") || content.includes("Korean Bento")) {
          console.log(`\n=== Found match in brain folder: ${folder} ===`);
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("Korean Bento")) {
              try {
                const json = JSON.parse(lines[i]);
                if (json.content && json.content.includes("Korean Bento") && json.content.length > 5000) {
                  console.log(`Found large text (length ${json.content.length}) on line ${i + 1}`);
                  fs.writeFileSync('untruncated_theme_bible.txt', json.content);
                  console.log("Saved full text to untruncated_theme_bible.txt");
                  return;
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    }
    console.log("Finished searching all folders.");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
