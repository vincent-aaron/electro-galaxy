import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes = [
    "",
    "/products",
    "/about",
    "/services",
    "/contact",
    "/cart",
    "/policies/privacy",
    "/policies/terms",
    "/policies/returns",
  ];

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/products" ? ("daily" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.5,
  }));
}