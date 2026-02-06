import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COTTAGES_JSON = join(__dirname, '../src/content/cottages.json');
const OUTPUT_BASE = join(__dirname, '../public/images/cottages');

// Download a single image
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = createWriteStream(outputPath);

    protocol
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          return downloadImage(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      })
      .on('error', (err) => {
        file.close();
        reject(err);
      });
  });
}

// Get file extension from URL
function getExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i);
  return match ? match[1] : 'jpg';
}

async function main() {
  console.log('📥 Starting image download...\n');

  // Read cottages JSON
  const cottagesData = JSON.parse(await readFile(COTTAGES_JSON, 'utf-8'));

  if (cottagesData.length === 0) {
    console.log('⚠️  No cottages found in JSON. Run pnpm content:scrape first.');
    return;
  }

  const updatedCottages = [];

  for (const cottage of cottagesData) {
    console.log(`\n📦 Processing: ${cottage.name} (${cottage.slug})`);

    const cottageDir = join(OUTPUT_BASE, cottage.slug);
    await mkdir(cottageDir, { recursive: true });

    const updatedImages = {
      hero: cottage.images.hero,
      gallery: [...cottage.images.gallery],
    };

    // Download hero image
    if (cottage.images.hero) {
      try {
        const ext = getExtension(cottage.images.hero);
        const filename = `hero.${ext}`;
        const outputPath = join(cottageDir, filename);

        console.log(`  ↓ Downloading hero: ${basename(cottage.images.hero)}`);
        await downloadImage(cottage.images.hero, outputPath);
        updatedImages.hero = `/images/cottages/${cottage.slug}/${filename}`;
        console.log(`  ✓ Hero saved`);
      } catch (error) {
        console.error(`  ✗ Hero download failed: ${error.message}`);
      }
    }

    // Download gallery images
    const downloadedGallery = [];
    for (let i = 0; i < cottage.images.gallery.length; i++) {
      const url = cottage.images.gallery[i];
      try {
        const ext = getExtension(url);
        const filename = `gallery-${i + 1}.${ext}`;
        const outputPath = join(cottageDir, filename);

        console.log(`  ↓ Downloading gallery ${i + 1}/${cottage.images.gallery.length}: ${basename(url)}`);
        await downloadImage(url, outputPath);
        downloadedGallery.push(`/images/cottages/${cottage.slug}/${filename}`);
        console.log(`  ✓ Gallery ${i + 1} saved`);
      } catch (error) {
        console.error(`  ✗ Gallery ${i + 1} download failed: ${error.message}`);
        // Keep original URL if download fails
        downloadedGallery.push(url);
      }
    }

    updatedImages.gallery = downloadedGallery;

    updatedCottages.push({
      ...cottage,
      images: updatedImages,
    });
  }

  // Update JSON with local paths
  await writeFile(COTTAGES_JSON, JSON.stringify(updatedCottages, null, 2), 'utf-8');

  console.log(`\n✅ Download complete!`);
  console.log(`📄 Updated: ${COTTAGES_JSON}`);
  console.log(`📁 Images saved to: ${OUTPUT_BASE}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
