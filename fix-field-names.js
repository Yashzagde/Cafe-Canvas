/**
 * Cafe Canva - Field Name Alignment Safety Net
 * This script recursively scans source directories and ensures there are no lingering field name mismatches
 * (e.g. restaurant_id vs tenant_id, profile field mappings) left from the legacy monorepo or duplicate files.
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const targetDirs = [
  path.join(rootDir, 'frontend/src'),
  path.join(rootDir, 'Backend-Software/Store-Admin/controllers'),
  path.join(rootDir, 'Backend-Software/Store-Admin/store-front'),
];

const excludes = [
  'node_modules',
  '.next',
  'dist',
  'out',
  '.git',
];

const replacements = [
  { search: /restaurant_id\b/g, replace: 'tenant_id' },
  { search: /cafe_id\b/g, replace: 'tenant_id' },
];

function scanAndFix(dir) {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);
  items.forEach(item => {
    if (excludes.includes(item)) return;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanAndFix(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.sql'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        replacements.forEach(rep => {
          if (rep.search.test(content)) {
            console.log(`[ALIGNING] Found legacy field in ${path.relative(rootDir, fullPath)}`);
            content = content.replace(rep.search, rep.replace);
            modified = true;
          }
        });

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`[FIXED] Updated field names in ${path.relative(rootDir, fullPath)}`);
        }
      }
    }
  });
}

console.log("==========================================================================");
console.log("               CAFE CANVA - FIELD NAME SAFETY NET SYSTEM");
console.log("==========================================================================");

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Scanning: ${path.relative(rootDir, dir)}...`);
    scanAndFix(dir);
  } else {
    console.log(`Skipping non-existent directory: ${path.relative(rootDir, dir)}`);
  }
});

console.log("\nField name alignment safety check completed!");
