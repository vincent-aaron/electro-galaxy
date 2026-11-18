import { createClient } from "@/lib/supabase/client";

/** Removed from the browser: older versions cached the profile under this key. */
const LEGACY_STORAGE_KEY = "electro-galaxy-user";

export interface StoredUser {
  email: string;
  full_name?: string | null;
}

// Only used in demo mode (no Supabase configured). Lives in memory, so no
// account details are written to the browser's storage.
let demoUser: StoredUser | null = null;

function clearLegacyStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* storage can be unavailable in private browsing */
  }
}

export function saveUser(user: StoredUser): void {
  demoUser = user;
}

/** The signed-in user, read from the verified Supabase session. */
export async function getUser(): Promise<StoredUser | null> {
  if (typeof window === "undefined") return null;
  clearLegacyStorage();

  const supabase = createClient();
  if (!supabase) return demoUser;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;
    return { email: user.email, full_name: user.user_metadata?.full_name ?? null };
  } catch {
    return null;
  }
}

/**
 * Signs the user out everywhere: ends the Supabase session, which clears its
 * auth cookies so API routes stop treating the browser as signed in.
 */
export async function signOut(): Promise<void> {
  try {
    await createClient()?.auth.signOut();
  } catch {
    console.error("Sign-out failed");
  } finally {
    demoUser = null;
    clearLegacyStorage();
  }
}
