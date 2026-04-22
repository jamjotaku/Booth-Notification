import axios from 'axios';
import { BoothItem } from './types';

export async function sendDiscordNotification(webhookUrl: string, item: BoothItem) {
  const embed = {
    title: `【新着商品】${item.title}`,
    url: item.url,
    description: `ショップ: **${item.shopName}**\n価格: **${item.price}**`,
    color: 0x00aaff, // Blue-ish color
    thumbnail: {
      url: item.imageUrl
    },
    fields: [
      {
        name: '商品リンク',
        value: `[BOOTHで見る](${item.url})`
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'BOOTH New Item Notifier'
    }
  };

  try {
    await axios.post(webhookUrl, {
      embeds: [embed]
    });
    console.log(`Notification sent for item: ${item.title}`);
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}
