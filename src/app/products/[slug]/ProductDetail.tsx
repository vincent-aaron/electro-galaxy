"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Truck, Shield, Minus, Plus, Check } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast, useToast } from "@/components/ui/Toast";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types/database";

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const { toast, showToast, hideToast } = useToast();
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const images = product.images?.length
    ? product.images
    : [{ id: "default", product_id: product.id, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", alt_text: product.name, sort_order: 0, is_primary: true }];

  const discount = calculateDiscount(product.price, product.compare_at_price);
  const inStock = product.stock_quantity > 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast(`${product.name} added to cart`);
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    showToast(added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`);
  };

  return (
    <>
      <div className="container-main py-8">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/products" },
            ...(product.category ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Images */}
          <div>
            <div className="relative mb-4 aspect-square overflow-hidden rounded-xl border border-galaxy-border bg-galaxy-card">
              {discount > 0 && <span className="badge-discount">-{discount}% OFF</span>}
              <Image
                src={images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors",
                      selectedImage === i ? "border-galaxy-gold" : "border-galaxy-border"
                    )}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-galaxy-gold">{product.brand}</p>
            )}
            <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-galaxy-gold text-galaxy-gold" : "text-gray-600")} />
                ))}
              </div>
              <span className="text-sm text-gray-400">{product.rating} ({product.review_count} reviews)</span>
            </div>

            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-galaxy-gold">{formatPrice(product.price)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg text-gray-500 line-through">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>

            {product.short_description && (
              <p className="mb-6 text-gray-400">{product.short_description}</p>
            )}

            <div className="mb-6 flex items-center gap-2">
              {inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">In Stock ({product.stock_quantity} available)</span>
                </>
              ) : (
                <span className="text-sm text-red-500">Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-300">Quantity:</span>
              <div className="flex items-center rounded-lg border border-galaxy-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-400 hover:text-white"
                  disabled={!inStock}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-2 text-gray-400 hover:text-white"
                  disabled={!inStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-8 flex flex-wrap gap-3">
              <button onClick={handleAddToCart} disabled={!inStock} className="btn-primary flex-1 py-3 sm:flex-none sm:px-10">
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </button>
              <Link href="/checkout" className="btn-secondary flex-1 py-3 sm:flex-none sm:px-10">
                Buy Now
              </Link>
              <button
                onClick={handleToggleWishlist}
                className={cn(
                  "btn-ghost border p-3",
                  isWishlisted ? "border-galaxy-gold bg-galaxy-gold/10 text-galaxy-gold" : "border-galaxy-border"
                )}
                aria-label="Add to wishlist"
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-galaxy-gold")} />
              </button>
            </div>

            {/* Trust */}
            <div className="space-y-3 border-t border-galaxy-border pt-6">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Truck className="h-5 w-5 text-galaxy-gold" />
                Free shipping on orders over ₱5,000
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Shield className="h-5 w-5 text-galaxy-gold" />
                2-year warranty included
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specs */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-white">Product Description</h2>
            <div className="card-surface p-6">
              <p className="leading-relaxed text-gray-400">{product.description}</p>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">Specifications</h2>
            <div className="card-surface divide-y divide-galaxy-border">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between px-4 py-3 text-sm">
                  <span className="capitalize text-gray-500">{key.replace(/_/g, " ")}</span>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">SKU</span>
                <span className="font-medium text-white">{product.sku}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title mb-6">You May Also Like</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Toast message={toast.message} show={toast.show} onClose={hideToast} />
    </>
  );
}
