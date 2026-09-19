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

  function handleSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  }

  // ── loading ───────────────────────────────────────────────────────────────
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

  // ── render ────────────────────────────────────────────────────────────────
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

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16 space-y-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control Room</h1>
          <p className="text-sm text-gray-400 mt-1.5">Every health ID, record, token and audit log in one place.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
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
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Health IDs Issued', value: data.stats.patients, icon: '🪪' },
                    { label: 'Medical Records', value: data.stats.records, icon: '📋' },
                    { label: 'Documents', value: data.stats.documents, icon: '📄' },
                    { label: 'Queue Tokens', value: data.stats.tokens, icon: '🎫' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl border border-white/10 bg-[#111113] p-5">
                      <p className="text-2xl mb-1">{s.icon}</p>
                      <p className="text-3xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
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

            {/* ── PATIENTS ── */}
            {tab === 'patients' && (
              <div className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">
                {data.recentPatients.length === 0 ? (
                  <p className="text-sm text-gray-500 p-6">No patients yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Name', 'Health ID', 'Gender', 'DOB', 'Enrolled'].map(h => (
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
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── TOKENS ── */}
            {tab === 'tokens' && (
              <div className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">
                {data.recentTokens.length === 0 ? (
                  <p className="text-sm text-gray-500 p-6">No tokens generated yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Token', 'Department', 'Date', 'Status', 'Walk-in'].map(h => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── AUDIT LOG ── */}
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