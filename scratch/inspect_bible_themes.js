const fs = require('fs');
const path = require('path');

const biblePath = 'd:\\Cafe Canva\\extracted_master_theme_prompt.md';

try {
  const content = fs.readFileSync(biblePath, 'utf8');
  console.log('Bible file length:', content.length);
  
  // Find all matches for "THEME-XX:"
  const regex = /THEME-(\d+):\s*([^\r\n]+)/g;
  let match;
  const matches = [];
  while ((match = regex.exec(content)) !== null) {
    matches.push({ id: match[1], name: match[2].trim() });
  }
  
  console.log(`Found ${matches.length} theme headings in bible file.`);
  matches.forEach(m => {
    console.log(`- Theme ${m.id}: ${m.name}`);
  });
  
} catch (err) {
  console.error('Error:', err);
}
