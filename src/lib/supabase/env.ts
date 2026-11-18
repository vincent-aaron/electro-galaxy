/**
 * Validates Supabase settings. Returns null when they are missing, still the
 * .env.example placeholders, or malformed, so the app falls back to demo data
 * instead of crashing. Callers pass process.env.NEXT_PUBLIC_* by its full name
 * because Next.js only inlines those variables when written out literally.
 */
export function supabaseConfig(url: string | undefined, key: string | undefined) {
  const cleanUrl = url?.trim();
  const cleanKey = key?.trim();

  if (!cleanUrl || !cleanKey) return null;
  if (cleanUrl.includes("your-project") || cleanKey.startsWith("your-")) return null;

  try {
    const { protocol } = new URL(cleanUrl);
    if (protocol !== "https:" && protocol !== "http:") return null;
  } catch {
    return null;
  }

  return { url: cleanUrl, key: cleanKey };
}
