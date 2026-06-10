const fs = require('fs');

const jsonPath = 'd:\\Cafe Canva\\extracted_themes.json';

try {
  const content = fs.readFileSync(jsonPath, 'utf8');
  console.log('JSON file character length:', content.length);
  const data = JSON.parse(content);
  console.log(`Successfully parsed JSON array with ${data.length} items.`);
  data.forEach((theme, index) => {
    console.log(`${index + 1}. ID: ${theme.id}, Name: ${theme.name}, Tier: ${theme.tier || theme.category}, Font display: ${theme.typography ? theme.typography.display : 'none'}`);
  });
} catch (err) {
  console.error('Error:', err);
}
