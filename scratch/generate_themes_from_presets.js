const fs = require('fs');
const path = require('path');

const editorPath = 'd:/Cafe Canva/frontend/src/components/admin/StorefrontEditor.tsx';

try {
  const content = fs.readFileSync(editorPath, 'utf8');
  
  // Find the PRESETS block
  const startIdx = content.indexOf('const PRESETS: StoreTheme[] = [');
  if (startIdx === -1) {
    console.error('PRESETS array not found in StorefrontEditor.tsx');
    process.exit(1);
  }
  
  // Find the [ after the '=' sign
  const equalsIdx = content.indexOf('=', startIdx);
  const startScan = content.indexOf('[', equalsIdx);
  console.log('startIdx:', startIdx, 'equalsIdx:', equalsIdx, 'startScan:', startScan);
  
  let bracketCount = 0;
  let endIdx = -1;
  
  for (let i = startScan; i < content.length; i++) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') bracketCount--;
    if (bracketCount === 0) {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx === -1) {
    console.error('Closing bracket of PRESETS array not found');
    process.exit(1);
  }
  
  const presetsStr = content.substring(startScan, endIdx + 1);
  console.log('Extracted presets string length:', presetsStr.length);
  
  // Evaluate the array string
  const presets = eval(presetsStr);
  console.log('Successfully parsed presets array! Total themes count:', presets.length);
  
  // Save to JSON for verification
  fs.writeFileSync('scratch/presets_extracted.json', JSON.stringify(presets, null, 2), 'utf8');
  console.log('Saved parsed presets to scratch/presets_extracted.json');
} catch (e) {
  console.error('Error:', e.message);
}
