const { execSync } = require('child_process');

try {
  console.log("Analyzing git history for large blobs (> 40MB)...");
  
  // Get all objects in history with their type and size
  const output = execSync('git rev-list --objects --all', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  const lines = output.trim().split('\n');
  
  console.log(`Found ${lines.length} objects. Fetching sizes...`);
  
  // Run cat-file --batch-check to get sizes
  const batchInput = lines.map(line => line.split(' ')[0]).join('\n');
  const sizeOutput = execSync('git cat-file --batch-check="%(objectname) %(objecttype) %(objectsize)"', {
    input: batchInput,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  });
  
  const sizeLines = sizeOutput.trim().split('\n');
  
  const largeBlobs = [];
  
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(' ');
    const sha = parts[0];
    const path = parts.slice(1).join(' ');
    
    if (!path) continue; // skip commit/tree objects without path
    
    const sizeParts = sizeLines[i].split(' ');
    const type = sizeParts[1];
    const size = parseInt(sizeParts[2], 10);
    
    if (type === 'blob' && size > 40 * 1024 * 1024) {
      largeBlobs.push({ sha, path, size: (size / (1024 * 1024)).toFixed(2) + ' MB' });
    }
  }
  
  console.log("\n================================================");
  console.log("Large files in Git history (> 40MB):");
  console.log("================================================");
  largeBlobs.forEach(b => console.log(`- ${b.path} (${b.size}) [SHA: ${b.sha}]`));
  console.log("================================================");
  
} catch (error) {
  console.error("Error analyzing git objects:", error.message);
}
