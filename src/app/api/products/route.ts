import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const featured = searchParams.get("featured") === "true" ? true : undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

  const products = await getProducts({ categorySlug: category, search, featured, limit });
  return NextResponse.json(products);
}
