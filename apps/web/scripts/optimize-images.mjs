import sharp from 'sharp';
import { readdir, mkdir, writeFile, access } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { constants } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIR = join(__dirname, '../public/photos-cottage');
const OUTPUT_BASE = join(__dirname, '../public/images/optimized');

const OUTPUT_DIRS = {
  hero: join(OUTPUT_BASE, 'hero'),
  gallery: join(OUTPUT_BASE, 'gallery'),
  cards: join(OUTPUT_BASE, 'cards'),
  thumbs: join(OUTPUT_BASE, 'thumbs'),
  branding: join(OUTPUT_BASE, 'branding'),
};

const MAX_WIDTHS = {
  hero: 1920,
  gallery: 1600,
  cards: 1200,
  thumbs: 600,
  branding: 400,
};

// Convert filename to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .toLowerCase();
}

// Process a single image
async function processImage(inputPath, outputDir, maxWidth, category) {
  const filename = basename(inputPath, extname(inputPath));
  const safeName = toKebabCase(filename);
  const outputPath = join(outputDir, `${safeName}.webp`);

  try {
    await sharp(inputPath)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 75 })
      .toFile(outputPath);

    return {
      original: basename(inputPath),
      optimized: `${safeName}.webp`,
      path: outputPath.replace(join(__dirname, '../public'), ''),
      category,
      width: maxWidth,
    };
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return null;
  }
}

// Main function
async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  // Create output directories
  for (const dir of Object.values(OUTPUT_DIRS)) {
    await mkdir(dir, { recursive: true });
  }

  // Read source directory
  const sourceFiles = await readdir(SOURCE_DIR);
  const imageFiles = sourceFiles.filter(
    (f) => /\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith('.')
  );
  
  // Check if logo exists
  const logoPath = join(__dirname, '../public/logo_l3m.png');
  let logoExists = false;
  try {
    await access(logoPath, constants.F_OK);
    logoExists = true;
  } catch {
    // Logo doesn't exist, skip it
  }

  console.log(`Found ${imageFiles.length} images to process${logoExists ? ' (+ logo)' : ''}\n`);

  const manifest = {
    generated: new Date().toISOString(),
    images: {},
  };

  // Process each image from photos-cottage
  for (const file of imageFiles) {
    const inputPath = join(SOURCE_DIR, file);
    const filename = basename(file, extname(file));

    console.log(`Processing: ${file}`);

    // Determine category based on filename
    let category = 'cards';
    if (file.toLowerCase().includes('bandeau') || file.toLowerCase().includes('accueil')) {
      category = 'hero';
    } else if (file.toLowerCase().includes('landscape') || file.toLowerCase().includes('forest') || file.toLowerCase().includes('cropped')) {
      category = 'gallery';
    }

    // Process for different sizes
    const results = [];

    // Hero images: only hero size
    if (category === 'hero') {
      const result = await processImage(inputPath, OUTPUT_DIRS.hero, MAX_WIDTHS.hero, 'hero');
      if (result) results.push(result);
    }
    // Other images: all sizes (gallery, cards, thumbs)
    else {
      // Gallery size
      const galleryResult = await processImage(
        inputPath,
        OUTPUT_DIRS.gallery,
        MAX_WIDTHS.gallery,
        'gallery'
      );
      if (galleryResult) results.push(galleryResult);

      // Card size
      const cardResult = await processImage(
        inputPath,
        OUTPUT_DIRS.cards,
        MAX_WIDTHS.cards,
        'cards'
      );
      if (cardResult) results.push(cardResult);

      // Thumb size
      const thumbResult = await processImage(
        inputPath,
        OUTPUT_DIRS.thumbs,
        MAX_WIDTHS.thumbs,
        'thumbs'
      );
      if (thumbResult) results.push(thumbResult);
    }

    if (results.length > 0) {
      manifest.images[filename] = results;
      console.log(`  ✓ Generated ${results.length} optimized version(s)\n`);
    }
  }

  // Process logo separately if it exists
  if (logoExists) {
    console.log('Processing: logo_l3m.png');
    const logoResult = await processImage(
      logoPath,
      OUTPUT_DIRS.branding,
      MAX_WIDTHS.branding,
      'branding'
    );
    if (logoResult) {
      manifest.images['logo_l3m'] = [logoResult];
      console.log(`  ✓ Generated optimized version\n`);
    }
  }

  // Save manifest
  const manifestPath = join(OUTPUT_BASE, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\n✅ Optimization complete!`);
  console.log(`📄 Manifest saved to: ${manifestPath}`);
  console.log(`📊 Processed ${Object.keys(manifest.images).length} images\n`);
}

// Run
optimizeImages().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
