import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase/env";

const MAX_API_BODY_BYTES = 256 * 1024;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Answers with the site's normal 404 page, exactly as for a page that doesn't exist. */
function notFound(request: NextRequest) {
  const response = NextResponse.rewrite(new URL("/404-not-found", request.url), { status: 404 });
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

/** Rejects cross-site and oversized writes before they reach an API route. */
function guardApiWrite(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/") || SAFE_METHODS.has(request.method)) return null;

  const origin = request.headers.get("origin");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      /* a malformed Origin is treated as cross-site */
    }
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (originHost !== host) {
      return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
    }
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_API_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }
  return null;
}

/**
 * Refreshes the Supabase auth session on every request and writes the new
 * cookies to the response. Server Components can't set cookies, so without
 * this an expired access token is refreshed but never saved, and the session
 * is eventually revoked (users get logged out at random).
 *
 * Also keeps the admin area invisible: anyone who is not an admin gets a plain
 * 404 before any admin page renders.
 */
export async function middleware(request: NextRequest) {
  const blocked = guardApiWrite(request);
  if (blocked) return blocked;

  const isAdminPage = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/");
  const config = supabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Mock mode: nothing to refresh, and there are no admins.
  if (!config) {
    return isAdminPage ? notFound(request) : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not remove: this call is what triggers the token refresh. A Supabase
  // outage must not take the whole site down, so failures are only logged.
  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    console.error("Supabase session refresh failed");
  }

  if (isAdminPage) {
    if (!userId) return notFound(request);

    // Fails closed: any error reading the role is treated as "not an admin".
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (error || profile?.role !== "admin") return notFound(request);

    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static files and images.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
