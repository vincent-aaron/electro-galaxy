"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const imageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
  const discount = calculateDiscount(product.price, product.compare_at_price);

  return (
    <div className={cn("group card-surface overflow-hidden transition-all hover:-translate-y-1 hover:shadow-glow", className)}>
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-galaxy-dark">
        {discount > 0 && <span className="badge-discount">-{discount}%</span>}
        {product.is_featured && <span className="badge-featured">Featured</span>}
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      <div className="p-4">
        {product.brand && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">{product.brand}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-galaxy-gold">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.floor(product.rating) ? "fill-galaxy-gold text-galaxy-gold" : "text-gray-600"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.review_count})</span>
        </div>

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
}
