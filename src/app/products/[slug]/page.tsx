import { notFound } from "next/navigation";
import { ProductDetail } from "./ProductDetail";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.short_description || product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.category_id);

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}
