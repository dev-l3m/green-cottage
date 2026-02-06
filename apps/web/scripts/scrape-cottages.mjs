import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SLUG_MAP = {
  1: 'puma',
  2: 'bruyere',
  3: 'petit-pierre',
  4: 'telegaphe',
};

const BASE_URL = 'https://green-cottage.moryjinabovictorbrillant.com';
const OUTPUT_PATH = join(__dirname, '../src/content/cottages.json');

// Normalize image URL
function normalizeImageUrl(url, baseUrl) {
  if (!url) return null;
  
  // Remove query params for deduplication check, but keep them in final URL
  const cleanUrl = url.split('?')[0].toLowerCase();
  
  // Skip data URLs and invalid formats
  if (url.startsWith('data:') || url.startsWith('blob:')) return null;
  
  // Convert relative to absolute
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  if (!url.startsWith('http')) {
    return `${baseUrl}/${url}`;
  }
  
  // Check if it's an image URL
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
  const hasImageExt = imageExtensions.some(ext => cleanUrl.includes(ext));
  const hasImageParam = url.includes('image') || url.includes('photo') || url.includes('img');
  
  if (hasImageExt || hasImageParam) {
    return url;
  }
  
  return null;
}

// Extract all image URLs from page
async function extractImages(page, baseUrl) {
  const images = new Set();
  
  // Get all img src
  const imgSrcs = await page.$$eval('img', (imgs) =>
    imgs.map((img) => img.src || img.getAttribute('src') || '').filter(Boolean)
  );
  
  // Get all source srcset
  const srcsets = await page.$$eval('source[srcset]', (sources) =>
    sources.map((source) => source.srcset).filter(Boolean)
  );
  
  // Parse srcset
  for (const srcset of srcsets) {
    const urls = srcset.split(',').map((s) => s.trim().split(/\s+/)[0]);
    urls.forEach((url) => {
      const normalized = normalizeImageUrl(url, baseUrl);
      if (normalized) images.add(normalized);
    });
  }
  
  // Get background images from inline styles
  const bgImages = await page.$$eval('[style*="background-image"]', (elements) =>
    elements.map((el) => {
      const style = el.getAttribute('style') || '';
      const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      return match ? match[1] : null;
    }).filter(Boolean)
  );
  
  // Get background images from computed styles (more thorough)
  const allElements = await page.$$('*');
  for (const element of allElements) {
    try {
      const bgImage = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundImage;
        if (bg && bg !== 'none') {
          const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
          return match ? match[1] : null;
        }
        return null;
      });
      if (bgImage) {
        const normalized = normalizeImageUrl(bgImage, baseUrl);
        if (normalized) images.add(normalized);
      }
    } catch (e) {
      // Skip if element is not attached
    }
  }
  
  // Normalize all URLs
  imgSrcs.forEach((url) => {
    const normalized = normalizeImageUrl(url, baseUrl);
    if (normalized) images.add(normalized);
  });
  
  bgImages.forEach((url) => {
    const normalized = normalizeImageUrl(url, baseUrl);
    if (normalized) images.add(normalized);
  });
  
  return Array.from(images);
}

