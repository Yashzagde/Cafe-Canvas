/**
 * Download Google Fonts files for offline bundling.
 * Run: node scripts/download-fonts.js
 * 
 * Saves to: src/styles/fonts/cormorant/ and src/styles/fonts/nunito/
 */
const https = require('https')
const fs = require('fs')
const path = require('path')

const FONTS_DIR = path.join(__dirname, '..', 'src', 'styles', 'fonts')

const fonts = [
  // Cormorant Garamond (v21)
  {
    dir: 'cormorant',
    file: 'CormorantGaramond-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86GnM.ttf'
  },
  {
    dir: 'cormorant',
    file: 'CormorantGaramond-Medium.ttf',
    url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_s06GnM.ttf'
  },
  {
    dir: 'cormorant',
    file: 'CormorantGaramond-SemiBold.ttf',
    url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_iE9GnM.ttf'
  },
  {
    dir: 'cormorant',
    file: 'CormorantGaramond-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_hg9GnM.ttf'
  },
  {
    dir: 'cormorant',
    file: 'CormorantGaramond-Italic.ttf',
    url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jDOjw.ttf'
  },
  // Nunito (v32)
  {
    dir: 'nunito',
    file: 'Nunito-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshRTM.ttf'
  },
  {
    dir: 'nunito',
    file: 'Nunito-Medium.ttf',
    url: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDIkhRTM.ttf'
  },
  {
    dir: 'nunito',
    file: 'Nunito-SemiBold.ttf',
    url: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDGUmRTM.ttf'
  },
  {
    dir: 'nunito',
    file: 'Nunito-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmRTM.ttf'
  },
  {
    dir: 'nunito',
    file: 'Nunito-ExtraBold.ttf',
    url: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDDsmRTM.ttf'
  }
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', err => {
      file.close()
      if (fs.existsSync(dest)) fs.unlinkSync(dest)
      reject(err)
    })
  })
}

async function main() {
  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const font of fonts) {
    const dir = path.join(FONTS_DIR, font.dir)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const dest = path.join(dir, font.file)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`ℹ️  ${font.file} already exists — skipping`)
      skipped++
      continue
    }

    console.log(`⬇️  Downloading ${font.file}...`)
    try {
      await download(font.url, dest)
      const sizeKB = (fs.statSync(dest).size / 1024).toFixed(1)
      console.log(`   ✅ ${font.file} (${sizeKB} KB)`)
      downloaded++
    } catch (err) {
      console.error(`   ❌ Failed to download ${font.file}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅ Done: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`)
  if (failed > 0) {
    console.log('⚠️  Some fonts failed to download. The CDN fallback in fonts.css will still work online.')
  }
}

main().catch(err => {
  console.error('Font download failed:', err)
  process.exit(1)
})
