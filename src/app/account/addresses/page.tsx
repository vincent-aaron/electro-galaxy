"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Trash2, Home, Briefcase } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Toast, useToast } from "@/components/ui/Toast";
import type { Address } from "@/types/database";

const labelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Work: Briefcase,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [form, setForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Philippines",
    is_default: false,
  });

  const loadAddresses = () => {
    setLoading(true);
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setForm({ label: "Home", full_name: "", phone: "", street_address: "", city: "", province: "", postal_code: "", country: "Philippines", is_default: false });
        setShowForm(false);
        showToast("Address added successfully");
        loadAddresses();
      } else {
        showToast(data.error || "Failed to add address");
      }
    } catch {
      showToast("Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      showToast("Address removed");
      loadAddresses();
    } catch {
      showToast("Failed to remove address");
    }
  };

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Addresses" }]} />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">My Addresses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 py-2.5 text-sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add Address
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-surface mb-8 space-y-4 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white">Add New Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-gray-400">Label</label>
              <select className="input-field" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-400">Full Name *</label>
              <input required className="input-field" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-400">Phone *</label>
              <input required type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-gray-400">Street Address *</label>
              <input required className="input-field" value={form.street_address} onChange={(e) => setForm({ ...form, street_address: e.target.value })} />
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
              <input required className="input-field" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-400">Country</label>
              <input className="input-field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="h-4 w-4 accent-galaxy-gold" />
            Set as default address
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
              {saving ? "Saving..." : "Save Address"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6 py-2.5 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface h-40 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="card-surface py-16 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <h2 className="mb-2 text-lg font-semibold text-white">No saved addresses</h2>
          <p className="mb-6 text-sm text-gray-400">Add an address to speed up checkout.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-8 py-3">Add Address</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((addr) => {
            const Icon = labelIcons[addr.label] || Home;
            return (
              <div key={addr.id} className="card-surface relative p-6">
                {addr.is_default && (
                  <span className="absolute right-4 top-4 rounded-full bg-galaxy-gold/10 px-2.5 py-0.5 text-xs font-semibold text-galaxy-gold">
                    Default
                  </span>
                )}
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-galaxy-gold/10">
                  <Icon className="h-5 w-5 text-galaxy-gold" />
                </div>
                <h3 className="mb-1 font-semibold text-white">{addr.label}</h3>
                <p className="text-sm font-medium text-gray-300">{addr.full_name}</p>
                <p className="text-sm text-gray-400">{addr.phone}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {addr.street_address}, {addr.city}, {addr.province} {addr.postal_code}
                </p>
                <p className="text-sm text-gray-500">{addr.country}</p>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onClose={hideToast} />
    </div>
  );
}
