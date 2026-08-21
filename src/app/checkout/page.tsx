"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, CreditCard, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: Truck },
  { id: "gcash", label: "GCash", icon: CreditCard },
  { id: "maya", label: "Maya", icon: CreditCard },
  { id: "credit_card", label: "Credit / Debit Card", icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });

  const subtotal = getSubtotal();
  const shipping = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + shipping;

  if (items.length === 0 && step !== "success") {
    return (
      <div className="container-main py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Nothing to checkout</h1>
        <Link href="/products" className="btn-primary mt-6 inline-flex">Go Shopping</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const order = {
      order_number: generateOrderNumber(),
      items: items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        product_image: i.product.images?.[0]?.url,
        quantity: i.quantity,
        unit_price: i.product.price,
        total_price: i.product.price * i.quantity,
      })),
      subtotal,
      shipping_fee: shipping,
      total,
      payment_method: paymentMethod,
      shipping_address: form,
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      setOrderNumber(order.order_number);
      clearCart();
      setStep("success");
    } catch {
      setOrderNumber(order.order_number);
      clearCart();
      setStep("success");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="container-main py-16 text-center">
        <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-3xl font-bold text-white">Order Placed!</h1>
        <p className="mb-2 text-gray-400">Thank you for your purchase.</p>
        <p className="mb-8 text-sm text-gray-500">
          Order number: <span className="font-mono text-galaxy-gold">{orderNumber}</span>
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/account/orders" className="btn-primary px-8 py-3">View Orders</Link>
          <Link href="/products" className="btn-secondary px-8 py-3">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="section-title mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="card-surface p-6">
              <h2 className="mb-4 text-lg font-bold text-white">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm text-gray-400">Full Name *</label>
                  <input required className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">Email *</label>
                  <input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">Phone *</label>
                  <input required type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm text-gray-400">Street Address *</label>
                  <input required className="input-field" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">City *</label>
                  <input required className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">Province *</label>
                  <input required className="input-field" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">Postal Code *</label>
                  <input required className="input-field" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm text-gray-400">Order Notes (optional)</label>
                  <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card-surface p-6">
              <h2 className="mb-4 text-lg font-bold text-white">Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left text-sm transition-colors ${
                      paymentMethod === id
                        ? "border-galaxy-gold bg-galaxy-gold/10 text-galaxy-gold"
                        : "border-galaxy-border text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card-surface sticky top-28 p-6">
              <h2 className="mb-4 text-lg font-bold text-white">Order Summary</h2>
              <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="truncate text-gray-400">{product.name} × {quantity}</span>
                    <span className="ml-2 shrink-0 text-white">{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-galaxy-border pt-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-bold text-white">
                  <span>Total</span><span className="text-galaxy-gold">{formatPrice(total)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-6 w-full py-3 disabled:opacity-50">
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
