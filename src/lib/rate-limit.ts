/**
 * Minimal in-memory fixed-window rate limiter for API routes.
 *
 * Best-effort only: counts live in this server instance's memory, so on
 * serverless hosts each instance has its own window. It still stops casual
 * scripted abuse of the Gemini-backed and form endpoints. For stronger
 * guarantees, swap this for a shared store (e.g. Upstash Redis).
 */
const hits = new Map<string, { count: number; resetAt: number }>();

/** Returns true if the request is allowed, false once `limit` is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;
  return entry.count <= limit;
}

/** Best-effort client IP from proxy headers (Vercel / most hosts set these). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
