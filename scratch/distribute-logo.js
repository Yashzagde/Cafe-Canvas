// @ts-nocheck
const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const srcLogo = path.join(__dirname, 'logo_transparent.png');
const destAdminLogo = path.resolve(__dirname, '../cafe-canvas-store-admin/resources/logo.png');
const destAdminSrcLogoDir = path.resolve(__dirname, '../cafe-canvas-store-admin/src/assets');
const destAdminSrcLogo = path.resolve(__dirname, '../cafe-canvas-store-admin/src/assets/logo.png');
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

    console.log('Saving logo to Desktop Admin src/assets...');
    if (!fs.existsSync(destAdminSrcLogoDir)) {
      fs.mkdirSync(destAdminSrcLogoDir, { recursive: true });
    }
    await sharp(srcLogo)
      .resize(512, 512)
      .png()
      .toFile(destAdminSrcLogo);
    console.log(`✅ Saved desktop src logo to: ${destAdminSrcLogo}`);

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
