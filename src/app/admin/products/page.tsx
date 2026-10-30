"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { formatPrice } from "@/lib/utils";
import type { Product, Category } from "@/types/database";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([pData, cData]) => {
        if (pData?.error) setError(pData.error);
        else setProducts(pData.products || []);
        if (cData?.error) setError(cData.error);
        else setCategories(cData.categories || []);
      })
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to delete product.");
    } else {
      setNotice("Product deleted.");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Products</h1>
          <p className="mt-1 text-sm text-gray-400">{products.length} total</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </button>
      </div>

      {notice && (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">{notice}</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          className="input-field pl-9"
          placeholder="Search products by name, brand, SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card-surface space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-galaxy-dark" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <p className="text-lg font-semibold text-white">No products found</p>
          <p className="mt-2 text-sm text-gray-400">
            {query ? "Try a different search." : "Add your first product to get started."}
          </p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden divide-y divide-galaxy-border sm:block">
            {filtered.map((p) => {
              const image = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url;
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg bg-galaxy-dark object-cover" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-galaxy-dark" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {p.category?.name ?? "Uncategorized"} · {p.brand ?? "—"} · SKU: {p.sku ?? "—"}
                    </p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 md:flex">
                    {p.is_featured && (
                      <span className="rounded-full bg-galaxy-gold/10 px-2.5 py-0.5 text-xs font-semibold text-galaxy-gold">
                        Featured
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.is_active ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.stock_quantity < 10 ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {p.stock_quantity} in stock
                    </span>
                  </div>
                  <span className="hidden shrink-0 text-sm font-semibold text-white lg:block">{formatPrice(p.price)}</span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="btn-ghost p-2"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="btn-ghost p-2 text-red-400 hover:text-red-300" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="divide-y divide-galaxy-border sm:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="space-y-2 px-5 py-4">
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category?.name ?? "Uncategorized"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{formatPrice(p.price)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="btn-ghost p-2"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="btn-ghost p-2 text-red-400" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            load();
            setNotice(editing ? "Product updated." : "Product added.");
            setShowForm(false);
          }}
        />
      )}

    </div>
  );
}