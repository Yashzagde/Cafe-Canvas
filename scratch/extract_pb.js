const fs = require('fs');

const pbPath = 'C:\\Users\\yash\\.gemini\\antigravity-ide\\conversations\\f3f65eb7-1ccc-4b74-8c80-eba4a56c1840.pb';

try {
  const buf = fs.readFileSync(pbPath);
  console.log('Size:', buf.length);
  console.log('Header hex:', buf.slice(0, 32).toString('hex'));
  console.log('Header text:', buf.slice(0, 32).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
} catch (err) {
  console.error(err);
}
