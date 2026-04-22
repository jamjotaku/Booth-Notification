import axios from 'axios';
import * as cheerio from 'cheerio';
import { BoothItem } from './types';

export async function fetchNewItems(shopId: string, shopDisplayName: string): Promise<BoothItem[]> {
  const url = `https://${shopId}.booth.pm/items?sort=new`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const items: BoothItem[] = [];

    $('.item-card').each((_, element) => {
      const $el = $(element);
      const titleAnchor = $el.find('.item-card__title-anchor--multiline, .item-card__title-anchor');
      const title = titleAnchor.text().trim();
      const itemUrl = titleAnchor.attr('href') || '';
      const price = $el.find('.price').text().trim();
      const imageUrl = $el.find('.item-card__thumbnail-image').attr('src') || $el.find('.item-card__thumbnail-image img').attr('src') || '';
      
      // Extract ID from URL: https://xxx.booth.pm/items/12345
      const idMatch = itemUrl.match(/\/items\/(\d+)/);
      const id = idMatch ? idMatch[1] : '';

      if (id && title) {
        items.push({
          id,
          title,
          price,
          url: itemUrl,
          imageUrl,
          shopName: shopDisplayName
        });
      }
    });

    return items;
  } catch (error) {
    console.error(`Error fetching items from ${shopId}:`, error);
    return [];
  }
}
