const fs = require('fs');
const path = require('path');

const logFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain', '549e09f5-dc99-4164-8538-1e40fad751d5', '.system_generated', 'logs', 'transcript.jsonl');

if (fs.existsSync(logFile)) {
  const content = fs.readFileSync(logFile, 'utf8');
  const lines = content.split('\n');
  console.log(`Checking ${lines.length} lines...`);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Korean Bento') && lines[i].includes('French Patisserie')) {
      console.log(`Line ${i + 1} matches! Length: ${lines[i].length}`);
      try {
        const json = JSON.parse(lines[i]);
        console.log(`  Type: ${json.type}, Source: ${json.source}`);
        if (json.content) {
          const outName = `scratch/extracted_full_bible_from_line_${i+1}.txt`;
          fs.writeFileSync(outName, json.content);
          console.log(`  -> Saved message content of length ${json.content.length} to ${outName}`);
        }
      } catch (e) {
        console.log(`  JSON parse error: ${e.message}`);
      }
    }
  }
}
