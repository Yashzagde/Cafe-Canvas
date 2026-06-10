const fs = require('fs');
const filePath = 'd:\\Cafe Canva\\scratch\\theme_bible.md';
try {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(content);
} catch (err) {
  console.error(err);
}
