import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "electro-galaxy-user";

export interface StoredUser {
  email: string;
  full_name?: string | null;
}

export function saveUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed.email === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Signs the user out everywhere: ends the Supabase session (clears its auth
 * cookies, so API routes stop treating the browser as signed in) and removes
 * the locally cached profile used by the UI.
 */
export async function signOut(): Promise<void> {
  try {
    await createClient()?.auth.signOut();
  } catch (err) {
    console.error("Supabase sign-out failed:", err);
  } finally {
    clearUser();
  }
}
