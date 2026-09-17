"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/auth";

/**
 * Wraps every signed-in screen. It checks that the person in localStorage has
 * the role this screen expects, and hands the user object to its children.
 */
export default function AppShell({ role, title, subtitle, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== role) {
      router.replace("/login");
      return;
    }
    setUser(s);
    setChecked(true);
  }, [role, router]);

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  if (!checked) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-slate-500">
        Checking your sign-in…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-md bg-gov-500 grid place-items-center text-white text-sm font-bold">
              A
            </span>
            <span className="font-bold tracking-tight">AarogyaPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500">
                {ROLE_LABEL[user.role]}
                {user.department ? ` · ${user.department}` : ""}
              </p>
            </div>
            <button onClick={signOut} className="btn-ghost !py-2 !px-3">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-600 mt-1.5 max-w-2xl">{subtitle}</p>}
        </div>
        {children(user)}
      </main>
    </div>
  );
}
