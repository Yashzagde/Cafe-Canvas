const fs = require('fs');

const pagePath = 'd:\\Cafe Canva\\frontend\\src\\app\\[store_slug]\\page.tsx';

try {
  const content = fs.readFileSync(pagePath, 'utf8');
  const regex = /var\(--[a-zA-Z0-9-]+\)/g;
  const matches = content.match(regex);
  if (matches) {
    console.log(`Found ${matches.length} matches for CSS variables:`);
    console.log([...new Set(matches)]);
  } else {
    console.log('No CSS variables found in page.tsx');
  }
} catch (err) {
  console.error(err.message);
}
