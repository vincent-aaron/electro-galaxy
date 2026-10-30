"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import type { Category } from "@/types/database";

interface CategoryWithProducts extends Category {
  products?: Array<{ id: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryWithProducts | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image_url: "", sort_order: "0", is_active: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) setError(d.error);
        else setCategories(d.categories || []);
      })
      .catch(() => setError("Failed to load categories."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", image_url: "", sort_order: String(categories.length + 1), is_active: true });
    setShowForm(true);
  };

  const openEdit = (c: CategoryWithProducts) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image_url: c.image_url ?? "",
      sort_order: String(c.sort_order),
      is_active: c.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() ? slugify(form.slug) : slugify(form.name),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong.");
      } else {
        setNotice(editing ? "Category updated." : "Category added.");
        setShowForm(false);
        load();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: CategoryWithProducts) => {
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to update category.");
    } else {
      setNotice(c.is_active ? "Category hidden." : "Category shown.");
      setCategories((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x))
      );
    }
  };

  const handleDelete = async (c: CategoryWithProducts) => {
    if (!confirm(`Delete category "${c.name}"? Products will keep existing but become uncategorized.`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to delete category.");
    } else {
      setNotice("Category deleted.");
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Categories</h1>
          <p className="mt-1 text-sm text-gray-400">{categories.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </button>
      </div>

      {notice && <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">{notice}</p>}
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="card-surface space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-galaxy-dark" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <p className="text-lg font-semibold text-white">No categories yet</p>
          <p className="mt-2 text-sm text-gray-400">Add a category to organize your products.</p>
        </div>
      ) : (
        <div className="card-surface divide-y divide-galaxy-border overflow-hidden">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                <p className="truncate text-xs text-gray-500">/{c.slug} · {c.products?.length ?? 0} products</p>
              </div>
              <span
                className={`hidden shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline ${
                  c.is_active ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                }`}
                onClick={() => handleToggle(c)}
                title="Toggle visibility"
              >
                {c.is_active ? "Active" : "Hidden"}
              </span>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(c)} className="btn-ghost p-2" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c)} className="btn-ghost p-2 text-red-400" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-8">
          <div className="card-surface w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-galaxy-border bg-galaxy-dark px-5 py-4">
              <h2 className="text-lg font-bold text-white">{editing ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-gray-400">Name *</label>
                <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Home Appliances" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Slug (URL)</label>
                <input className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Sort Order</label>
                <input type="number" min="0" className="input-field" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <input className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-gray-400">Image URL</label>
                <input className="input-field" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://images.unsplash.com/..." />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-400 sm:col-span-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-galaxy-gold" />
                Active (visible in store)
              </label>
              {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 sm:col-span-2">{error}</p>}
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}