// Extract text content
async function extractContent(page) {
  // Title
  const title = await page
    .locator('h1, [class*="title"], [class*="name"]')
    .first()
    .textContent()
    .catch(() => null);
  
  // Summary/Intro - usually in first paragraph or meta description
  const summary = await page
    .locator('p:first-of-type, [class*="summary"], [class*="intro"], meta[name="description"]')
    .first()
    .textContent()
    .catch(() => {
      return page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    });
  
  // Full description - get all text content from main content area
  const description = await page
    .locator('main, [class*="content"], [class*="description"], article')
    .first()
    .textContent()
    .catch(() => null);
  
  // Try to get structured description sections
  const descriptionSections = await page
    .$$eval('p, [class*="description"]', (elements) =>
      elements
        .map((el) => el.textContent?.trim())
        .filter((text) => text && text.length > 50)
    )
    .catch(() => []);
  
  // Amenities - look for lists or specific classes
  const amenities = await page
    .$$eval(
      '[class*="amenity"], [class*="equipment"], [class*="feature"], li:has-text("WiFi"), li:has-text("Parking")',
      (elements) => elements.map((el) => el.textContent?.trim()).filter(Boolean)
    )
    .catch(() => []);
  
  // If no amenities found, try looking in lists
  if (amenities.length === 0) {
    const listItems = await page
      .$$eval('ul li, ol li', (items) =>
        items
          .map((li) => li.textContent?.trim())
          .filter((text) => text && text.length < 100)
      )
      .catch(() => []);
    amenities.push(...listItems.slice(0, 10)); // Limit to first 10
  }
  
  // Facts - look for capacity, rooms, beds, etc.
  const facts = {};
  const factText = await page.textContent().catch(() => '');
  
  // Extract capacity
  const capacityMatch = factText.match(/(\d+)\s*(personnes?|people|guests?|voyageurs?)/i);
  if (capacityMatch) {
    facts.capacity = parseInt(capacityMatch[1]);
  }
  
  // Extract rooms
  const roomsMatch = factText.match(/(\d+)\s*(chambres?|rooms?|bedrooms?)/i);
  if (roomsMatch) {
    facts.rooms = parseInt(roomsMatch[1]);
  }
  
  // Extract beds
  const bedsMatch = factText.match(/(\d+)\s*(lits?|beds?)/i);
  if (bedsMatch) {
    facts.beds = parseInt(bedsMatch[1]);
  }
  
  // Extract bathrooms
  const bathroomsMatch = factText.match(/(\d+)\s*(salles? de bain|bathrooms?|WC)/i);
  if (bathroomsMatch) {
    facts.bathrooms = parseInt(bathroomsMatch[1]);
  }
  
  return {
    title: title?.trim() || '',
    summary: summary?.trim() || descriptionSections[0] || '',
    description: description?.trim() || descriptionSections.join('\n\n') || '',
    amenities: [...new Set(amenities)], // Dedupe
    facts,
  };
}

// Scrape a single cottage page
async function scrapeCottage(browser, id) {
  const slug = SLUG_MAP[id];
  const url = `${BASE_URL}/detail-gite/${id}/fr`;
  
  console.log(`\n📦 Scraping cottage ${id} (${slug})...`);
  console.log(`   URL: ${url}`);
  
  const page = await browser.newPage();
  
  try {
    // Navigate and wait for content
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for main content to be visible
    await page.waitForSelector('body', { timeout: 10000 });
    await page.waitForTimeout(2000); // Extra wait for dynamic content
    
    // Extract content
    const content = await extractContent(page);
    const allImages = await extractImages(page, BASE_URL);
    
    // Determine hero (usually first large image or background)
    const heroImage = allImages[0] || null;
    
    // Gallery images (all others)
    const galleryImages = allImages.slice(1);
    
    const cottage = {
      id,
      slug,
      name: content.title || `Gîte ${slug}`,
      summary: content.summary,
      description: content.description,
      facts: content.facts,
      amenities: content.amenities,
      images: {
        hero: heroImage || '',
        gallery: galleryImages,
      },
      sourceUrl: url,
    };
    
    console.log(`   ✓ Title: ${cottage.name}`);
    console.log(`   ✓ Images found: ${allImages.length} (hero: 1, gallery: ${galleryImages.length})`);
    console.log(`   ✓ Amenities: ${cottage.amenities.length}`);
    
    return cottage;
  } catch (error) {
    console.error(`   ✗ Error scraping ${url}:`, error.message);
    // Return minimal structure on error
    return {
      id,
      slug,
      name: `Gîte ${slug}`,
      summary: '',
      description: '',
      facts: {},
      amenities: [],
      images: {
        hero: '',
        gallery: [],
      },
      sourceUrl: url,
    };
  } finally {
    await page.close();
  }
}

// Main function
async function main() {
  console.log('🚀 Starting cottage scraper...\n');
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    const cottages = [];
    
    for (const id of [1, 2, 3, 4]) {
      const cottage = await scrapeCottage(browser, id);
      cottages.push(cottage);
    }
    
    // Write JSON file
    const outputDir = dirname(OUTPUT_PATH);
    await writeFile(OUTPUT_PATH, JSON.stringify(cottages, null, 2), 'utf-8');
    
    console.log(`\n✅ Scraping complete!`);
    console.log(`📄 Saved to: ${OUTPUT_PATH}`);
    console.log(`📊 Total cottages: ${cottages.length}`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
