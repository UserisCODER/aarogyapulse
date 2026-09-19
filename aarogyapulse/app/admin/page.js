'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const router = useRouter();

  // ── auth guard ────────────────────────────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) { router.replace('/login'); return; }
    try {
      const u = JSON.parse(userRaw);
      if (u.role !== 'admin') { router.replace('/login'); return; }
      setUser(u);
      setAuthChecked(true);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // ── data ──────────────────────────────────────────────────────────────────
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  // ── patient modal state ───────────────────────────────────────────────────
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authChecked) {
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [authChecked, loadData]);

  // ── patient detail ────────────────────────────────────────────────────────
  async function openPatient(patient) {
    setSelectedPatient(patient);
    setPatientLoading(true);
    setEditMode(false);
    setConfirmDelete(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/patients/${patient.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPatientDetail(data);
        setEditForm({
          name: data.patient.name,
          dob: data.patient.dob || '',
          gender: data.patient.gender || '',
          phone: data.patient.phone || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPatientLoading(false);
    }
  }

  async function handleEditSave() {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setPatientDetail(prev => ({ ...prev, patient: updated.patient }));
        setEditMode(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/patients/${selectedPatient.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSelectedPatient(null);
        setPatientDetail(null);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  }

  // ── token status ──────────────────────────────────────────────────────────
  async function handleTokenStatus(tokenId, newStatus) {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/admin/tokens/${tokenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  function handleSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-500 text-sm">
        Verifying credentials…
      </div>
    );
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'patients', label: 'Patients' },
    { key: 'tokens', label: 'Tokens' },
    { key: 'audit', label: 'Audit Log' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <span className="text-base">⚙️</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">AarogyaPulse</p>
              <p className="text-[10px] text-teal-400 uppercase tracking-wider">Admin Control Room</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:block">{user?.name}</span>
            <button onClick={handleSignOut}
              className="text-xs border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold">Patient Profile</h2>
              <button onClick={() => { setSelectedPatient(null); setPatientDetail(null); setEditMode(false); setConfirmDelete(false); }}
                className="text-gray-500 hover:text-white text-xs border border-white/10 px-3 py-1.5 rounded-lg transition">
                ✕ Close
              </button>
            </div>

            {patientLoading ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading patient data…</div>
            ) : patientDetail ? (
              <div className="p-6 space-y-6">

                {/* Patient info */}
                {!editMode ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', value: patientDetail.patient.name },
                        { label: 'Health ID', value: patientDetail.patient.health_id },
                        { label: 'Date of Birth', value: patientDetail.patient.dob || '—' },
                        { label: 'Gender', value: patientDetail.patient.gender || '—' },
                        { label: 'Phone', value: patientDetail.patient.phone || '—' },
                        { label: 'Aadhaar (last 4)', value: `····${patientDetail.patient.aadhaar_number?.slice(-4) || '????'}` },
                      ].map(f => (
                        <div key={f.label} className="bg-black/40 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">{f.label}</p>
                          <p className="text-sm font-medium text-white">{f.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditMode(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                        ✏️ Edit Patient
                      </button>
                      {!confirmDelete ? (
                        <button onClick={() => setConfirmDelete(true)}
                          className="bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold transition">
                          🗑 Delete Patient
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400">Are you sure?</span>
                          <button onClick={handleDelete} disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                            {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
                          </button>
                          <button onClick={() => setConfirmDelete(false)}
                            className="border border-white/10 text-gray-400 px-3 py-1.5 rounded-lg text-xs transition">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit form */
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-teal-400">Edit Patient Details</h3>
                    {[
                      { label: 'Full Name', key: 'name', type: 'text' },
                      { label: 'Date of Birth', key: 'dob', type: 'date' },
                      { label: 'Phone', key: 'phone', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">{f.label}</label>
                        <input
                          type={f.type}
                          value={editForm[f.key] || ''}
                          onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">Gender</label>
                      <select value={editForm.gender || ''} onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition">
                        <option value="">Select…</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleEditSave} disabled={editLoading}
                        className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                        {editLoading ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button onClick={() => setEditMode(false)}
                        className="border border-white/10 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Records */}
                <div>
                  <h3 className="text-sm font-bold mb-3">Medical Records ({patientDetail.records.length})</h3>
                  {patientDetail.records.length === 0 ? (
                    <p className="text-xs text-gray-500">No records yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {patientDetail.records.map((r, i) => (
                        <div key={i} className="bg-black/40 rounded-xl p-3">
                          <p className="text-sm font-medium">{r.diagnosis || 'Record'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{r.record_date} · {r.provider || '—'}</p>
                          {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-sm font-bold mb-3">Documents ({patientDetail.documents.length})</h3>
                  {patientDetail.documents.length === 0 ? (
                    <p className="text-xs text-gray-500">No documents yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {patientDetail.documents.map((d, i) => (
                        <div key={i} className="bg-black/40 rounded-xl p-3">
                          <p className="text-xs text-gray-400">{d.ocr_text?.slice(0, 100) || '—'}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(d.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescriptions */}
                <div>
                  <h3 className="text-sm font-bold mb-3">Prescriptions ({patientDetail.prescriptions.length})</h3>
                  {patientDetail.prescriptions.length === 0 ? (
                    <p className="text-xs text-gray-500">No prescriptions yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {patientDetail.prescriptions.map((p, i) => (
                        <div key={i} className="bg-black/40 rounded-xl p-3">
                          <p className="text-xs text-gray-400">{p.notes || '—'}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16 space-y-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control Room</h1>
          <p className="text-sm text-gray-400 mt-1.5">Every health ID, record, token and audit log in one place.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                tab === t.key ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading data…</div>
        ) : !data ? (
          <div className="text-sm text-red-400">Failed to load data. Check your backend.</div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Health IDs Issued', value: data.stats.patients, icon: '🪪', tabKey: 'patients' },
                    { label: 'Medical Records', value: data.stats.records, icon: '📋', tabKey: null },
                    { label: 'Documents', value: data.stats.documents, icon: '📄', tabKey: null },
                    { label: 'Queue Tokens', value: data.stats.tokens, icon: '🎫', tabKey: 'tokens' },
                  ].map(s => (
                    <div key={s.label}
                      onClick={() => s.tabKey && setTab(s.tabKey)}
                      className={`rounded-2xl border border-white/10 bg-[#111113] p-5 ${s.tabKey ? 'cursor-pointer hover:border-teal-500/40 transition' : ''}`}>
                      <p className="text-2xl mb-1">{s.icon}</p>
                      <p className="text-3xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#111113] p-6">
                  <h2 className="text-sm font-bold mb-4">Recent Audit Activity</h2>
                  {data.recentAudit.length === 0 ? (
                    <p className="text-xs text-gray-500">No activity yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.recentAudit.slice(0, 8).map((a, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-teal-400 font-mono">{a.action}</span>
                            <span className="text-gray-500">{a.patient_id ? `Patient: ${a.patient_id.slice(0, 8)}…` : ''}</span>
                          </div>
                          <span className="text-gray-600">{new Date(a.created_at).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PATIENTS */}
            {tab === 'patients' && (
              <div className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">
                {data.recentPatients.length === 0 ? (
                  <p className="text-sm text-gray-500 p-6">No patients yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Name', 'Health ID', 'Gender', 'DOB', 'Phone', 'Enrolled', 'Actions'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.recentPatients.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition">
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3 font-mono text-teal-400 text-xs">{p.health_id}</td>
                          <td className="px-4 py-3 text-gray-400">{p.gender || '—'}</td>
                          <td className="px-4 py-3 text-gray-400">{p.dob || '—'}</td>
                          <td className="px-4 py-3 text-gray-400">{p.phone || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => openPatient(p)}
                              className="bg-teal-600/20 hover:bg-teal-600/40 text-teal-400 px-3 py-1 rounded-lg text-xs font-semibold transition">
                              View →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TOKENS */}
            {tab === 'tokens' && (
              <div className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">
                {data.recentTokens.length === 0 ? (
                  <p className="text-sm text-gray-500 p-6">No tokens generated yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Token', 'Department', 'Date', 'Status', 'Walk-in', 'Change Status'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.recentTokens.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition">
                          <td className="px-4 py-3 font-bold text-teal-400">{t.token_number}</td>
                          <td className="px-4 py-3 text-gray-300">{t.department}</td>
                          <td className="px-4 py-3 text-gray-400">{t.date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              t.status === 'waiting' ? 'bg-yellow-500/10 text-yellow-400' :
                              t.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-green-500/10 text-green-400'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{t.is_walkin ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3">
                            <select
                              value={t.status}
                              onChange={e => handleTokenStatus(t.id, e.target.value)}
                              className="bg-black border border-white/10 text-white text-xs px-2 py-1 rounded-lg outline-none focus:border-teal-500 transition"
                            >
                              <option value="waiting">Waiting</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* AUDIT LOG */}
            {tab === 'audit' && (
              <div className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">
                {data.recentAudit.length === 0 ? (
                  <p className="text-sm text-gray-500 p-6">No audit logs yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Action', 'Patient ID', 'Metadata', 'When'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.recentAudit.map((a, i) => (
                        <tr key={i} className="hover:bg-white/5 transition">
                          <td className="px-4 py-3 text-teal-400 font-mono text-xs">{a.action}</td>
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{a.patient_id ? a.patient_id.slice(0, 8) + '…' : '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{a.metadata ? JSON.stringify(a.metadata).slice(0, 40) : '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.created_at).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}