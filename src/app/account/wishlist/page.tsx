"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Wishlist" }]} />
      <h1 className="section-title mb-8">My Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <div className="card-surface py-16 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <h2 className="mb-2 text-lg font-semibold text-white">Your wishlist is empty</h2>
          <p className="mb-6 text-sm text-gray-400">Save items you love by clicking the heart icon on product pages.</p>
          <Link href="/products" className="btn-primary px-8 py-3">Browse Products</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => {
            const discount = calculateDiscount(product.price, product.compare_at_price);
            const imageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
            return (
              <div key={product.id} className="card-surface group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-glow">
                <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-galaxy-dark">
                  {discount > 0 && <span className="badge-discount">-{discount}%</span>}
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(product.id); }}
                    className="absolute right-2 top-2 rounded-lg bg-galaxy-black/70 p-2 text-red-400 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>
                <div className="p-4">
                  {product.brand && <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">{product.brand}</p>}
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-galaxy-gold">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-galaxy-gold">{formatPrice(product.price)}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.compare_at_price)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => addItem(product)}
                    disabled={product.stock_quantity <= 0}
                    className="btn-primary w-full py-2 text-xs disabled:opacity-50"
                  >
                    <ShoppingCart className="mr-1.5 h-4 w-4" />
                    {product.stock_quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
