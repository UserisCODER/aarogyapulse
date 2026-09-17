"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Timeline from "@/components/Timeline";
import StatCard from "@/components/StatCard";
import VitalsChart from "@/components/VitalsChart";
import DocumentList from "@/components/DocumentList";

const KEY = "aarogyapulse.patient";

const TABS = [
  ["overview", "Overview"],
  ["timeline", "My visits"],
  ["documents", "Documents"],
  ["access", "Who can see my record"],
  ["help", "Help"],
];

export default function PatientDashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");

  const load = useCallback(async (abhaId) => {
    const res = await fetch(`/api/patient/me?abhaId=${encodeURIComponent(abhaId)}`);
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      router.replace("/patient/login");
      return;
    }
    const patient = JSON.parse(raw);
    setMe(patient);
    load(patient.abhaId);
    // Poll so a doctor's access request shows up while the patient is sitting there.
    const t = setInterval(() => load(patient.abhaId), 5000);
    return () => clearInterval(t);
  }, [router, load]);

  function signOut() {
    window.localStorage.removeItem(KEY);
    router.replace("/patient/login");
  }

  if (!me || !data) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-slate-500">
        Loading your record…
      </div>
    );
  }

  const pending = data.consents.filter((c) => c.status === "pending");

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-md bg-gov-500 grid place-items-center text-white text-sm font-bold">
              A
            </span>
            <span className="font-bold tracking-tight">AarogyaPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-semibold">{data.patient.name}</p>
              <p className="text-xs text-slate-500 font-mono">{data.patient.abhaId}</p>
            </div>
            <button onClick={signOut} className="btn-ghost !py-2 !px-3">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 mb-6 border-amber-200 bg-amber-50"
          >
            <p className="font-semibold text-sm text-amber-900">
              {pending.length === 1
                ? "A doctor is asking to see your record"
                : `${pending.length} doctors are asking to see your record`}
            </p>
            <button
              onClick={() => setTab("access")}
              className="btn-primary !py-2 mt-3"
            >
              Review the request
            </button>
          </motion.div>
        )}

        <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
                tab === key ? "text-gov-600" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
              {tab === key && (
                <motion.span
                  layoutId="patient-tab"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-gov-500"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "overview" && <Overview data={data} />}
            {tab === "timeline" && <Timeline records={data.records} />}
            {tab === "documents" && (
              <Documents data={data} onChange={() => load(me.abhaId)} />
            )}
            {tab === "access" && (
              <Access data={data} onChange={() => load(me.abhaId)} />
            )}
            {tab === "help" && <Help data={data} onChange={() => load(me.abhaId)} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Overview({ data }) {
  const { stats, patient } = data;
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visits recorded"
          value={stats.visits}
          hint={stats.lastVisit ? `Last on ${stats.lastVisit}` : "None yet"}
        />
        <StatCard
          label="Medicines prescribed"
          value={stats.uniqueMedicines}
          hint={`${stats.activeMedicines} on the latest prescription`}
        />
        <StatCard label="Departments seen" value={stats.departments} />
        <StatCard label="Documents stored" value={stats.documents} />
      </div>

      <VitalsChart series={data.vitalsSeries} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-bold tracking-tight">Your details</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={patient.name} />
            <Row label="Health ID" value={patient.abhaId} mono />
            <Row label="Age" value={patient.age || "—"} />
            <Row label="Phone" value={patient.phone} />
            <Row label="Village" value={patient.village} />
            <Row label="Created at" value={patient.createdBy} />
          </dl>
        </div>

        <div className="card p-5">
          <h3 className="font-bold tracking-tight">Recent activity on your record</h3>
          {data.accessLog.length === 0 ? (
            <p className="text-sm text-slate-600 mt-2">Nothing yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {data.accessLog.slice(0, 6).map((a) => (
                <li key={a.id} className="flex justify-between gap-3">
                  <span>
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-slate-600">{a.action.replace(/-/g, " ")}</span>
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(a.at).toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-slate-500">{label}</dt>
      <dd className={`font-medium ${mono ? "font-mono text-[13px]" : ""}`}>{value}</dd>
    </div>
  );
}

function Documents({ data, onChange }) {
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload() {
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setBusy(true);
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("abhaId", data.patient.abhaId);
    form.append("label", label || file.name);
    form.append("uploadedBy", data.patient.name);

    const res = await fetch("/api/documents", { method: "POST", body: form });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Upload failed.");
      return;
    }
    setFile(null);
    setLabel("");
    onChange();
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-bold tracking-tight">Add a document</h3>
        <p className="text-sm text-slate-600 mt-1">
          Lab reports, X-ray scans, discharge summaries — anything you want a
          future doctor to see. PDF or image, up to 8 MB.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
          <div>
            <label className="label" htmlFor="doclabel">What is it?</label>
            <input
              id="doclabel"
              className="input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Lipid profile, March 2026"
            />
          </div>
          <div>
            <label className="label" htmlFor="docfile">File</label>
            <input
              id="docfile"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input !py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs"
            />
          </div>
          <button onClick={upload} disabled={busy} className="btn-primary">
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-bold tracking-tight mb-3">Stored on your health ID</h3>
        <DocumentList documents={data.documents} />
      </div>
    </div>
  );
}

function Access({ data, onChange }) {
  async function decide(id, decision) {
    await fetch("/api/consent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    onChange();
  }

  const pending = data.consents.filter((c) => c.status === "pending");
  const decided = data.consents.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-bold tracking-tight">Waiting for your decision</h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-600 mt-2">
            Nobody is asking right now. A doctor can only open your history after
            you say yes, and the permission expires after an hour.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((c) => (
              <li key={c.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-sm">
                  {c.doctorName} · {c.department}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Wants to see: {c.scope}. Reason: {c.reason}.
                </p>
                <div className="flex gap-3 mt-3">
                  <button onClick={() => decide(c.id, "granted")} className="btn-primary !py-2">
                    Allow for 1 hour
                  </button>
                  <button onClick={() => decide(c.id, "denied")} className="btn-ghost !py-2">
                    Refuse
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-bold tracking-tight">Past decisions</h3>
        {decided.length === 0 ? (
          <p className="text-sm text-slate-600 mt-2">Nothing here yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {decided.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {c.doctorName} · {c.department}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.status} on{" "}
                    {c.decidedAt ? new Date(c.decidedAt).toLocaleString("en-IN") : "—"}
                  </p>
                </div>
                {c.live ? (
                  <button
                    onClick={() => decide(c.id, "revoked")}
                    className="btn-ghost !py-1.5 !px-3"
                  >
                    Revoke now
                  </button>
                ) : (
                  <span className="chip bg-slate-100 text-slate-600">{c.status}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const FAQ = [
  [
    "Who can see my medical history?",
    "Only a doctor you have said yes to, and only for an hour at a time. You can take the permission back at any point from the access tab.",
  ],
  [
    "I lost the paper with my health ID on it.",
    "Go back to any Aadhaar centre with the same Aadhaar card. Staff can look your health ID up in a few seconds — a new one is not created.",
  ],
  [
    "A prescription on my timeline is wrong.",
    "Raise a request below with the visit date. The hospital that entered it has to correct it, and the change is recorded rather than silently overwritten.",
  ],
  [
    "Does this cost anything?",
    "No. Creating the health ID, storing records and sharing them with a doctor are all free.",
  ],
];

function Help({ data, onChange }) {
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        abhaId: data.patient.abhaId,
        name: data.patient.name,
        topic,
        message,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Could not send that.");
      return;
    }
    setMessage("");
    setSent(true);
    setError("");
    onChange();
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-bold tracking-tight">Common questions</h3>
        <dl className="mt-4 space-y-4">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <dt className="font-semibold text-sm">{q}</dt>
              <dd className="text-sm text-slate-600 mt-1 leading-relaxed">{a}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card p-5">
        <h3 className="font-bold tracking-tight">Ask for help</h3>
        <p className="text-sm text-slate-600 mt-1">
          The support desk answers on the phone number linked to your health ID.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="topic">What is this about?</label>
            <select
              id="topic"
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option>General</option>
              <option>Wrong record on my timeline</option>
              <option>Cannot sign in</option>
              <option>Someone accessed my record without asking</option>
              <option>Health ID not found</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="msg">Tell us what happened</label>
            <textarea
              id="msg"
              rows={4}
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Include the visit date and hospital name if it helps."
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {sent && (
            <p className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-800">
              Sent. The support desk will call you on the number on file.
            </p>
          )}

          <button onClick={send} className="btn-primary">
            Send to support
          </button>
        </div>
      </div>

      {data.tickets.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold tracking-tight">Your past requests</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.tickets.map((t) => (
              <li key={t.id} className="py-3">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-medium">{t.topic}</p>
                  <span
                    className={`chip ${
                      t.status === "open"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{t.message}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
