"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveSession } from "@/lib/session";
import { ROLE_HOME } from "@/lib/auth";

const ROLES = [
  { key: "aadhaar", label: "Aadhaar centre", hint: "Creates and links health IDs", demo: "ASK1001" },
  { key: "records", label: "Records counter", hint: "Digitises paper slips", demo: "REC2001" },
  { key: "doctor", label: "Doctor", hint: "Sees their department's queue", demo: "DOC3001" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("aadhaar");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed.");
        return;
      }
      saveSession(data.user);
      router.push(ROLE_HOME[data.user.role]);
    } catch {
      setError("Could not reach the server. Is the dev server running?");
    } finally {
      setBusy(false);
    }
  }

  function fillDemo() {
    const r = ROLES.find((x) => x.key === role);
    setStaffId(r.demo);
    setPassword("demo123");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gov-600 text-white p-12">
        <div className="flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-md bg-white grid place-items-center text-gov-600 text-sm font-bold">
            A
          </span>
          <span className="font-bold tracking-tight">AarogyaPulse</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight leading-tight max-w-md">
            The last mile of digital health is enrolment — and it&apos;s already paved.
          </h2>
          <p className="mt-4 text-gov-100 max-w-md">
            Three counters, one record. Sign in with the role you are working as.
          </p>
        </div>
        <p className="text-sm text-gov-100">Team Er Hustlers · HackWave 3.0</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">Staff sign in</h1>
          <p className="text-slate-600 mt-1.5 text-sm">
            Choose the counter you are working at today.
          </p>

          <div className="mt-6 grid gap-2">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`text-left rounded-xl border px-4 py-3 transition ${
                  role === r.key
                    ? "border-gov-500 bg-gov-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="font-semibold text-sm">{r.label}</p>
                <p className="text-xs text-slate-600">{r.hint}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="staffId">Staff ID</label>
              <input
                id="staffId"
                className="input"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="ASK1001"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                placeholder="demo123"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-6 flex gap-3">
            <button onClick={handleSignIn} disabled={busy} className="btn-primary flex-1">
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button onClick={fillDemo} className="btn-ghost">
              Use demo account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
