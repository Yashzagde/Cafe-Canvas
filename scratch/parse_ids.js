const fs = require('fs');

try {
  const content = fs.readFileSync('extracted_themes.json', 'utf8');
  // Match escaped or unescaped theme IDs:
  // e.g. \"id\": \"theme-01\" or "id": "theme-01"
  const regex = /id\\"\s*:\s*\\"theme-(\d+)\\"/g;
  let match;
  const ids = [];
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  console.log("Found theme IDs in raw string:", ids.join(', '));
} catch (e) {
  console.error("Error:", e.message);
}
