import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
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