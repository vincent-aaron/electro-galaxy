import type { Category, Product, ProductImage } from "@/types/database";

const categories: Category[] = [
  { id: "cat-1", name: "Kitchen Appliances", slug: "kitchen-appliances", description: "Refrigerators, ovens, microwaves and more", image_url: "https://images.unsplash.com/photo-1556911223-e4b914bebe30?w=600", parent_id: null, sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: "cat-2", name: "Office Appliances", slug: "office-appliances", description: "Printers, monitors, and office equipment", image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600", parent_id: null, sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: "cat-3", name: "Smart Appliances", slug: "smart-appliances", description: "Smart home devices and IoT gadgets", image_url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600", parent_id: null, sort_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: "cat-4", name: "Entertainment", slug: "entertainment", description: "TVs, speakers, and gaming consoles", image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600", parent_id: null, sort_order: 4, is_active: true, created_at: new Date().toISOString() },
  { id: "cat-5", name: "Personal Care", slug: "personal-care", description: "Grooming and wellness devices", image_url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600", parent_id: null, sort_order: 5, is_active: true, created_at: new Date().toISOString() },
];

const productData: Omit<Product, "category" | "images">[] = [
  { id: "prod-1", category_id: "cat-1", name: "Samsung Smart Refrigerator 500L", slug: "samsung-smart-refrigerator-500l", description: "Energy-efficient smart refrigerator with Wi-Fi connectivity, touch display, and flexible storage zones.", short_description: "Smart fridge with Wi-Fi & touch display", price: 45999, compare_at_price: 52999, sku: "EG-KIT-001", stock_quantity: 25, brand: "Samsung", rating: 4.7, review_count: 128, is_featured: true, is_active: true, specs: { capacity: "500L", energy_rating: "A++", warranty: "2 years" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-2", category_id: "cat-1", name: "LG Microwave Oven 32L", slug: "lg-microwave-oven-32l", description: "Compact yet powerful microwave with smart inverter technology.", short_description: "Smart inverter microwave oven", price: 8999, compare_at_price: 10999, sku: "EG-KIT-002", stock_quantity: 40, brand: "LG", rating: 4.5, review_count: 89, is_featured: true, is_active: true, specs: { capacity: "32L", power: "1000W" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-3", category_id: "cat-2", name: "HP LaserJet Pro M404dn", slug: "hp-laserjet-pro-m404dn", description: "Fast, reliable laser printer for small offices.", short_description: "Fast duplex laser printer", price: 12499, compare_at_price: 14999, sku: "EG-OFF-001", stock_quantity: 30, brand: "HP", rating: 4.6, review_count: 56, is_featured: true, is_active: true, specs: { speed: "38 ppm" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-4", category_id: "cat-2", name: 'Dell UltraSharp 27" Monitor', slug: "dell-ultrasharp-27-monitor", description: "QHD IPS monitor with 99% sRGB color accuracy.", short_description: '27" QHD IPS monitor', price: 18999, compare_at_price: 21999, sku: "EG-OFF-002", stock_quantity: 20, brand: "Dell", rating: 4.8, review_count: 203, is_featured: true, is_active: true, specs: { resolution: "2560x1440" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-5", category_id: "cat-3", name: "Google Nest Hub Max", slug: "google-nest-hub-max", description: "Smart display with Google Assistant and video calling.", short_description: "Smart display with Assistant", price: 12999, compare_at_price: 15999, sku: "EG-SMT-001", stock_quantity: 35, brand: "Google", rating: 4.4, review_count: 167, is_featured: true, is_active: true, specs: { display: '10" HD' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-6", category_id: "cat-3", name: "Xiaomi Robot Vacuum S10", slug: "xiaomi-robot-vacuum-s10", description: "Intelligent robot vacuum with LiDAR navigation.", short_description: "LiDAR robot vacuum & mop", price: 15999, compare_at_price: 18999, sku: "EG-SMT-002", stock_quantity: 15, brand: "Xiaomi", rating: 4.6, review_count: 94, is_featured: true, is_active: true, specs: { battery: "5200mAh" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-7", category_id: "cat-4", name: 'Sony Bravia 55" 4K Smart TV', slug: "sony-bravia-55-4k-smart-tv", description: "Stunning 4K HDR display with Google TV built-in.", short_description: '55" 4K HDR Google TV', price: 34999, compare_at_price: 42999, sku: "EG-ENT-001", stock_quantity: 18, brand: "Sony", rating: 4.7, review_count: 312, is_featured: true, is_active: true, specs: { size: '55"' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-8", category_id: "cat-4", name: "JBL Flip 6 Bluetooth Speaker", slug: "jbl-flip-6-bluetooth-speaker", description: "Portable waterproof speaker with powerful bass.", short_description: "Waterproof portable speaker", price: 5999, compare_at_price: 7499, sku: "EG-ENT-002", stock_quantity: 50, brand: "JBL", rating: 4.5, review_count: 445, is_featured: false, is_active: true, specs: { battery: "12 hours" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-9", category_id: "cat-5", name: "Philips Sonicare DiamondClean", slug: "philips-sonicare-diamondclean", description: "Premium electric toothbrush with 5 brushing modes.", short_description: "Premium sonic toothbrush", price: 7999, compare_at_price: 9999, sku: "EG-PER-001", stock_quantity: 45, brand: "Philips", rating: 4.6, review_count: 178, is_featured: false, is_active: true, specs: { modes: "5" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-10", category_id: "cat-5", name: "Dyson Supersonic Hair Dryer", slug: "dyson-supersonic-hair-dryer", description: "Intelligent heat control prevents extreme heat damage.", short_description: "Intelligent heat control dryer", price: 24999, compare_at_price: 28999, sku: "EG-PER-002", stock_quantity: 12, brand: "Dyson", rating: 4.8, review_count: 267, is_featured: true, is_active: true, specs: { speed_settings: "4" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-11", category_id: "cat-1", name: "Instant Pot Duo 7-in-1", slug: "instant-pot-duo-7in1", description: "Multi-use programmable pressure cooker.", short_description: "7-in-1 pressure cooker", price: 6499, compare_at_price: 7999, sku: "EG-KIT-003", stock_quantity: 60, brand: "Instant Pot", rating: 4.7, review_count: 892, is_featured: true, is_active: true, specs: { capacity: "6Qt" }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "prod-12", category_id: "cat-3", name: "Amazon Echo Dot 5th Gen", slug: "amazon-echo-dot-5th-gen", description: "Compact smart speaker with Alexa.", short_description: "Smart speaker with Alexa", price: 3499, compare_at_price: 4499, sku: "EG-SMT-003", stock_quantity: 80, brand: "Amazon", rating: 4.3, review_count: 1205, is_featured: false, is_active: true, specs: { speaker: '1.73"' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const imageMap: Record<string, string> = {
  "prod-1": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600",
  "prod-2": "https://images.unsplash.com/photo-1585659722983-1b030096d9c1?w=600",
  "prod-3": "https://images.unsplash.com/photo-1612815154858-60aa3386f798?w=600",
  "prod-4": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
  "prod-5": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600",
  "prod-6": "https://images.unsplash.com/photo-1558317374-0f875c829c8a?w=600",
  "prod-7": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600",
  "prod-8": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
  "prod-9": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600",
  "prod-10": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600",
  "prod-11": "https://images.unsplash.com/photo-1585515326630-5931f3f0a2a5?w=600",
  "prod-12": "https://images.unsplash.com/photo-1543512214-318801244a66?w=600",
};

function enrichProduct(p: Omit<Product, "category" | "images">): Product {
  const category = categories.find((c) => c.id === p.category_id);
  const images: ProductImage[] = [{
    id: `img-${p.id}`,
    product_id: p.id,
    url: imageMap[p.id] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    alt_text: p.name,
    sort_order: 0,
    is_primary: true,
  }];
  return { ...p, category, images };
}

export const mockCategories = categories;
export const mockProducts: Product[] = productData.map(enrichProduct);

export function getMockProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getMockProductsByCategory(slug: string): Product[] {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  return mockProducts.filter((p) => p.category_id === cat.id);
}

export function searchMockProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.short_description?.toLowerCase().includes(q)
  );
}
