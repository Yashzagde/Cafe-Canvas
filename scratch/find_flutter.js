const fs = require('fs');
const path = require('path');

console.log("Searching for Flutter SDK in typical locations...");

const paths = [
  process.env.FLUTTER_HOME,
  process.env.FLUTTER_ROOT,
  'C:\\src\\flutter',
  'D:\\src\\flutter',
  'C:\\flutter',
  'D:\\flutter',
  path.join(process.env.USERPROFILE || '', 'src', 'flutter'),
  path.join(process.env.USERPROFILE || '', 'flutter'),
  path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk'),
];

console.log("Environment PATH folders containing 'flutter' or 'dart':");
const pathFolders = (process.env.PATH || '').split(path.delimiter);
for (const folder of pathFolders) {
  if (folder.toLowerCase().includes('flutter') || folder.toLowerCase().includes('dart')) {
    console.log(`- ${folder}`);
  }
}

console.log("\nChecking specific locations:");
for (const p of paths) {
  if (!p) continue;
  const binPath = path.join(p, 'bin', 'flutter.bat');
  if (fs.existsSync(binPath)) {
    console.log(`✅ Found Flutter at: ${p}`);
    console.log(`   Binary path: ${binPath}`);
  } else {
    console.log(`❌ Checked: ${p}`);
  }
}
