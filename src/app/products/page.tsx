import { Suspense } from "react";
import { ProductListing } from "./ProductListing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getCategories } from "@/lib/data/products";

export const metadata = {
  title: "Shop All Products",
  description: "Browse our full catalog of electronics, smart appliances, and home gadgets.",
};

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <div className="container-main py-8">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <div className="mb-8">
        <h1 className="section-title">All Products</h1>
        <p className="mt-2 text-gray-400">Discover our complete collection of premium electronics</p>
      </div>
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductListing categories={categories} />
      </Suspense>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card-surface h-80 animate-pulse" />
      ))}
    </div>
  );
}
