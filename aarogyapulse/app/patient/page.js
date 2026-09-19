'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function PatientDashboard() {
  const router = useRouter();

  // ── auth guard ────────────────────────────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('patient');
    if (!raw) { router.replace('/patient/login'); return; }
    try {
      const p = JSON.parse(raw);
      if (!p || !p.health_id) { router.replace('/patient/login'); return; }
      setPatient(p);
      setAuthChecked(true);
    } catch {
      router.replace('/patient/login');
    }
  }, [router]);

  // ── data ──────────────────────────────────────────────────────────────────
  const [timeline, setTimeline] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('timeline');

  useEffect(() => {
    if (!authChecked || !patient) return;

    async function loadData() {
      try {
        const res = await fetch(`${API}/api/patients/${patient.health_id}/timeline`);
        if (res.ok) {
          const data = await res.json();
          const t = data.timeline || [];
          setTimeline(t);
          setRecords(t.filter(x => x.type === 'medical_record'));
          setPrescriptions(t.filter(x => x.type === 'prescription'));
          setDocuments(t.filter(x => x.type === 'document'));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authChecked, patient]);

  function handleSignOut() {
    localStorage.removeItem('patient');
    router.replace('/patient/login');
  }

  function getTypeIcon(type) {
    switch (type) {
      case 'medical_record': return '📋';
      case 'prescription': return '💊';
      case 'document': return '📄';
      case 'lab_report': return '🧪';
      default: return '📌';
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'medical_record': return 'Medical Record';
      case 'prescription': return 'Prescription';
      case 'document': return 'Document';
      case 'lab_report': return 'Lab Report';
      default: return type;
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-500 text-sm">
        Loading your records…
      </div>
    );
  }

  const TABS = [
    { key: 'timeline', label: 'Timeline', count: timeline.length },
    { key: 'records', label: 'Records', count: records.length },
    { key: 'prescriptions', label: 'Prescriptions', count: prescriptions.length },
    { key: 'documents', label: 'Documents', count: documents.length },
  ];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 12h2l1.5-3 2.5 6 1.5-3h2.5" /><circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">AarogyaPulse</p>
              <p className="text-[10px] text-teal-400 uppercase tracking-wider">Health Locker</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:block">{patient?.name}</span>
            <button onClick={handleSignOut}
              className="text-xs border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16 space-y-8">

        {/* Patient Info Card */}
        <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Your Health Profile</p>
              <h1 className="text-2xl font-bold">{patient?.name}</h1>
              <p className="text-sm text-gray-400 mt-1">
                DOB: {patient?.dob || '—'} · {patient?.gender || '—'}
                {patient?.phone ? ` · ${patient.phone}` : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500 mb-1">Health ID</p>
              <p className="font-mono text-lg font-bold text-teal-400">{patient?.health_id}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap flex items-center gap-2 ${
                tab === t.key
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className="text-xs bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading your health records…</div>
        ) : (
          <>
            {/* Timeline */}
            {tab === 'timeline' && (
              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#111113] p-8 text-center">
                    <p className="text-gray-400">No records found yet.</p>
                    <p className="text-xs text-gray-600 mt-1">Your medical history will appear here once records are added.</p>
                  </div>
                ) : (
                  timeline.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#111113] p-5 flex gap-4">
                      <div className="text-2xl">{getTypeIcon(item.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                            {getTypeLabel(item.type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {item.diagnosis && <p className="text-sm font-medium text-white">{item.diagnosis}</p>}
                        {item.notes && <p className="text-xs text-gray-400 mt-1">{item.notes}</p>}
                        {item.ocr_text && <p className="text-xs text-gray-400 mt-1">{item.ocr_text}</p>}
                        {item.provider && <p className="text-xs text-gray-500 mt-1">By: {item.provider}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Records */}
            {tab === 'records' && (
              <div className="space-y-4">
                {records.length === 0 ? (
                  <p className="text-sm text-gray-500">No medical records yet.</p>
                ) : (
                  records.map((r, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#111113] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-white">{r.diagnosis || 'Medical Record'}</p>
                        <span className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      {r.notes && <p className="text-xs text-gray-400">{r.notes}</p>}
                      {r.provider && <p className="text-xs text-gray-500 mt-1">Provider: {r.provider}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Prescriptions */}
            {tab === 'prescriptions' && (
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No prescriptions yet.</p>
                ) : (
                  prescriptions.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#111113] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-white">💊 Prescription</p>
                        <span className="text-xs text-gray-500">{new Date(p.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      {p.notes && <p className="text-xs text-gray-400">{p.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Documents */}
            {tab === 'documents' && (
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500">No documents yet.</p>
                ) : (
                  documents.map((d, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#111113] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-white">📄 Document</p>
                        <span className="text-xs text-gray-500">{new Date(d.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      {d.ocr_text && <p className="text-xs text-gray-400">{d.ocr_text}</p>}
                      {d.file_url && (
                        <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-teal-400 hover:text-teal-300 transition">
                          View Document →
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}