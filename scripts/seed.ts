/* eslint-disable no-console */
/**
 * Electro Galaxy — Database Seed Script
 *
 * Seeds the Supabase database with categories, products, and product images.
 *
 * Usage:
 *   npm run db:seed
 *
 * Requires the following environment variables:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY  (service role key for full access; falls back to anon key)
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your environment."
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
}

interface SeedProduct {
  category_slug: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number;
  sku: string;
  stock_quantity: number;
  brand: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  specs: Record<string, string>;
  image_url: string;
}

const categories: SeedCategory[] = [
  {
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    description: "Refrigerators, ovens, microwaves and more",
    image_url: "https://images.unsplash.com/photo-1556911223-e4b914bebe30?w=600",
    sort_order: 1,
  },
  {
    name: "Office Appliances",
    slug: "office-appliances",
    description: "Printers, monitors, and office equipment",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
    sort_order: 2,
  },
  {
    name: "Smart Appliances",
    slug: "smart-appliances",
    description: "Smart home devices and IoT gadgets",
    image_url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600",
    sort_order: 3,
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    description: "TVs, speakers, and gaming consoles",
    image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600",
    sort_order: 4,
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    description: "Grooming and wellness devices",
    image_url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600",
    sort_order: 5,
  },
];

const products: SeedProduct[] = [
  {
    category_slug: "kitchen-appliances",
    name: "Samsung Smart Refrigerator 500L",
    slug: "samsung-smart-refrigerator-500l",
    description:
      "Energy-efficient smart refrigerator with Wi-Fi connectivity, touch display, and flexible storage zones. Perfect for modern kitchens.",
    short_description: "Smart fridge with Wi-Fi & touch display",
    price: 45999,
    compare_at_price: 52999,
    sku: "EG-KIT-001",
    stock_quantity: 25,
    brand: "Samsung",
    rating: 4.7,
    review_count: 128,
    is_featured: true,
    specs: { capacity: "500L", energy_rating: "A++", warranty: "2 years" },
    image_url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600",
  },
  {
    category_slug: "kitchen-appliances",
    name: "LG Microwave Oven 32L",
    slug: "lg-microwave-oven-32l",
    description:
      "Compact yet powerful microwave with smart inverter technology and easy-clean interior.",
    short_description: "Smart inverter microwave oven",
    price: 8999,
    compare_at_price: 10999,
    sku: "EG-KIT-002",
    stock_quantity: 40,
    brand: "LG",
    rating: 4.5,
    review_count: 89,
    is_featured: true,
    specs: { capacity: "32L", power: "1000W", warranty: "1 year" },
    image_url: "https://images.unsplash.com/photo-1585659722983-1b030096d9c1?w=600",
  },
  {
    category_slug: "office-appliances",
    name: "HP LaserJet Pro M404dn",
    slug: "hp-laserjet-pro-m404dn",
    description:
      "Fast, reliable laser printer for small offices. Automatic duplex printing and network connectivity.",
    short_description: "Fast duplex laser printer",
    price: 12499,
    compare_at_price: 14999,
    sku: "EG-OFF-001",
    stock_quantity: 30,
    brand: "HP",
    rating: 4.6,
    review_count: 56,
    is_featured: true,
    specs: { speed: "38 ppm", connectivity: "Ethernet, USB", warranty: "1 year" },
    image_url: "https://images.unsplash.com/photo-1612815154858-60aa3386f798?w=600",
  },
  {
    category_slug: "office-appliances",
    name: 'Dell UltraSharp 27" Monitor',
    slug: "dell-ultrasharp-27-monitor",
    description:
      "QHD IPS monitor with 99% sRGB color accuracy. Ideal for designers and professionals.",
    short_description: '27" QHD IPS monitor',
    price: 18999,
    compare_at_price: 21999,
    sku: "EG-OFF-002",
    stock_quantity: 20,
    brand: "Dell",
    rating: 4.8,
    review_count: 203,
    is_featured: true,
    specs: { resolution: "2560x1440", panel: "IPS", warranty: "3 years" },
    image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
  },
  {
    category_slug: "smart-appliances",
    name: "Google Nest Hub Max",
    slug: "google-nest-hub-max",
    description:
      "Smart display with Google Assistant, video calling, and home control hub.",
    short_description: "Smart display with Assistant",
    price: 12999,
    compare_at_price: 15999,
    sku: "EG-SMT-001",
    stock_quantity: 35,
    brand: "Google",
    rating: 4.4,
    review_count: 167,
    is_featured: true,
    specs: { display: '10" HD', camera: "6.5MP", warranty: "1 year" },
    image_url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600",
  },
  {
    category_slug: "smart-appliances",
    name: "Xiaomi Robot Vacuum S10",
    slug: "xiaomi-robot-vacuum-s10",
    description:
      "Intelligent robot vacuum with LiDAR navigation, mopping, and app control.",
    short_description: "LiDAR robot vacuum & mop",
    price: 15999,
    compare_at_price: 18999,
    sku: "EG-SMT-002",
    stock_quantity: 15,
    brand: "Xiaomi",
    rating: 4.6,
    review_count: 94,
    is_featured: true,
    specs: { battery: "5200mAh", suction: "4000Pa", warranty: "1 year" },
    image_url: "https://images.unsplash.com/photo-1558317374-0f875c829c8a?w=600",
  },
  {
    category_slug: "entertainment",
    name: 'Sony Bravia 55" 4K Smart TV',
    slug: "sony-bravia-55-4k-smart-tv",
    description:
      "Stunning 4K HDR display with Google TV built-in. Dolby Vision and Atmos support.",
    short_description: '55" 4K HDR Google TV',
    price: 34999,
    compare_at_price: 42999,
    sku: "EG-ENT-001",
    stock_quantity: 18,
    brand: "Sony",
    rating: 4.7,
    review_count: 312,
    is_featured: true,
    specs: { size: '55"', resolution: "4K", warranty: "2 years" },
    image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600",
  },
  {
    category_slug: "entertainment",
    name: "JBL Flip 6 Bluetooth Speaker",
    slug: "jbl-flip-6-bluetooth-speaker",
    description:
      "Portable waterproof speaker with powerful bass and 12-hour battery life.",
    short_description: "Waterproof portable speaker",
    price: 5999,
    compare_at_price: 7499,
    sku: "EG-ENT-002",
    stock_quantity: 50,
    brand: "JBL",
    rating: 4.5,
    review_count: 445,
    is_featured: false,
    specs: { battery: "12 hours", waterproof: "IP67", warranty: "1 year" },
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
  },
  {
    category_slug: "personal-care",
    name: "Philips Sonicare DiamondClean",
    slug: "philips-sonicare-diamondclean",
    description:
      "Premium electric toothbrush with 5 brushing modes and UV sanitizer.",
    short_description: "Premium sonic toothbrush",
    price: 7999,
    compare_at_price: 9999,
    sku: "EG-PER-001",
    stock_quantity: 45,
    brand: "Philips",
    rating: 4.6,
    review_count: 178,
    is_featured: false,
    specs: { modes: "5", battery: "3 weeks", warranty: "2 years" },
    image_url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600",
  },
  {
    category_slug: "personal-care",
    name: "Dyson Supersonic Hair Dryer",
    slug: "dyson-supersonic-hair-dryer",
    description:
      "Intelligent heat control prevents extreme heat damage. Fast drying with balanced airflow.",
    short_description: "Intelligent heat control dryer",
    price: 24999,
    compare_at_price: 28999,
    sku: "EG-PER-002",
    stock_quantity: 12,
    brand: "Dyson",
    rating: 4.8,
    review_count: 267,
    is_featured: true,
    specs: { speed_settings: "4", heat_settings: "3", warranty: "2 years" },
    image_url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600",
  },
  {
    category_slug: "kitchen-appliances",
    name: "Instant Pot Duo 7-in-1",
    slug: "instant-pot-duo-7in1",
    description:
      "Multi-use programmable pressure cooker, slow cooker, rice cooker, and more.",
    short_description: "7-in-1 pressure cooker",
    price: 6499,
    compare_at_price: 7999,
    sku: "EG-KIT-003",
    stock_quantity: 60,
    brand: "Instant Pot",
    rating: 4.7,
    review_count: 892,
    is_featured: true,
    specs: { capacity: "6Qt", functions: "7", warranty: "1 year" },
    image_url: "https://images.unsplash.com/photo-1585515326630-5931f3f0a2a5?w=600",
  },
  {
    category_slug: "smart-appliances",
    name: "Amazon Echo Dot 5th Gen",
    slug: "amazon-echo-dot-5th-gen",
    description:
      "Compact smart speaker with Alexa. Improved audio and temperature sensor.",
    short_description: "Smart speaker with Alexa",
    price: 3499,
    compare_at_price: 4499,
    sku: "EG-SMT-003",
    stock_quantity: 80,
    brand: "Amazon",
    rating: 4.3,
    review_count: 1205,
    is_featured: false,
    specs: { speaker: '1.73"', sensor: "Temperature", warranty: "1 year" },
    image_url: "https://images.unsplash.com/photo-1543512214-318801244a66?w=600",
  },
];

async function seedCategories(): Promise<Record<string, string>> {
  console.log("Seeding categories...");
  const slugToId: Record<string, string> = {};

  for (const cat of categories) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", cat.slug)
      .maybeSingle();

    if (existing) {
      await supabase.from("categories").update(cat).eq("id", existing.id);
      slugToId[cat.slug] = existing.id;
      console.log(`  Updated category: ${cat.slug}`);
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert(cat)
        .select("id")
        .single();
      if (error) {
        console.error(`  Failed to insert category ${cat.slug}:`, error.message);
        continue;
      }
      slugToId[cat.slug] = data.id;
      console.log(`  Inserted category: ${cat.slug}`);
    }
  }

  return slugToId;
}

async function seedProducts(slugToId: Record<string, string>) {
  console.log("Seeding products...");

  for (const prod of products) {
    const categoryId = slugToId[prod.category_slug];
    if (!categoryId) {
      console.warn(`  Skipping ${prod.slug}: category not found`);
      continue;
    }

    const { image_url, category_slug: _cs, ...productRow } = prod;
    void _cs;

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", prod.slug)
      .maybeSingle();

    let productId: string;

    if (existing) {
      await supabase
        .from("products")
        .update({ ...productRow, category_id: categoryId })
        .eq("id", existing.id);
      productId = existing.id;
      console.log(`  Updated product: ${prod.slug}`);
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({ ...productRow, category_id: categoryId })
        .select("id")
        .single();
      if (error) {
        console.error(`  Failed to insert product ${prod.slug}:`, error.message);
        continue;
      }
      productId = data.id;
      console.log(`  Inserted product: ${prod.slug}`);
    }

    const { data: imgExisting } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .eq("is_primary", true)
      .maybeSingle();

    if (imgExisting) {
      await supabase
        .from("product_images")
        .update({ url: image_url, alt_text: prod.name })
        .eq("id", imgExisting.id);
    } else {
      await supabase.from("product_images").insert({
        product_id: productId,
        url: image_url,
        alt_text: prod.name,
        sort_order: 0,
        is_primary: true,
      });
    }
  }
}

async function main() {
  console.log("Starting Electro Galaxy database seed...\n");

  const slugToId = await seedCategories();
  await seedProducts(slugToId);

  console.log("\nSeed completed successfully.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
