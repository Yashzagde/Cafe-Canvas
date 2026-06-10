const fs = require('fs');

const pagePath = 'd:\\Cafe Canva\\frontend\\src\\app\\[store_slug]\\page.tsx';

try {
  const content = fs.readFileSync(pagePath, 'utf8');
  const words = ['bg-background', 'text-foreground', 'brand', 'accent', 'sage', 'card-bg'];
  
  words.forEach(w => {
    const count = (content.match(new RegExp(w, 'g')) || []).length;
    console.log(`Word '${w}' count: ${count}`);
  });
} catch (err) {
  console.error(err.message);
}
