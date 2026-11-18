import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase/env";

/**
 * Refreshes the Supabase auth session on every request and writes the new
 * cookies to the response. Server Components can't set cookies, so without
 * this an expired access token is refreshed but never saved, and the session
 * is eventually revoked (users get logged out at random).
 */
export async function middleware(request: NextRequest) {
  const config = supabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Mock mode: nothing to refresh.
  if (!config) {
    return NextResponse.next({ request });
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
  try {
    await supabase.auth.getUser();
  } catch (err) {
    console.error("Supabase session refresh failed:", err);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static files and images.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
