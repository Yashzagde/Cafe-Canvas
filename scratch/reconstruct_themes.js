const fs = require('fs');
const filePath = 'overview_log_content.txt';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /['"]theme-\d+['"]:\s*[`'"].*?[`'"]/g;
  const matches = content.match(regex);
  if (matches) {
    console.log(`Found ${matches.length} theme matches in overview logs!`);
    const unique = [...new Set(matches)];
    console.log(`Unique theme definitions found: ${unique.length}`);
    fs.writeFileSync('reconstructed_themes.txt', unique.join('\n'));
    console.log("Saved definitions to reconstructed_themes.txt");
  } else {
    console.log("No theme matches found via simple regex.");
    // Let's do a broader line search
    const lines = content.split('\n');
    const matches2 = [];
    for (const line of lines) {
      if (line.includes("theme-") && line.includes(":root")) {
        matches2.push(line);
      }
    }
    console.log(`Line search found ${matches2.length} matches.`);
    fs.writeFileSync('reconstructed_themes_lines.txt', matches2.join('\n'));
  }
} catch (e) {
  console.error(e.message);
}
