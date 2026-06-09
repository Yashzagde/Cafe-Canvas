const fs = require('fs');
const path = require('path');

const filePath = 'overview_log_content.txt';

async function main() {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Let's find any JSON string or large block containing CSS rules for themes
    // Let's find all occurrences of: theme-01, theme-02, ..., theme-52
    const foundThemes = [];
    const lines = content.split('\n');
    console.log(`Total lines: ${lines.length}`);

    // Let's search for "theme-01" or other themes and extract the surrounding block
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("theme-01") && line.includes("primary") && line.includes("accent")) {
        console.log(`Line ${i + 1} matches theme-01! Length: ${line.length}`);
        // Let's extract this line and write it to a file
        fs.writeFileSync('matched_theme_line.txt', line);
        console.log("Saved line to matched_theme_line.txt");
        break;
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
