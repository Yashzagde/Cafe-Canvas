const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\yash\\.gemini\\antigravity-ide\\brain\\549e09f5-dc99-4164-8538-1e40fad751d5\\.system_generated\\logs\\transcript.jsonl';

try {
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.trim().split('\n');
  console.log(`Total lines in transcript.jsonl: ${lines.length}`);
  
  // Find the last line that has type: "USER_INPUT"
  let userLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('"USER_INPUT"')) {
      userLine = line;
      break;
    }
  }
  
  if (userLine) {
    const data = JSON.parse(userLine);
    console.log(`Found user input! Content length: ${data.content ? data.content.length : 0}`);
    fs.writeFileSync('d:\\Cafe Canva\\scratch\\user_prompt_full.txt', data.content || '', 'utf8');
    console.log('Successfully wrote user_prompt_full.txt');
  } else {
    console.log('No user input line found in transcript.jsonl');
  }
} catch (err) {
  console.error('Error:', err);
}
