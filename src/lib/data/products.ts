import { createClient } from "@/lib/supabase/server";
import {
  mockCategories,
  mockProducts,
  getMockProductBySlug,
  getMockProductsByCategory,
  searchMockProducts,
} from "@/lib/data/mock-data";
import type { Category, Product } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return mockCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data?.length) return mockCategories;
  return data;
}

export async function getProducts(options?: {
  featured?: boolean;
  categorySlug?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  const supabase = await createClient();

  if (!supabase) {
    let products = [...mockProducts];
    if (options?.featured) products = products.filter((p) => p.is_featured);
    if (options?.categorySlug) products = getMockProductsByCategory(options.categorySlug);
    if (options?.search) products = searchMockProducts(options.search);
    if (options?.limit) products = products.slice(0, options.limit);
    return products;
  }

  let query = supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("is_active", true);

  if (options?.featured) query = query.eq("is_featured", true);
  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,brand.ilike.%${options.search}%`);
  }
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error || !data?.length) {
    let products = [...mockProducts];
    if (options?.featured) products = products.filter((p) => p.is_featured);
    if (options?.categorySlug) products = getMockProductsByCategory(options.categorySlug);
    if (options?.search) products = searchMockProducts(options.search);
    if (options?.limit) products = products.slice(0, options.limit);
    return products;
  }
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  if (!supabase) return getMockProductBySlug(slug) ?? null;

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return getMockProductBySlug(slug) ?? null;
  return data;
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4): Promise<Product[]> {
  const products = await getProducts({ limit: 20 });
  return products
    .filter((p) => p.id !== productId && p.category_id === categoryId)
    .slice(0, limit);
}
