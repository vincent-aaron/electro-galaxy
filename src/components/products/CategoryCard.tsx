import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/types/database";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative overflow-hidden rounded-xl border border-galaxy-border bg-galaxy-card transition-all hover:-translate-y-1 hover:border-galaxy-gold hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {category.image_url && (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-galaxy-black via-galaxy-black/50 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="mb-1 text-lg font-bold text-white group-hover:text-galaxy-gold">{category.name}</h3>
        <p className="mb-2 line-clamp-2 text-xs text-gray-400">{category.description}</p>
        <span className="inline-flex items-center text-xs font-semibold text-galaxy-gold">
          Shop Now <ChevronRight className="ml-0.5 h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
