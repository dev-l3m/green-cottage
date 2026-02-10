import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOGO_PATH = join(__dirname, '../public/logo_l3m.png');
const OUTPUT_DIR = join(__dirname, '../public');

const FAVICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateFavicons() {
  console.log('🎨 Generating favicons from logo...\n');

  try {
    // Generate ICO file (favicon.ico) - 32x32
    // Note: Using PNG format as .ico (browsers accept this)
    await sharp(LOGO_PATH)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(OUTPUT_DIR, 'favicon.ico'));
    console.log('✓ Generated favicon.ico (32x32)\n');

    // Generate PNG favicons
    for (const { size, name } of FAVICON_SIZES) {
      await sharp(LOGO_PATH)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(join(OUTPUT_DIR, name));

      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate site.webmanifest
    const manifest = {
      name: 'Green Cottage',
      short_name: 'Green Cottage',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: '#D4B237',
      background_color: '#000000',
      display: 'standalone',
    };

    await writeFile(
      join(OUTPUT_DIR, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
    console.log('\n✓ Generated site.webmanifest');

    console.log('\n✅ Favicon generation complete!\n');
  } catch (error) {
    console.error('Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
