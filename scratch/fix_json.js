const fs = require('fs');

const editorPath = 'd:/Cafe Canva/frontend/src/components/admin/StorefrontEditor.tsx';

try {
  const content = fs.readFileSync(editorPath, 'utf8');
  const startIdx = content.indexOf('const PRESETS: StoreTheme[] = [');
  console.log('startIdx:', startIdx);
  if (startIdx !== -1) {
    const startScan = content.indexOf('[', startIdx);
    console.log('startScan:', startScan);
    console.log('Characters around startScan:', JSON.stringify(content.substring(startScan, startScan + 50)));
  }
} catch (e) {
  console.error(e.message);
}
