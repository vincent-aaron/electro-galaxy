const LOCAL_URL = "http://localhost:3000";

/** Accepts "example.com", "https://example.com/" etc. and returns a clean origin. */
function toOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return null;
  }
}

/**
 * The public site address. NEXT_PUBLIC_SITE_URL wins when set; otherwise the
 * domains Vercel provides automatically are used, so robots.txt, the sitemap
 * and page metadata are correct even before a custom domain is configured.
 */
export function getSiteUrl(): string {
  return (
    toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toOrigin(process.env.VERCEL_URL) ??
    LOCAL_URL
  );
}
