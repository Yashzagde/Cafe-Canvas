const sharp = require('sharp')
const pngToIco = require('png-to-ico')
const fs = require('fs')
const path = require('path')

const RESOURCES = path.join(__dirname, '..', 'resources')

// Generate logo.png from SVG if it doesn't exist or is a stub
async function generateLogoPNG() {
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFF8F0"/>
          <stop offset="100%" stop-color="#FFEEDD"/>
        </linearGradient>
        <linearGradient id="cup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C4714A"/>
          <stop offset="100%" stop-color="#9A5235"/>
        </linearGradient>
      </defs>
      <!-- Background rounded square -->
      <rect width="512" height="512" fill="url(#bg)" rx="96"/>
      <!-- Coffee cup body -->
      <rect x="146" y="160" width="220" height="200" rx="28" fill="url(#cup)"/>
      <!-- Cup handle -->
      <path d="M366 220 C420 220 420 310 366 310" stroke="#C4714A" stroke-width="28" fill="none" stroke-linecap="round"/>
      <!-- Cup saucer -->
      <ellipse cx="256" cy="380" rx="140" ry="20" fill="#D4A843" opacity="0.8"/>
      <!-- Steam lines -->
      <path d="M200 140 Q210 110 200 80" stroke="#D4A843" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.6"/>
      <path d="M256 130 Q266 95 256 60" stroke="#D4A843" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/>
      <path d="M312 140 Q322 110 312 80" stroke="#D4A843" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.6"/>
      <!-- Letter C -->
      <text x="256" y="290" font-family="Georgia, serif" font-size="140" font-weight="bold"
            fill="#FFF8F0" text-anchor="middle" dominant-baseline="middle">C</text>
    </svg>
  `
  const svgBuffer = Buffer.from(svg)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(RESOURCES, 'logo.png'))
  console.log('✅ Generated logo.png (512×512)')
}

// Generate proper multi-resolution ICO from logo.png
async function generateIco() {
  const logoPath = path.join(RESOURCES, 'logo.png')
  const sizes = [16, 32, 48, 256]
  const pngBuffers = []

  for (const size of sizes) {
    const buf = await sharp(logoPath)
      .resize(size, size)
      .png()
      .toBuffer()
    pngBuffers.push(buf)
  }

  const icoBuffer = await pngToIco(pngBuffers)
  fs.writeFileSync(path.join(RESOURCES, 'icon.ico'), icoBuffer)

  const sizeKB = (icoBuffer.length / 1024).toFixed(1)
  console.log(`✅ Generated icon.ico (${sizeKB} KB, resolutions: ${sizes.map(s => s + '×' + s).join(', ')})`)

  if (icoBuffer.length < 5000) {
    console.error('❌ ICO file suspiciously small — check logo.png source')
    process.exit(1)
  }
}

async function main() {
  if (!fs.existsSync(RESOURCES)) {
    fs.mkdirSync(RESOURCES, { recursive: true })
  }

  const logoPath = path.join(RESOURCES, 'logo.png')
  const logoStats = fs.existsSync(logoPath) ? fs.statSync(logoPath) : null

  // Regenerate logo if missing or if it's a stub (< 5KB)
  if (!logoStats || logoStats.size < 5000) {
    await generateLogoPNG()
  } else {
    console.log(`ℹ️  logo.png already exists (${(logoStats.size / 1024).toFixed(1)} KB) — skipping generation`)
  }

  await generateIco()
  console.log('\n✅ All assets generated successfully')
}

main().catch(err => {
  console.error('Asset generation failed:', err)
  process.exit(1)
})
