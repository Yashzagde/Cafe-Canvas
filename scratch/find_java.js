const fs = require('fs');
const path = require('path');

console.log("Searching for Java/JDK in typical locations...");

const paths = [
  process.env.JAVA_HOME,
  'C:\\Program Files\\Java',
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  'C:\\Program Files\\Android\\Android Studio\\jre',
  'D:\\Program Files\\Java',
  'D:\\Program Files\\Android\\Android Studio\\jbr',
  'D:\\Program Files\\Android\\Android Studio\\jre',
];

console.log("Checking locations:");
for (const p of paths) {
  if (!p) continue;
  
  if (fs.existsSync(p)) {
    console.log(`✅ Found folder: ${p}`);
    // Check if bin/java.exe exists
    const binPath = path.join(p, 'bin', 'java.exe');
    if (fs.existsSync(binPath)) {
      console.log(`   ✅ Found java.exe at: ${binPath}`);
    }
    
    // Check subfolders if it is C:\Program Files\Java (e.g. jdk-17, jdk-21)
    if (p.toLowerCase().includes('java')) {
      try {
        const subdirs = fs.readdirSync(p);
        for (const dir of subdirs) {
          const fullPath = path.join(p, dir);
          const subBin = path.join(fullPath, 'bin', 'java.exe');
          if (fs.existsSync(subBin)) {
            console.log(`   ✅ Found java.exe inside: ${fullPath}`);
          }
        }
      } catch (e) {}
    }
  } else {
    console.log(`❌ Checked: ${p}`);
  }
}
