const { execSync } = require('child_process');

try {
  console.log("Rewriting git history to purge large files...");
  
  // Define command with proper quotes for Windows shell execution
  // We use --index-filter to avoid checking out files on disk (runs much faster)
  const filterCmd = 'git filter-branch --force --index-filter ' + 
    '"git rm --cached --ignore-unmatch \\"link.cafecanvas.bar/CafeCanvas-Store-Admin-Setup-1.0.0.bin\\" \\"homepage.cafecanvas.bar/downloads/CafeCanvas-Store-Admin-Setup-1.0.0.zip\\"" ' + 
    '--prune-empty --tag-name-filter cat -- --all';

  console.log(`Running: ${filterCmd}`);
  const output = execSync(filterCmd, { stdio: 'inherit', cwd: 'd:\\Cafe Canva' });
  
  console.log("\nCleaning up git backup refs and running garbage collection...");
  execSync('git update-ref -d refs/original/refs/heads/main', { stdio: 'inherit', cwd: 'd:\\Cafe Canva' });
  execSync('git reflog expire --expire=now --all', { stdio: 'inherit', cwd: 'd:\\Cafe Canva' });
  execSync('git gc --prune=now --aggressive', { stdio: 'inherit', cwd: 'd:\\Cafe Canva' });
  
  console.log("\n================================================");
  console.log("✓ Large files purged from git history successfully!");
  console.log("================================================");
  
} catch (error) {
  console.error("Purging large files failed:", error.message);
}
