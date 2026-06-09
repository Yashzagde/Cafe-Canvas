const fs = require('fs');

try {
  let content = fs.readFileSync('extracted_themes.json', 'utf8');
  console.log("Original content length:", content.length);
  
  // Let's log around character 2048
  const pos = 2048;
  console.log("Snippet around 2048:", content.substring(pos - 50, pos + 50));
  
  // If it's a JSON string enclosed in quotes, it might have escaped newlines like \n
  // Let's try parsing it as a Javascript object by wraping it in a JS declaration
  const parsed = eval("(" + content + ")");
  console.log("Eval successful! Length:", parsed.length);
  fs.writeFileSync('scratch/clean_themes.json', JSON.stringify(parsed, null, 2), 'utf8');
  console.log("Saved scratch/clean_themes.json");
} catch (e) {
  console.error("Error with eval/fix:", e.message);
}
