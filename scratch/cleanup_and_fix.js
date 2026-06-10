const fs = require('fs');
const path = require('path');

const pagePath = 'd:\\Cafe Canva\\frontend\\src\\app\\[store_slug]\\page.tsx';

try {
  let content = fs.readFileSync(pagePath, 'utf8');
  const original = content;
  
  // Replacement mappings
  const replacements = [
    // Backgrounds
    { from: /bg-\[\#fcfaf4\]/g, to: 'bg-background' },
    { from: /bg-\[\#ffffff\]/g, to: 'bg-card-bg' },
    { from: /bg-white(?=[\s'"`])/g, to: 'bg-card-bg' },
    { from: /bg-\[\#fbeee7\]/g, to: 'bg-brand-light' },
    { from: /bg-\[\#e05e35\]/g, to: 'bg-brand' },
    { from: /bg-\[\#d97706\]/g, to: 'bg-brand' },
    { from: /bg-\[\#4A3728\]\/45/g, to: 'bg-foreground/20' },
    { from: /bg-\[\#23120b\]/g, to: 'bg-foreground' },
    { from: /bg-stone-50/g, to: 'bg-brand-light/25' },
    
    // Texts
    { from: /text-\[\#4a2d22\]/g, to: 'text-foreground' },
    { from: /text-\[\#e05e35\]/g, to: 'text-brand' },
    { from: /text-\[\#d97706\]/g, to: 'text-brand' },
    { from: /text-\[\#ca8a04\]/g, to: 'text-accent' },
    { from: /text-\[\#1e293b\]/g, to: 'text-foreground' },
    { from: /text-stone-500/g, to: 'text-foreground/60' },
    
    // Borders
    { from: /border-\[\#eae5d8\]/g, to: 'border-border-color' },
    { from: /border-\[\#e05e35\]/g, to: 'border-brand' },
    { from: /border-amber-200/g, to: 'border-brand/35' },
    { from: /border-\[\#e2e8f0\]/g, to: 'border-border-color' },
    { from: /border-stone-100/g, to: 'border-border-color/40' },
    
    // Hover & Active States
    { from: /hover:bg-\[\#b45309\]/g, to: 'hover:bg-brand/90' },
    { from: /hover:bg-\[\#4A3728\]\/60/g, to: 'hover:bg-foreground/30' },
    { from: /hover:border-\[\#e05e35\]\/40/g, to: 'hover:border-brand/40' }
  ];
  
  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });
  
  if (content !== original) {
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('Successfully refactored page.tsx to use semantic theme variables!');
  } else {
    console.log('No replacements needed for page.tsx');
  }
  
} catch (err) {
  console.error('Error during cleanup:', err.message);
}
