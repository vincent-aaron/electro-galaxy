"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Client-side guard for the /admin section. Verifies the signed-in user's
 * profile role via /api/admin/session, then renders the admin shell.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ admin: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.admin) {
          setState({ admin: true });
        } else {
          setState({ admin: false, error: "You must be signed in as an administrator to access this page." });
        }
      })
      .catch(() => setState({ admin: false, error: "Could not check admin permissions. Please try again." }));
  }, []);

  if (!state) {
    return (
      <div className="container-main flex min-h-[60vh] items-center justify-center">
        <div className="card-surface w-full max-w-md space-y-4 p-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-galaxy-dark" />
          ))}
          <div className="h-10 animate-pulse rounded bg-galaxy-dark" />
        </div>
      </div>
    );
  }

  return (
    <AdminShell admin={state.admin} error={state.error}>
      {children}
    </AdminShell>
  );
}