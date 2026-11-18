import "server-only";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Fixed-window rate limiting for API routes.
 *
 * Counts are kept in this instance's memory and, once
 * supabase/security-hardening.sql has been applied, in a table shared by every
 * serverless instance. Until then (or if the database is unreachable) the
 * in-memory count still applies.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
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

/** Returns true if the request is allowed, false once `limit` is exceeded. */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!memoryLimit(key, limit, windowMs)) return false;

  const service = createServiceClient();
  if (!service) return true;

  try {
    // Hashed so IP addresses and user ids are not stored in the table.
    const hashed = createHash("sha256").update(key).digest("hex");
    const { data, error } = await service.rpc("check_rate_limit", {
      p_key: hashed,
      p_limit: limit,
      p_window_seconds: Math.ceil(windowMs / 1000),
    });
    return error ? true : data !== false;
  } catch {
    return true;
  }
}

/** Client IP as reported by the hosting platform, which overwrites these headers. */
export function clientIp(request: Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
