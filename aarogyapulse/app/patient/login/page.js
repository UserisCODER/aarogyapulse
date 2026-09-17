"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";

const KEY = "aarogyapulse.patient";

export default function PatientLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [abhaId, setAbhaId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const googleBtn = useRef(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  function signedIn(patient) {
    window.localStorage.setItem(KEY, JSON.stringify(patient));
    router.push("/patient");
  }

  async function submit() {
    setBusy(true);
    setError("");
    const url = mode === "signin" ? "/api/patient/login" : "/api/patient/signup";
    const body = mode === "signin" ? { email, password } : { email, password, abhaId };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      signedIn(data.patient);
    } finally {
      setBusy(false);
    }
  }

  // Google Identity Services renders its own button into the div below.
  useEffect(() => {
    if (!clientId) return;

    function init() {
      if (!window.google || !googleBtn.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setError("");
          const res = await fetch("/api/patient/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential, abhaId }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Google sign-in failed.");
            return;
          }
          signedIn(data.patient);
        },
      });
      window.google.accounts.id.renderButton(googleBtn.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    if (window.google) init();
    else window.addEventListener("aarogyapulse:gsi", init, { once: true });
  }, [clientId, abhaId]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      {clientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => window.dispatchEvent(new Event("aarogyapulse:gsi"))}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <span className="h-7 w-7 rounded-md bg-gov-500 grid place-items-center text-white text-sm font-bold">
            A
          </span>
          <span className="font-bold tracking-tight">AarogyaPulse</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in to your health record" : "Claim your health ID"}
        </h1>
        <p className="text-sm text-slate-600 mt-1.5">
          {mode === "signin"
            ? "See your visits, reports and who has asked for access."
            : "Enter the health ID the Aadhaar centre gave you and pick a password."}
        </p>

        <div className="card p-5 mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="label" htmlFor="abha">Health ID</label>
              <input
                id="abha"
                className="input font-mono"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="14-9090-1212-3434"
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button onClick={submit} disabled={busy} className="btn-primary w-full">
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px bg-slate-200 flex-1" />
            or
            <span className="h-px bg-slate-200 flex-1" />
          </div>

          {clientId ? (
            <div ref={googleBtn} className="flex justify-center" />
          ) : (
            <p className="text-xs text-slate-500 text-center">
              Google sign-in is switched off. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to
              .env.local to turn it on — see the README.
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
          }}
          className="mt-5 text-sm text-gov-600 font-semibold hover:underline"
        >
          {mode === "signin"
            ? "New here? Claim your health ID"
            : "Already have an account? Sign in"}
        </button>

        <p className="mt-6 text-xs text-slate-500">
          Demo account: ramesh@example.com / demo123
        </p>
      </motion.div>
    </div>
  );
}
