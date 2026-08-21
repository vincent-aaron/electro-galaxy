"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/database";

interface ProductListingProps {
  categories: Category[];
}

export function ProductListing({ categories }: ProductListingProps) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const featured = searchParams.get("featured") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (search) params.set("search", search);
    if (featured) params.set("featured", "true");

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categorySlug, search, featured]);

  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating": return b.rating - a.rating;
      case "name": return a.name.localeCompare(b.name);
      default: return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  });

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="flex gap-8">
      {/* Sidebar filters — desktop */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="card-surface sticky top-28 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Categories</h3>
          <ul className="space-y-1">
            <li>
              <a
                href="/products"
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  !categorySlug ? "bg-galaxy-gold/10 text-galaxy-gold" : "text-gray-400 hover:text-galaxy-gold"
                )}
              >
                All Products
              </a>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <a
                  href={`/products?category=${cat.slug}`}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    categorySlug === cat.slug ? "bg-galaxy-gold/10 text-galaxy-gold" : "text-gray-400 hover:text-galaxy-gold"
                  )}
                >
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            {activeCategory && (
              <h2 className="text-lg font-semibold text-white">{activeCategory.name}</h2>
            )}
            {search && (
              <p className="text-sm text-gray-400">
                Results for &ldquo;{search}&rdquo; — {sorted.length} products
              </p>
            )}
            {!activeCategory && !search && (
              <p className="text-sm text-gray-400">{sorted.length} products</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary py-2 text-xs lg:hidden"
            >
              <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto py-2 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Mobile filters */}
        {showFilters && (
          <div className="mb-6 card-surface p-4 lg:hidden">
            <h3 className="mb-3 text-sm font-semibold text-white">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <a href="/products" className={cn("rounded-full px-3 py-1 text-xs", !categorySlug ? "bg-galaxy-gold text-galaxy-black" : "bg-galaxy-dark text-gray-400")}>
                All
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={cn("rounded-full px-3 py-1 text-xs", categorySlug === cat.slug ? "bg-galaxy-gold text-galaxy-black" : "bg-galaxy-dark text-gray-400")}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-surface h-80 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="card-surface py-16 text-center">
            <p className="text-lg font-semibold text-white">No products found</p>
            <p className="mt-2 text-sm text-gray-400">Try adjusting your filters or search terms</p>
            <a href="/products" className="btn-primary mt-6 inline-flex">Browse All Products</a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
