import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/api", "/checkout", "/auth"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
