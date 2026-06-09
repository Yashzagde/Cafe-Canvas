const fs = require('fs');
const path = require('path');

const logFile = path.join('C:', 'Users', 'yash', '.gemini', 'antigravity-ide', 'brain', '744fca02-0ef1-44d1-98db-fc3ad080d821', '.system_generated', 'logs', 'transcript.jsonl');

if (fs.existsSync(logFile)) {
  const content = fs.readFileSync(logFile, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    try {
      const json = JSON.parse(lines[i]);
      if (json.tool_calls) {
        json.tool_calls.forEach(tc => {
          const name = tc.name;
          const args = tc.args || {};
          const target = args.TargetFile || args.AbsolutePath || '';
          if (target.includes('themes.json')) {
            console.log(`Found themes.json in tool call at line ${i + 1}`);
            let code = args.CodeContent || args.ReplacementContent || '';
            if (code) {
              // Sometimes code is double-serialized if it was stringified as a JSON string inside a JSON field
              if (code.startsWith('"') && code.endsWith('"')) {
                try {
                  code = JSON.parse(code);
                } catch(e) {}
              }
              fs.writeFileSync('extracted_themes.json', code);
              console.log(`Saved themes.json (length ${code.length})`);
            }
          }
          if (target.includes('theme-styles.css')) {
            console.log(`Found theme-styles.css in tool call at line ${i + 1}`);
            let code = args.CodeContent || args.ReplacementContent || '';
            if (code) {
              if (code.startsWith('"') && code.endsWith('"')) {
                try {
                  code = JSON.parse(code);
                } catch(e) {}
              }
              fs.writeFileSync('extracted_theme-styles.css', code);
              console.log(`Saved theme-styles.css (length ${code.length})`);
            }
          }
          if (target.includes('master-theme-prompt.md')) {
            console.log(`Found master-theme-prompt.md in tool call at line ${i + 1}`);
            let code = args.CodeContent || args.ReplacementContent || '';
            if (code) {
              if (code.startsWith('"') && code.endsWith('"')) {
                try {
                  code = JSON.parse(code);
                } catch(e) {}
              }
              fs.writeFileSync('extracted_master_theme_prompt.md', code);
              console.log(`Saved master-theme-prompt.md (length ${code.length})`);
            }
          }
        });
      }
    } catch (e) {
      console.log(`Error on line ${i + 1}: ${e.message}`);
    }
  }
}
