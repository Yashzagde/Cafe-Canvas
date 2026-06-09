const fs = require('fs');

try {
  let content = fs.readFileSync('extracted_themes.json', 'utf8');
  if (content.startsWith('"') && content.endsWith('"')) {
    content = JSON.parse(content);
  }
  const obj = JSON.parse(content);
  console.log(`Successfully parsed themes! Total themes count: ${obj.length}`);
  fs.writeFileSync('scratch/clean_themes.json', JSON.stringify(obj, null, 2), 'utf8');
  console.log("Wrote scratch/clean_themes.json");
} catch (e) {
  console.error("Error parsing/writing:", e.message);
}
