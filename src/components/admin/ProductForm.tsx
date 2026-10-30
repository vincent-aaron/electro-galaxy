"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import type { Product, Category } from "@/types/database";

interface ProductFormValues {
  name: string;
  slug: string;
  price: string;
  compare_at_price: string;
  sku: string;
  stock_quantity: string;
  brand: string;
  category_id: string;
  description: string;
  short_description: string;
  image_url: string;
  specs: string;
  is_featured: boolean;
  is_active: boolean;
}

const emptyForm: ProductFormValues = {
  name: "",
  slug: "",
  price: "",
  compare_at_price: "",
  sku: "",
  stock_quantity: "10",
  brand: "",
  category_id: "",
  description: "",
  short_description: "",
  image_url: "",
  specs: "",
  is_featured: false,
  is_active: true,
};

function productToForm(p: Product): ProductFormValues {
  return {
    name: p.name,
    slug: p.slug,
    price: String(p.price),
    compare_at_price: p.compare_at_price != null ? String(p.compare_at_price) : "",
    sku: p.sku ?? "",
    stock_quantity: String(p.stock_quantity),
    brand: p.brand ?? "",
    category_id: p.category_id ?? "",
    description: p.description ?? "",
    short_description: p.short_description ?? "",
    image_url: p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? "",
    specs: Object.entries(p.specs || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n"),
    is_featured: p.is_featured,
    is_active: p.is_active,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseSpecs(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (key) specs[key] = value;
      } else if (line) {
        specs[line] = "";
      }
    });
  return specs;
}

export function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormValues>(product ? productToForm(product) : emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const slug = form.slug.trim() ? slugify(form.slug) : slugify(form.name);

    const payload = {
      name: form.name.trim(),
      slug,
      category_id: form.category_id || null,
      description: form.description.trim() || null,
      short_description: form.short_description.trim() || null,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      sku: form.sku.trim() || null,
      stock_quantity: Number(form.stock_quantity) || 0,
      brand: form.brand.trim() || null,
      specs: parseSpecs(form.specs),
      is_featured: form.is_featured,
      is_active: form.is_active,
      image_url: form.image_url.trim(),
    };

    try {
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong.");
      } else {
        setSuccess(product ? "Product updated successfully." : "Product created successfully.");
        onSaved();
        if (!product) {
          setForm(emptyForm);
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-8">
      <div className="card-surface w-full max-w-3xl">
        <div className="flex items-center justify-between border-b border-galaxy-border bg-galaxy-dark px-5 py-4">
          <h2 className="text-lg font-bold text-white">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
<form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-400">Name *</label>
            <input required className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. LG Washing Machine 10kg" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Slug (URL)</label>
            <input className="input-field" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated from name" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Category</label>
            <select className="input-field" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">(none)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Price (PHP) *</label>
            <input required type="number" min="0" step="0.01" className="input-field" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="12999" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Compare-at Price (PHP)</label>
            <input type="number" min="0" step="0.01" className="input-field" value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} placeholder="14999" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">SKU</label>
            <input className="input-field" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="EG-KIT-004" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Stock Quantity</label>
            <input type="number" min="0" className="input-field" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Brand</label>
            <input className="input-field" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="LG, Samsung, Dyson..." />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Image URL</label>
            <input className="input-field" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-400">Short Description</label>
            <input className="input-field" value={form.short_description} onChange={(e) => set("short_description", e.target.value)} placeholder="One-line summary" />
          </div>
<div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-400">Full Description</label>
            <textarea className="input-field min-h-[90px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-400">Specifications (one per line, key:value)</label>
            <textarea className="input-field min-h-[90px]" value={form.specs} onChange={(e) => set("specs", e.target.value)} placeholder="capacity: 10kg
warranty: 1 year" />
          </div>

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-4 w-4 accent-galaxy-gold" />
              Featured (homepage)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 accent-galaxy-gold" />
              Active (visible in store)
            </label>
          </div>

          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 sm:col-span-2">{error}</p>}
          {success && <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400 sm:col-span-2">{success}</p>}

          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
