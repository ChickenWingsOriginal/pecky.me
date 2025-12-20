const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');

// Image optimization config: filename -> max width (2x for retina)
// Based on actual display sizes found in the codebase
const imageConfig = {
  // Large icons - displayed at 100px (already optimized)
  // 'bot-icon.png': { width: 200, quality: 80 },      // 100x108px display
  // 'info-icon.png': { width: 200, quality: 80 },     // 100x100px display
  // 'nft-icon.png': { width: 200, quality: 80 },      // 100x100px display

  // Medium icons - displayed at 96px (already optimized)
  // 'node-icon.png': { width: 200, quality: 80 },     // 96x96px display
  // 'staking-icon.png': { width: 200, quality: 80 },  // 96x96px display
  // 'pecky-logo.png': { width: 200, quality: 80 },    // 96px max (also 32px in nav)

  // NEW: Pecky emoji images (need optimization)
  'pecky_cry.png': { width: 200, quality: 80 },     // Pecky emoji - crying
  'pecky_happy.png': { width: 200, quality: 80 },   // Pecky emoji - happy

  // Small icons - displayed at 50px (QuickLinks) (already optimized)
  // 'chickenwingsnft.png': { width: 100, quality: 80 }, // 50x50px display
  // 'discord-pecky.png': { width: 100, quality: 80 },   // 50x50px display
  // 'xchickenwings.png': { width: 100, quality: 80 },   // 50x50px display

  // Navigation icon - displayed at 28px (already optimized)
  // 'home-icon.png': { width: 80, quality: 80 },      // 28px display

  // Partner logos - varying sizes (already optimized)
  // 'crystara.png': { width: 250, quality: 80 },      // 122x36px display (largest)
  // 'meridian.png': { width: 80, quality: 80 },       // 36x36px display
  // 'dexlyn.png': { width: 80, quality: 80 },         // 34x36px display
  // 'supra-icon.png': { width: 80, quality: 80 },     // 37x36px display
  // 'ribbitwallet.png': { width: 200, quality: 80 },  // 95x36px display

  // Burning section (already optimized)
  // 'peckyburning.png': { width: 150, quality: 80 },  // 75px display
};

async function optimizeImage(filename, config) {
  const inputPath = path.join(imagesDir, filename);
  const outputPath = path.join(imagesDir, filename);

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skipping ${filename} - file not found`);
    return;
  }

  try {
    const metadata = await sharp(inputPath).metadata();
    const isJpg = filename.endsWith('.jpg') || filename.endsWith('.jpeg');

    console.log(`Processing ${filename} (${metadata.width}x${metadata.height}) -> ${config.width}px...`);

    // Read original file size
    const originalSize = fs.statSync(inputPath).size;

    // Create a backup first
    const backupPath = path.join(imagesDir, `${filename}.backup`);
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
      console.log(`  📦 Backup created: ${filename}.backup`);
    } else {
      console.log(`  📦 Backup already exists, skipping backup creation`);
    }

    // Resize and optimize
    let pipeline = sharp(inputPath)
      .resize(config.width, null, {
        fit: 'inside',
        withoutEnlargement: true
      });

    if (isJpg) {
      pipeline = pipeline.jpeg({ quality: config.quality, mozjpeg: true });
    } else {
      pipeline = pipeline.png({
        quality: config.quality,
        compressionLevel: 9,
        palette: true
      });
    }

    await pipeline.toFile(outputPath + '.tmp');

    // Replace original with optimized
    fs.renameSync(outputPath + '.tmp', outputPath);

    const newSize = fs.statSync(outputPath).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`  ✅ ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (saved ${savings}%)`);
  } catch (error) {
    console.error(`  ❌ Error processing ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');
  console.log('📦 Creating backups with .backup extension\n');

  let totalOriginal = 0;
  let totalNew = 0;

  for (const [filename, config] of Object.entries(imageConfig)) {
    const inputPath = path.join(imagesDir, filename);
    if (fs.existsSync(inputPath)) {
      totalOriginal += fs.statSync(inputPath).size;
    }
    await optimizeImage(filename, config);
    if (fs.existsSync(inputPath)) {
      totalNew += fs.statSync(inputPath).size;
    }
    console.log('');
  }

  const totalSavings = ((1 - totalNew / totalOriginal) * 100).toFixed(1);
  console.log('✨ Image optimization complete!');
  console.log(`📊 Total: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalNew / 1024 / 1024).toFixed(2)}MB (saved ${totalSavings}%)`);
  console.log('\n💡 Backups saved with .backup extension');
  console.log('💡 To restore originals: cd public/images && for f in *.backup; do mv "$f" "${f%.backup}"; done');
}

main().catch(console.error);