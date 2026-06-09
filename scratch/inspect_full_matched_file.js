const fs = require('fs');
const path = require('path');

const filePath = 'full_matched_file.txt';

async function main() {
  try {
    if (!fs.existsSync(filePath)) {
      console.log("File not found:", filePath);
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    console.log("File content length:", content.length);
    
    // Find lines that look like they contain CSS variables or theme definitions
    const lines = content.split('\n');
    let matchedLines = 0;
    console.log("=== Matching lines in file ===");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("theme-") && (lines[i].includes(":root") || lines[i].includes("primaryColor") || lines[i].includes("primary:"))) {
        console.log(`Line ${i + 1}:`, lines[i].substring(0, 300));
        matchedLines++;
        if (matchedLines > 50) {
          console.log("Too many matches, stopping print...");
          break;
        }
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
