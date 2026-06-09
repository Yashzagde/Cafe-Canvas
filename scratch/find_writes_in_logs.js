const fs = require('fs');
const path = require('path');

const logFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain', '549e09f5-dc99-4164-8538-1e40fad751d5', '.system_generated', 'logs', 'transcript.jsonl');

async function main() {
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n');
    console.log("Searching through transcript lines...");
    
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i]) continue;
      try {
        const json = JSON.parse(lines[i]);
        if (json.tool_calls) {
          for (const tc of json.tool_calls) {
            if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
              const file = tc.args.TargetFile || tc.args.AbsolutePath;
              const contentArg = tc.args.CodeContent || tc.args.ReplacementContent || '';
              if (contentArg.includes('theme') || contentArg.includes('Theme')) {
                console.log(`\n=== Found file write/edit on line ${i + 1} ===`);
                console.log("Tool:", tc.name);
                console.log("File:", file);
                console.log("Content Preview:", contentArg.substring(0, 500));
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    console.log("Search finished.");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
