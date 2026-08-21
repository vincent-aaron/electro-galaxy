"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-main py-16 text-center">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <div className="mx-auto max-w-md py-12">
          <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-gray-600" />
          <h1 className="mb-2 text-2xl font-bold text-white">Your cart is empty</h1>
          <p className="mb-8 text-gray-400">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products" className="btn-primary px-8 py-3">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="section-title mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const imageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200";
            return (
              <div key={product.id} className="card-surface flex gap-4 p-4 sm:gap-6 sm:p-6">
                <Link href={`/products/${product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
                  <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="112px" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                      <Link href={`/products/${product.slug}`} className="font-semibold text-white hover:text-galaxy-gold">
                        {product.name}
                      </Link>
                    </div>
                    <button onClick={() => removeItem(product.id)} className="text-gray-500 hover:text-red-500" aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-lg font-bold text-galaxy-gold">{formatPrice(product.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-lg border border-galaxy-border">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2.5 py-1.5 text-gray-400 hover:text-white">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2.5 py-1.5 text-gray-400 hover:text-white">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-semibold text-white">{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-500">Clear cart</button>
        </div>

        {/* Order summary */}
        <div>
          <div className="card-surface sticky top-28 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              {subtotal < 5000 && (
                <p className="text-xs text-galaxy-gold">
                  Add {formatPrice(5000 - subtotal)} more for free shipping!
                </p>
              )}
              <hr className="border-galaxy-border" />
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total</span>
                <span className="text-galaxy-gold">{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary mt-6 w-full py-3">
              Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/products" className="btn-ghost mt-3 w-full text-center text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
