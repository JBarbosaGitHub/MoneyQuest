// Convert images in public/assets/media to avif/webp using sharp
// Usage: node scripts/convert-images.js

const fs = require('fs')
const path = require('path')

let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('Missing dependency: sharp. Install it with: npm i -D sharp')
  process.exit(1)
}

const ROOT = path.resolve(__dirname, '..')
const INPUT_DIR = path.join(ROOT, 'public', 'assets', 'media')
const exts = new Set(['.png', '.jpg', '.jpeg'])

async function walk(dir){
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const entry of entries){
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
    } else if (exts.has(path.extname(entry.name).toLowerCase())) {
      await convert(full)
    }
  }
}

async function convert(file){
  const basename = path.basename(file)
  const dirname = path.dirname(file)
  const name = basename.replace(path.extname(basename), '')
  const avifOut = path.join(dirname, `${name}.avif`)
  const webpOut = path.join(dirname, `${name}.webp`)

  try {
    const img = sharp(file)
    // Only create if missing to keep idempotency
    if (!fs.existsSync(avifOut)) {
      await img.avif({ quality: 60 }).toFile(avifOut)
      console.log('AVIF:', path.relative(INPUT_DIR, avifOut))
    }
    if (!fs.existsSync(webpOut)) {
      await img.webp({ quality: 75 }).toFile(webpOut)
      console.log('WEBP:', path.relative(INPUT_DIR, webpOut))
    }
  } catch (err) {
    console.warn('Failed to convert', file, err.message)
  }
}

async function main(){
  console.log('Converting images in', INPUT_DIR)
  await walk(INPUT_DIR)
  console.log('Done')
}

main().catch(err => { console.error(err); process.exit(1) })
