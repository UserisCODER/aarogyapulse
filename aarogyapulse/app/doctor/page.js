"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import Timeline from "@/components/Timeline";
import PatientHeader from "@/components/PatientHeader";
import DocumentList from "@/components/DocumentList";

const OFFLINE_KEY = "aarogyapulse.pendingRx";

export default function DoctorPage() {
  return (
    <AppShell
      role="doctor"
      title="Cabin"
      subtitle="Everyone checked in to your department appears here. Ask the patient for access and their history opens before they sit down."
    >
      {(user) => <Cabin user={user} />}
    </AppShell>
  );
}

function Cabin({ user }) {
  const [queue, setQueue] = useState([]);
  const [active, setActive] = useState(null);
  const [consent, setConsent] = useState(null);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pendingRx, setPendingRx] = useState(0);

  const loadQueue = useCallback(async () => {
    const res = await fetch(
      `/api/queue?department=${encodeURIComponent(user.department)}`
    );
    const data = await res.json();
    setQueue(data.queue);
  }, [user.department]);

  useEffect(() => {
    loadQueue();
    const t = setInterval(loadQueue, 4000);
    return () => clearInterval(t);
  }, [loadQueue]);

  // Anything written while the network was down is retried here.
  const flushOffline = useCallback(async () => {
    const raw = window.localStorage.getItem(OFFLINE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    if (!items.length) {
      setPendingRx(0);
      return;
    }

    const left = [];
    for (const item of items) {
      try {
        const res = await fetch("/api/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) left.push(item);
      } catch {
        left.push(item);
      }
    }
    window.localStorage.setItem(OFFLINE_KEY, JSON.stringify(left));
    setPendingRx(left.length);
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    flushOffline();
    window.addEventListener("online", flushOffline);
    const t = setInterval(flushOffline, 20000);
    return () => {
      window.removeEventListener("online", flushOffline);
      clearInterval(t);
    };
  }, [flushOffline]);

  // Ask the patient for access, then poll until they answer.
  const requestAccess = useCallback(
    async (entry) => {
      setActive(entry);
      setPatient(null);
      setRecords([]);

      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abhaId: entry.abhaId,
          doctorId: user.id,
          doctorName: user.name,
          department: user.department,
          scope: `${user.department} history and current medicines`,
          reason: entry.complaint,
        }),
      });
      const data = await res.json();
      setConsent(data.consent);
    },
    [user]
  );

  const openRecord = useCallback(
    async (abhaId) => {
      const res = await fetch(
        `/api/patients/${encodeURIComponent(abhaId)}?doctorId=${user.id}&actor=${encodeURIComponent(user.name)}`
      );
      if (!res.ok) return false;
      const data = await res.json();
      setPatient(data.patient);
      setRecords(data.records);
      setDocuments(data.documents || []);
      return true;
    },
    [user]
  );

  // While a request is pending, check every couple of seconds for the answer.
  useEffect(() => {
    if (!consent || consent.live || patient) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/consent?doctorId=${user.id}`);
      const data = await res.json();
      const mine = data.consents.find((c) => c.id === consent.id);
      if (!mine) return;
      setConsent(mine);
      if (mine.live) openRecord(mine.abhaId);
    }, 2000);
    return () => clearInterval(t);
  }, [consent, patient, user.id, openRecord]);

  useEffect(() => {
    if (consent?.live && !patient) openRecord(consent.abhaId);
  }, [consent, patient, openRecord]);

  function finish() {
    setActive(null);
    setConsent(null);
    setPatient(null);
    setRecords([]);
    setDocuments([]);
    loadQueue();
    flushOffline();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] items-start">
      <aside className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold tracking-tight text-sm">
            Waiting · {user.department}
          </h2>
          <span className="chip bg-gov-50 text-gov-700">{queue.length}</span>
        </div>

        {pendingRx > 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-900">
            {pendingRx} prescription{pendingRx > 1 ? "s" : ""} saved on this device,
            waiting to sync.
          </p>
        )}

        {queue.length === 0 && (
          <p className="text-sm text-slate-600 mt-3">
            Nobody waiting. Check-ins from the records counter land here.
          </p>
        )}

        <ul className="mt-3 space-y-2">
          <AnimatePresence>
            {queue.map((q) => (
              <motion.li
                key={q.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
              >
                <button
                  onClick={() => requestAccess(q)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition ${
                    active?.id === q.id
                      ? "border-gov-500 bg-gov-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold text-sm">{q.name}</p>
                  <p className="text-xs text-slate-600">{q.complaint}</p>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </aside>

      <div>
        {!active && (
          <div className="card p-10 text-center">
            <p className="font-semibold">Pick a patient from the list</p>
            <p className="text-sm text-slate-600 mt-1">
              You will ask them for access, and their history opens the moment
              they say yes.
            </p>
          </div>
        )}

        {active && !patient && (
          <ConsentWait consent={consent} entry={active} onCancel={finish} />
        )}

        {patient && (
          <motion.div
            key={patient.abhaId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ConsentBadge consent={consent} />
            <PatientHeader patient={patient} records={records} />
            <Summary records={records} department={user.department} />

            {documents.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold tracking-tight mb-3">Uploaded documents</h3>
                <DocumentList documents={documents} />
              </div>
            )}

            <div>
              <h3 className="font-bold tracking-tight mb-3">Full history</h3>
              <Timeline records={records} highlightDepartment={user.department} />
            </div>

            <PrescriptionForm
              user={user}
              patient={patient}
              queueId={active?.id}
              onSaved={finish}
              onQueuedOffline={(n) => setPendingRx(n)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ConsentWait({ consent, entry, onCancel }) {
  const denied = consent && (consent.status === "denied" || consent.status === "revoked");

  return (
    <div className="card p-10 text-center">
      {denied ? (
        <>
          <p className="font-semibold">{entry.name} refused access</p>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Consult without the history, or ask them again in person. Nothing on
            their record has been opened.
          </p>
        </>
      ) : (
        <>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-2.5 w-2.5 rounded-full bg-gov-500 mx-auto"
          />
          <p className="font-semibold mt-4">Waiting for {entry.name} to allow access</p>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            The request is on their phone. Once they tap allow, the history opens
            here for one hour.
          </p>
        </>
      )}
      <button onClick={onCancel} className="btn-ghost mt-6">
        Back to the list
      </button>
    </div>
  );
}

function ConsentBadge({ consent }) {
  if (!consent?.expiresAt) return null;
  const mins = Math.max(
    0,
    Math.round((new Date(consent.expiresAt) - new Date()) / 60000)
  );
  return (
    <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm text-emerald-900">
      Access granted by the patient · {mins} minutes left · scope: {consent.scope}
    </div>
  );
}

function Summary({ records, department }) {
  if (!records.length) return null;

  const mine = records.filter((r) => r.department === department);
  const last = mine[0] || records[0];
  const activeMeds = last.medicines || [];

  return (
    <div className="card p-5 border-gov-100 bg-gov-50/50">
      <h3 className="font-bold tracking-tight">Before you start</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        <li>
          Last seen for <span className="font-semibold">{last.diagnosis}</span> on{" "}
          {last.date} at {last.facility}.
        </li>
        <li>
          {mine.length} of {records.length} past visits were in {department}.
        </li>
        {activeMeds.length > 0 && (
          <li>
            Currently on{" "}
            <span className="font-semibold">
              {activeMeds.map((m) => `${m.name} ${m.dose}`).join(", ")}
            </span>
            .
          </li>
        )}
      </ul>
    </div>
  );
}

function PrescriptionForm({ user, patient, queueId, onSaved, onQueuedOffline }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [vitals, setVitals] = useState({ bp: "", pulse: "", weight: "" });
  const [medicines, setMedicines] = useState([
    { name: "", dose: "", frequency: "1-0-1", duration: "7 days" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setMed(i, key, value) {
    setMedicines((ms) => ms.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }

  function addRow() {
    setMedicines((ms) => [
      ...ms,
      { name: "", dose: "", frequency: "1-0-1", duration: "7 days" },
    ]);
  }

  async function save() {
    if (!diagnosis.trim()) {
      setError("Add a diagnosis before saving.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      abhaId: patient.abhaId,
      department: user.department,
      doctor: user.name,
      facility: user.facility,
      diagnosis,
      medicines,
      notes,
      vitals,
      queueId,
    };

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("server rejected");
      onSaved();
    } catch {
      // Offline-first: keep it on the device and sync when the network returns.
      const raw = window.localStorage.getItem(OFFLINE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      items.push(payload);
      window.localStorage.setItem(OFFLINE_KEY, JSON.stringify(items));
      onQueuedOffline?.(items.length);
      setError(
        "No connection. The prescription is saved on this device and will sync on its own."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <h3 className="font-bold tracking-tight">Today&apos;s prescription</h3>
      <p className="text-sm text-slate-600 mt-1">
        Saved to {patient.name}&apos;s health ID, so the next doctor sees it too.
      </p>

      <div className="mt-4">
        <label className="label" htmlFor="dx">Diagnosis</label>
        <input
          id="dx"
          className="input"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Hypertension - follow-up"
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="bp">Blood pressure</label>
          <input
            id="bp"
            className="input"
            value={vitals.bp}
            onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
            placeholder="130/84"
          />
        </div>
        <div>
          <label className="label" htmlFor="pulse">Pulse</label>
          <input
            id="pulse"
            className="input"
            value={vitals.pulse}
            onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
            placeholder="76"
          />
        </div>
        <div>
          <label className="label" htmlFor="weight">Weight (kg)</label>
          <input
            id="weight"
            className="input"
            value={vitals.weight}
            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
            placeholder="69"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="label !mb-0">Medicines</p>
        {medicines.map((m, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-4">
            <input
              className="input"
              value={m.name}
              onChange={(e) => setMed(i, "name", e.target.value)}
              placeholder="Name"
              aria-label={`Medicine ${i + 1} name`}
            />
            <input
              className="input"
              value={m.dose}
              onChange={(e) => setMed(i, "dose", e.target.value)}
              placeholder="40mg"
              aria-label={`Medicine ${i + 1} dose`}
            />
            <input
              className="input"
              value={m.frequency}
              onChange={(e) => setMed(i, "frequency", e.target.value)}
              placeholder="1-0-1"
              aria-label={`Medicine ${i + 1} frequency`}
            />
            <input
              className="input"
              value={m.duration}
              onChange={(e) => setMed(i, "duration", e.target.value)}
              placeholder="30 days"
              aria-label={`Medicine ${i + 1} duration`}
            />
          </div>
        ))}
        <button onClick={addRow} className="btn-ghost !py-2">
          Add a medicine
        </button>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="notes">Advice</label>
        <textarea
          id="notes"
          rows={3}
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Review in one month. Reduce salt."
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      )}

      <button onClick={save} disabled={saving} className="btn-primary mt-5">
        {saving ? "Saving…" : "Save to health ID and finish"}
      </button>
    </div>
  );
}
