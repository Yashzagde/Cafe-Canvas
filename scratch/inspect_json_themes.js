const fs = require('fs');

const pagePath = 'd:\\Cafe Canva\\frontend\\src\\app\\[store_slug]\\page.tsx';

try {
  const content = fs.readFileSync(pagePath, 'utf8');
  const hexRegex = /#[a-fA-F0-9]{6}/g;
  const matches = content.match(hexRegex);
  if (matches) {
    const unique = [...new Set(matches)];
    console.log('Unique hex colors found in page.tsx:', unique);
    
    unique.forEach(color => {
      const count = (content.match(new RegExp(color, 'g')) || []).length;
      console.log(`- ${color}: ${count} occurrences`);
    });
  } else {
    console.log('No hex colors found in page.tsx');
  }
} catch (err) {
  console.error(err.message);
}
