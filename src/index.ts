import * as fs from 'fs';
import * as path from 'path';
import { fetchNewItems } from './booth';
import { sendDiscordNotification } from './discord';
import { ShopConfig, CacheData, BoothItem } from './types';

const SHOPS_CONFIG_PATH = path.join(__dirname, '../config/shops.json');
const CACHE_FILE_PATH = path.join(__dirname, '../data/cache.json');
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function main() {
  if (!DISCORD_WEBHOOK_URL) {
    console.error('Error: DISCORD_WEBHOOK_URL environment variable is not set.');
    process.exit(1);
  }

  // Load config
  if (!fs.existsSync(SHOPS_CONFIG_PATH)) {
    console.error('Error: config/shops.json not found.');
    process.exit(1);
  }
  const shops: ShopConfig[] = JSON.parse(fs.readFileSync(SHOPS_CONFIG_PATH, 'utf-8'));

  // Load cache
  let cache: CacheData = { lastItemIds: {} };
  if (fs.existsSync(CACHE_FILE_PATH)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf-8'));
  }

  for (const shop of shops) {
    console.log(`Checking shop: ${shop.name} (${shop.id})...`);
    const items = await fetchNewItems(shop.id, shop.name);
    
    if (items.length === 0) {
      console.log(`No items found for ${shop.id}. Skipping.`);
      continue;
    }

    const lastSeenIds = cache.lastItemIds[shop.id] || [];
    const isFirstRun = lastSeenIds.length === 0;

    // Filter items that are NOT in the cache
    const newItems = items.filter(item => !lastSeenIds.includes(item.id));

    if (newItems.length > 0) {
      if (isFirstRun) {
        console.log(`First run for ${shop.id}. Initializing cache with ${items.length} items without notification.`);
      } else {
        console.log(`Found ${newItems.length} new items for ${shop.id}!`);
        // Notify for each new item (newest first)
        // Note: fetchNewItems returns newest first, so we might want to reverse to notify in chronological order
        for (const item of [...newItems].reverse()) {
          await sendDiscordNotification(DISCORD_WEBHOOK_URL, item);
          // Wait a bit to avoid hitting Discord rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      console.log(`No new items for ${shop.id}.`);
    }

    // Update cache with CURRENT items (all of them, or at least the ones we retrieved)
    // We store all IDs from the first page to ensure we track them.
    cache.lastItemIds[shop.id] = items.map(i => i.id);
  }

  // Save cache
  // Ensure directory exists
  const cacheDir = path.dirname(CACHE_FILE_PATH);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));
  console.log('Cache updated and saved.');
}

main().catch(err => {
  console.error('Unhandled error in main:', err);
  process.exit(1);
});
