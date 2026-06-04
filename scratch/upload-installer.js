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
    // 1. Get server list
    console.log('Getting upload server list...');
    const serverRes = await fetch('https://api.gofile.io/servers');
    const serverData = await serverRes.json();
    if (serverData.status !== 'ok' || !serverData.data || !serverData.data.servers || serverData.data.servers.length === 0) {
      throw new Error('Failed to get server list: ' + JSON.stringify(serverData));
    }
    
    const servers = serverData.data.servers;
    console.log(`Found ${servers.length} servers. Trying upload...`);

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);

    let success = false;

    for (let i = 0; i < servers.length; i++) {
      const server = servers[i].name;
      console.log(`[Attempt ${i + 1}/${servers.length}] Uploading to server: ${server} (https://${server}.gofile.io/uploadFile)...`);
      
      try {
        const formData = new FormData();
        formData.append('file', blob, 'Cafe Canvas Store Admin Setup 1.0.0.exe');

        const uploadRes = await fetch(`https://${server}.gofile.io/uploadFile`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(30000) // 30s timeout per server
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.status === 'ok') {
          console.log('\n=========================================');
          console.log('🚀 UPLOAD SUCCESSFUL!');
          console.log('📥 Download Link:', uploadData.data.downloadPage);
          console.log('=========================================\n');
          success = true;
          break;
        } else {
          console.warn(`Server ${server} failed:`, uploadData);
        }
      } catch (err) {
        console.warn(`Error on server ${server}:`, err instanceof Error ? err.message : err);
      }
    }

    if (!success) {
      console.error('Could not upload to any available Gofile servers.');
    }
  } catch (error) {
    console.error('Error in main upload flow:', error);
  }
}

main();
