const fs = require('fs');
const filePath = 'C:\\Users\\yash\\.gemini\\antigravity-ide\\brain\\549e09f5-dc99-4164-8538-1e40fad751d5\\.system_generated\\messages\\b4408b1f-bf64-4ffc-87ca-bf49a3c77ce5.json';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('File content character length:', content.length);
  const data = JSON.parse(content);
  console.log('Keys in JSON:', Object.keys(data));
  if (data.content) {
    console.log('Content snippet (first 1000 chars):');
    console.log(data.content.substring(0, 1000));
  } else {
    console.log('No content key. Full data keys:', Object.keys(data));
  }
} catch (err) {
  console.error('Error:', err);
}
