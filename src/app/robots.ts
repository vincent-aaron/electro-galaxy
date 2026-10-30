import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Set NEXT_PUBLIC_SITE_URL in production to your deployed domain,
  // e.g. https://electro-galaxy.vercel.app
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/api", "/checkout", "/auth", "/admin"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}