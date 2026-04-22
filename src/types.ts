export interface ShopConfig {
  id: string;
  name: string;
}

export interface BoothItem {
  id: string;
  title: string;
  price: string;
  url: string;
  imageUrl: string;
  shopName: string;
}

export interface CacheData {
  lastItemIds: { [shopId: string]: string[] };
}
