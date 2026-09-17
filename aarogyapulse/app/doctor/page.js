"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import Timeline from "@/components/Timeline";
import PatientHeader from "@/components/PatientHeader";

export default function DoctorPage() {
  return (
    <AppShell
      role="doctor"
      title="Cabin"
      subtitle="Everyone checked in to your department appears here, with their history already loaded."
    >
      {(user) => <Cabin user={user} />}
    </AppShell>
  );
}

function Cabin({ user }) {
  const [queue, setQueue] = useState([]);
  const [active, setActive] = useState(null); // queue entry
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);

  const loadQueue = useCallback(async () => {
    const res = await fetch(
      `/api/queue?department=${encodeURIComponent(user.department)}`
    );
    const data = await res.json();
    setQueue(data.queue);
  }, [user.department]);

  useEffect(() => {
    loadQueue();
    // Poll so a check-in made at the records counter appears without a refresh.
    const t = setInterval(loadQueue, 4000);
    return () => clearInterval(t);
  }, [loadQueue]);

  async function openPatient(entry) {
    const res = await fetch(`/api/patients/${encodeURIComponent(entry.abhaId)}`);
    const data = await res.json();
    setActive(entry);
    setPatient(data.patient);
    setRecords(data.records);
  }

  async function afterSave() {
    setActive(null);
    setPatient(null);
    setRecords([]);
    loadQueue();
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
                  onClick={() => openPatient(q)}
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
        {!patient ? (
          <div className="card p-10 text-center">
            <p className="font-semibold">Pick a patient from the list</p>
            <p className="text-sm text-slate-600 mt-1">
              Their history opens before they sit down.
            </p>
          </div>
        ) : (
          <motion.div
            key={patient.abhaId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <PatientHeader patient={patient} records={records} />
            <Summary records={records} department={user.department} />

            <div>
              <h3 className="font-bold tracking-tight mb-3">Full history</h3>
              <Timeline records={records} highlightDepartment={user.department} />
            </div>

            <PrescriptionForm
              user={user}
              patient={patient}
              queueId={active?.id}
              onSaved={afterSave}
            />
          </motion.div>
        )}
      </div>
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

function PrescriptionForm({ user, patient, queueId, onSaved }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dose: "", frequency: "1-0-1", duration: "7 days" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setMed(i, key, value) {
    setMedicines((ms) => ms.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }

  function addRow() {
    setMedicines((ms) => [...ms, { name: "", dose: "", frequency: "1-0-1", duration: "7 days" }]);
  }

  async function save() {
    if (!diagnosis.trim()) {
      setError("Add a diagnosis before saving.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        abhaId: patient.abhaId,
        department: user.department,
        doctor: user.name,
        facility: user.facility,
        diagnosis,
        medicines,
        notes,
        queueId,
      }),
    });
    setSaving(false);
    if (res.ok) onSaved();
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
          placeholder="Hypertension — follow-up"
        />
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
        <p className="mt-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button onClick={save} disabled={saving} className="btn-primary mt-5">
        {saving ? "Saving…" : "Save to health ID and finish"}
      </button>
    </div>
  );
}
