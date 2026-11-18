import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.slice(0, 100) || undefined;
  const search = searchParams.get("search")?.slice(0, 100) || undefined;
  const featured = searchParams.get("featured") === "true" ? true : undefined;
  const requested = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isInteger(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : MAX_LIMIT;

  const products = await getProducts({ categorySlug: category, search, featured, limit });
  return NextResponse.json(products);
}
