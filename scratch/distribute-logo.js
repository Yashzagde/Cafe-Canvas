const sharp = require('../cafe-canvas-store-admin/node_modules/sharp');
const pngToIco = require('../cafe-canvas-store-admin/node_modules/png-to-ico');
const fs = require('fs');
const path = require('path');

const srcLogo = path.join(__dirname, 'logo_transparent.png');
const destAdminLogo = path.resolve(__dirname, '../cafe-canvas-store-admin/resources/logo.png');
const destFrontendLogo = path.resolve(__dirname, '../frontend/public/logo.png');
const destFavicon = path.resolve(__dirname, '../frontend/public/favicon.ico');

async function distribute() {
  try {
    console.log('Resizing logo for Desktop Admin resources...');
    // Create a 512x512 version for desktop and web
    await sharp(srcLogo)
      .resize(512, 512)
      .png()
      .toFile(destAdminLogo);
    console.log(`✅ Saved desktop logo to: ${destAdminLogo}`);

    console.log('Resizing logo for Frontend public assets...');
    await sharp(srcLogo)
      .resize(512, 512)
      .png()
      .toFile(destFrontendLogo);
    console.log(`✅ Saved frontend logo to: ${destFrontendLogo}`);

    console.log('Generating multi-resolution favicon.ico for frontend...');
    const sizes = [16, 32, 48, 256];
    const pngBuffers = [];

    for (const size of sizes) {
      const buf = await sharp(srcLogo)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(buf);
    }

    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(destFavicon, icoBuffer);
    console.log(`✅ Saved favicon.ico to: ${destFavicon} (${(icoBuffer.length / 1024).toFixed(1)} KB)`);

    console.log('All logo assets distributed successfully!');
  } catch (err) {
    console.error('Failed to distribute logo assets:', err);
  }
}

distribute();
