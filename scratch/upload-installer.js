const fs = require('fs');
const path = require('path');

async function main() {
  const filePath = path.resolve(__dirname, '../cafe-canvas-store-admin/release/Cafe Canvas Store Admin Setup 1.0.0.exe');
  console.log('Uploading file from:', filePath);
  
  if (!fs.existsSync(filePath)) {
    console.error('Error: File does not exist at path:', filePath);
    process.exit(1);
  }

  try {
    // 1. Get server
    console.log('Getting upload server list...');
    const serverRes = await fetch('https://api.gofile.io/servers');
    const serverData = await serverRes.json();
    if (serverData.status !== 'ok' || !serverData.data || !serverData.data.servers || serverData.data.servers.length === 0) {
      throw new Error('Failed to get server: ' + JSON.stringify(serverData));
    }
    const server = serverData.data.servers[0].name;
    console.log('Using server:', server);

    // 2. Upload file
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    
    const formData = new FormData();
    formData.append('file', blob, 'Cafe Canvas Store Admin Setup 1.0.0.exe');

    console.log(`Uploading to Gofile server: https://${server}.gofile.io/uploadFile`);
    const uploadRes = await fetch(`https://${server}.gofile.io/uploadFile`, {
      method: 'POST',
      body: formData
    });
    
    const uploadData = await uploadRes.json();
    if (uploadData.status !== 'ok') {
      throw new Error('Upload failed: ' + JSON.stringify(uploadData));
    }

    console.log('\n=========================================');
    console.log('🚀 UPLOAD SUCCESSFUL!');
    console.log('📥 Download Link:', uploadData.data.downloadPage);
    console.log('=========================================\n');
  } catch (error) {
    console.error('Error uploading:', error);
  }
}

main();
