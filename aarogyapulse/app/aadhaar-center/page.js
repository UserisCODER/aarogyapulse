"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import SuccessSeal from "@/components/SuccessSeal";

const STEPS = [
  "Aadhaar number read",
  "Biometric captured",
  "Consent recorded",
  "Health ID issued",
];

export default function AadhaarCenterPage() {
  return (
    <AppShell
      role="aadhaar"
      title="Create a health ID"
      subtitle="The citizen is already at the counter for a routine update. Capture the basics, take consent, and hand them a health ID before they leave."
    >
      {(user) => <CreateFlow user={user} />}
    </AppShell>
  );
}

function CreateFlow({ user }) {
  const [form, setForm] = useState({
    name: "",
    aadhaarLast4: "",
    age: "",
    gender: "F",
    phone: "",
    village: "",
  });
  const [stage, setStage] = useState("form"); // form | verifying | done
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setError("");
    if (!form.name.trim() || form.aadhaarLast4.length !== 4) {
      setError("Enter the citizen's name and the last 4 digits of their Aadhaar.");
      return;
    }

    setStage("verifying");
    setStepIndex(0);

    // Walk through the verification steps so staff can see what is happening.
    const timer = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 600);

    try {
      const res = await fetch("/api/abha/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, centre: user.centre }),
      });
      const data = await res.json();
      clearInterval(timer);

      if (!res.ok) {
        setError(data.error || "Could not create the health ID.");
        setStage("form");
        return;
      }

      setTimeout(() => {
        setResult(data);
        setStage("done");
      }, 700);
    } catch {
      clearInterval(timer);
      setError("Server not reachable.");
      setStage("form");
    }
  }

  function reset() {
    setForm({ name: "", aadhaarLast4: "", age: "", gender: "F", phone: "", village: "" });
    setResult(null);
    setStage("form");
  }

  if (stage === "done" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 max-w-xl"
      >
        <SuccessSeal />
        <h2 className="mt-5 text-xl font-bold tracking-tight">
          {result.alreadyLinked
            ? "This Aadhaar already has a health ID"
            : "Health ID created"}
        </h2>
        <p className="text-slate-600 mt-1.5 text-sm">
          {result.alreadyLinked
            ? "We linked the existing record instead of making a duplicate."
            : "Read the number out to the citizen. Nothing else is needed from them."}
        </p>

        <div className="mt-5 rounded-lg bg-gov-50 border border-gov-100 p-4">
          <p className="text-xs font-semibold text-gov-700">Health ID</p>
          <p className="font-mono text-xl font-bold mt-1">{result.patient.abhaId}</p>
          <p className="text-sm text-slate-600 mt-2">
            {result.patient.name} · Aadhaar ending {result.patient.aadhaarLast4}
          </p>
        </div>

        <button onClick={reset} className="btn-primary mt-6">
          Create another
        </button>
      </motion.div>
    );
  }

  if (stage === "verifying") {
    return (
      <div className="card p-8 max-w-xl">
        <h2 className="text-lg font-bold tracking-tight">Issuing health ID…</h2>
        <ol className="mt-5 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <motion.span
                animate={{
                  backgroundColor: i <= stepIndex ? "#2563EB" : "#E2E8F0",
                  scale: i === stepIndex ? 1.15 : 1,
                }}
                className="h-2.5 w-2.5 rounded-full"
              />
              <span
                className={`text-sm ${
                  i <= stepIndex ? "text-slate-900 font-medium" : "text-slate-400"
                }`}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      <div className="card p-6 max-w-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="As printed on Aadhaar"
            />
          </div>
          <div>
            <label className="label" htmlFor="last4">Aadhaar — last 4 digits</label>
            <input
              id="last4"
              inputMode="numeric"
              maxLength={4}
              className="input font-mono"
              value={form.aadhaarLast4}
              onChange={(e) =>
                set("aadhaarLast4", e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="8821"
            />
          </div>
          <div>
            <label className="label" htmlFor="age">Age</label>
            <input
              id="age"
              inputMode="numeric"
              className="input"
              value={form.age}
              onChange={(e) => set("age", e.target.value.replace(/\D/g, ""))}
              placeholder="47"
            />
          </div>
          <div>
            <label className="label" htmlFor="gender">Gender</label>
            <select
              id="gender"
              className="input"
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              className="input"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="village">Village or town</label>
            <input
              id="village"
              className="input"
              value={form.village}
              onChange={(e) => set("village", e.target.value)}
              placeholder="Chandil, Jharkhand"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button onClick={submit} className="btn-primary mt-6">
          Capture biometric and issue ID
        </button>
      </div>

      <aside className="card p-5">
        <h2 className="font-bold tracking-tight text-sm">Counter script</h2>
        <ol className="mt-3 space-y-2.5 text-sm text-slate-600">
          <li>1. Ask if they would like a free health ID linked to this Aadhaar.</li>
          <li>2. Explain that doctors will see their history only with consent.</li>
          <li>3. Capture the thumb impression as usual.</li>
          <li>4. Read the health ID number out and print it on the slip.</li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">
          Signed in at {user.centre}.
        </p>
      </aside>
    </div>
  );
}
