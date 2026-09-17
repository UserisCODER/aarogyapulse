"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import Timeline from "@/components/Timeline";
import PatientHeader from "@/components/PatientHeader";
import { DEPARTMENTS } from "@/lib/auth";

export default function RecordsCounterPage() {
  return (
    <AppShell
      role="records"
      title="Records counter"
      subtitle="Find the patient by Aadhaar or health ID, turn the paper in their hand into a dated timeline, then send them to the right department."
    >
      {(user) => <Counter user={user} />}
    </AppShell>
  );
}

function Counter({ user }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [tab, setTab] = useState("timeline"); // timeline | scan | checkin
  const [searched, setSearched] = useState(false);

  async function search() {
    const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.patients);
    setSearched(true);
  }

  async function open(abhaId) {
    const res = await fetch(`/api/patients/${encodeURIComponent(abhaId)}`);
    const data = await res.json();
    setPatient(data.patient);
    setRecords(data.records);
    setResults([]);
    setTab("timeline");
  }

  async function refresh() {
    if (!patient) return;
    const res = await fetch(`/api/patients/${encodeURIComponent(patient.abhaId)}`);
    const data = await res.json();
    setRecords(data.records);
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <label className="label" htmlFor="q">
          Aadhaar last 4 digits, health ID, or name
        </label>
        <div className="flex gap-3">
          <input
            id="q"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="8821"
          />
          <button onClick={search} className="btn-primary">
            Look up
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {results.map((p) => (
              <li key={p.abhaId}>
                <button
                  onClick={() => open(p.abhaId)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                >
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-slate-600 font-mono">
                    {p.abhaId} · Aadhaar ending {p.aadhaarLast4}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {searched && results.length === 0 && !patient && (
          <p className="mt-4 text-sm text-slate-600">
            No health ID matches that. Send the patient to the Aadhaar counter to
            get one — it takes about a minute.
          </p>
        )}
      </div>

      {patient && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PatientHeader patient={patient} records={records} />

          <div className="flex gap-1 border-b border-slate-200">
            {[
              ["timeline", `Timeline (${records.length})`],
              ["scan", "Scan a paper slip"],
              ["checkin", "Send to a doctor"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative px-4 py-2.5 text-sm font-semibold transition ${
                  tab === key ? "text-gov-600" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
                {tab === key && (
                  <motion.span
                    layoutId="tab-underline"
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
              {tab === "timeline" && <Timeline records={records} />}
              {tab === "scan" && (
                <ScanPanel patient={patient} user={user} onSaved={() => { refresh(); setTab("timeline"); }} />
              )}
              {tab === "checkin" && <CheckInPanel patient={patient} user={user} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function ScanPanel({ patient, user, onSaved }) {
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [draft, setDraft] = useState(null);
  const [engine, setEngine] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  async function runOcr() {
    setScanning(true);
    setDraft(null);
    setError("");

    try {
      let res;
      if (file) {
        // Real OCR: the image goes to the server, Tesseract reads it, and the
        // NLP step turns the text into fields.
        const form = new FormData();
        form.append("file", file);
        res = await fetch("/api/ocr", { method: "POST", body: form });
      } else {
        res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not read that.");
        return;
      }
      setDraft(data.draft);
      setEngine(data.engine);
    } catch {
      setError("The scan failed. Type the slip text instead.");
    } finally {
      setScanning(false);
    }
  }

  async function save() {
    // The slip image is kept alongside the record, so the original is always
    // there to check against.
    if (file) {
      const form = new FormData();
      form.append("file", file);
      form.append("abhaId", patient.abhaId);
      form.append("label", `Prescription ${draft.date}`);
      form.append("uploadedBy", user.name);
      await fetch("/api/documents", { method: "POST", body: form });
    }

    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ abhaId: patient.abhaId, draft, savedBy: user.name }),
    });

    setDraft(null);
    setRawText("");
    setFile(null);
    setPreview(null);
    onSaved();
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setDraft(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <div className="card p-5">
        <h3 className="font-bold tracking-tight">Old prescription</h3>
        <p className="text-sm text-slate-600 mt-1">
          Photograph the slip and the scanner reads it. If the handwriting defeats
          it, type what the slip says instead.
        </p>

        <label className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 cursor-pointer hover:border-gov-500 hover:bg-gov-50/40 transition">
          <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
          {preview ? (
            <img
              src={preview}
              alt="The slip you selected"
              className="max-h-44 rounded-lg object-contain"
            />
          ) : (
            <>
              <span className="text-sm font-semibold">Choose a photo of the slip</span>
              <span className="text-xs text-slate-500 mt-1">JPG or PNG</span>
            </>
          )}
        </label>
        {file && (
          <p className="mt-2 text-xs text-slate-500">
            {file.name} — press Read the slip to run the scanner.
          </p>
        )}

        <div className="mt-4">
          <label className="label" htmlFor="raw">Or type the slip text</label>
          <textarea
            id="raw"
            rows={6}
            className="input font-mono text-xs"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={"SADAR HOSPITAL\nDept: Cardiology   Date: 12/07/2023\nDx: Hypertension\nRx: Telmisartan 40mg 1-0-0 x 30 days"}
          />
        </div>

        <button onClick={runOcr} disabled={scanning} className="btn-primary mt-4">
          {scanning ? "Reading the slip…" : "Read the slip"}
        </button>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="card p-5 min-h-[280px]">
        <h3 className="font-bold tracking-tight">What we read</h3>

        {scanning && (
          <div className="mt-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                className="h-3.5 rounded bg-slate-200"
                style={{ width: `${90 - i * 12}%` }}
              />
            ))}
            <p className="text-xs text-slate-500 pt-2">
              The first scan on a new machine downloads the language data. Give it
              a few seconds.
            </p>
          </div>
        )}

        {!scanning && !draft && (
          <p className="text-sm text-slate-600 mt-2">
            Nothing read yet. Upload a slip or paste its text, then press Read the slip.
          </p>
        )}

        {draft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="chip bg-emerald-50 text-emerald-700">
                {Math.round(draft.confidence * 100)}% confident
              </span>
              <span className="chip bg-gov-50 text-gov-700">{draft.department}</span>
              {engine === "fallback" && (
                <span className="chip bg-amber-50 text-amber-800">
                  Scanner unavailable — sample shown
                </span>
              )}
            </div>

            <dl className="space-y-2 text-sm">
              <Row label="Date" value={draft.date} />
              <Row label="Facility" value={draft.facility} />
              <Row label="Doctor" value={draft.doctor} />
              <Row label="Diagnosis" value={draft.diagnosis} />
            </dl>

            {draft.medicines.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Medicines</p>
                <ul className="space-y-1 text-sm">
                  {draft.medicines.map((m, i) => (
                    <li key={i}>
                      <span className="font-medium">{m.name}</span> {m.dose} ·{" "}
                      {m.frequency} · {m.duration}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {draft.notes && (
              <p className="mt-4 text-sm text-slate-600">{draft.notes}</p>
            )}

            <details className="mt-4">
              <summary className="text-xs text-slate-500 cursor-pointer">
                Show the raw text the scanner produced
              </summary>
              <pre className="mt-2 text-[11px] bg-slate-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {draft.rawText}
              </pre>
            </details>

            <div className="mt-5 flex gap-3">
              <button onClick={save} className="btn-primary">
                Save to timeline
              </button>
              <button onClick={() => setDraft(null)} className="btn-ghost">
                Discard
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Nothing is saved until you check the reading against the paper.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function CheckInPanel({ patient, user }) {
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [complaint, setComplaint] = useState("");
  const [sent, setSent] = useState(null);

  async function send() {
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        abhaId: patient.abhaId,
        department,
        complaint,
        sentBy: user.name,
      }),
    });
    const data = await res.json();
    setSent(data.entry);
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 max-w-lg">
        <h3 className="font-bold tracking-tight">
          Sent to {sent.department}
        </h3>
        <p className="text-sm text-slate-600 mt-1.5">
          The {sent.department} doctor now has {patient.name}&apos;s history open.
          No other department can see this check-in.
        </p>
        <button onClick={() => setSent(null)} className="btn-ghost mt-5">
          Send again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="card p-5 max-w-lg">
      <div>
        <label className="label" htmlFor="dept">Department</label>
        <select
          id="dept"
          className="input"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="complaint">Reason for visit</label>
        <input
          id="complaint"
          className="input"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="Chest tightness since two days"
        />
      </div>
      <button onClick={send} className="btn-primary mt-5">
        Send to the {department} cabin
      </button>
      <p className="mt-3 text-xs text-slate-500">
        The record goes only to doctors signed in to {department}.
      </p>
    </div>
  );
}
