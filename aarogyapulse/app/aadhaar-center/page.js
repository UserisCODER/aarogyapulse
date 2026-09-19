'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

function generateHealthId() {
  const rand = () => Math.floor(1000 + Math.random() * 9000);
  return `ABHA-${rand()}-${rand()}`;
}

export default function AadhaarCenterPage() {
  const router = useRouter();

  // ── auth ──────────────────────────────────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) { router.replace('/login'); return; }

    try {
      const u = JSON.parse(userRaw);
      if (u.role !== 'staff' && u.role !== 'admin' && u.role !== 'aadhaar') {
        router.replace('/login');
        return;
      }
      
      setUser(u);
      setAuthChecked(true);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // ── search state ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);

  // ── enrolment form ────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', aadhaar: '', dob: '', gender: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [enrolled, setEnrolled] = useState(null);

  // ── handlers ──────────────────────────────────────────────────────────────

  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResults(null);
    setSelected(null);
    setShowForm(false);
    setEnrolled(null);

    try {
      const token = localStorage.getItem('token');

      if (/^\d{12}$/.test(q)) {
        // Search by Aadhaar number
        const res = await fetch(`${API}/api/patients/search?aadhaar=${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResults(data.patients || []);
      } else {
        // Search by Health ID
        const res = await fetch(`${API}/api/patients/${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setResults([data.patient]);
        } else {
          setResults([]);
        }
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleSelect(patient) {
    setSelected(patient);
    setResults(null);
    setQuery('');
    setShowForm(false);
  }

  function openForm() {
    setShowForm(true);
    setResults(null);
    setSelected(null);
    setEnrolled(null);
    setFormErrors({});
    setSubmitError('');
    setForm({ name: '', aadhaar: '', dob: '', gender: '', phone: '' });
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors(fe => ({ ...fe, [name]: undefined }));
  }

  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full name is required.';
    if (!/^\d{12}$/.test(form.aadhaar)) errors.aadhaar = 'Must be exactly 12 digits.';
    if (!form.dob) errors.dob = 'Date of birth is required.';
    if (!form.gender) errors.gender = 'Select a gender.';
    if (form.phone && !/^\d{10}$/.test(form.phone)) errors.phone = 'Must be 10 digits.';
    return errors;
  }

  async function handleEnrol(e) {
    e.preventDefault();
    setSubmitError('');
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const health_id = generateHealthId();

      const res = await fetch(`${API}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          dob: form.dob,
          gender: form.gender,
          phone: form.phone.trim() || null,
          aadhaar_number: form.aadhaar,
          health_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setEnrolled(data.patient);
      setShowForm(false);
    } catch {
      setSubmitError('Network error. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setEnrolled(null);
    setSelected(null);
    setQuery('');
    setResults(null);
    setShowForm(false);
  }

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

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <span className="text-base">🪪</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">AarogyaPulse</p>
              <p className="text-[10px] text-teal-400 uppercase tracking-wider">Aadhaar Enrolment Centre</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleSignOut}
              className="text-xs border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-16 space-y-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aadhaar Enrolment</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Search for an existing patient by Aadhaar number or Health ID, or enrol a new patient.
          </p>
        </div>

        {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
        {enrolled && (
          <div className="rounded-2xl border-2 border-teal-500/50 bg-teal-500/5 p-8 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold">Patient Enrolled!</h2>
            <p className="text-gray-300 font-medium text-lg">{enrolled.name}</p>
            <div className="inline-block bg-black border border-teal-500/30 rounded-xl px-8 py-4">
              <p className="text-xs text-gray-500 mb-1">AarogyaPulse Health ID</p>
              <p className="font-mono text-2xl font-bold tracking-widest text-teal-400">
                {enrolled.health_id}
              </p>
            </div>
            <p className="text-sm text-gray-500">Note this ID and hand it to the patient.</p>
            <button onClick={handleReset}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
              Enrol another patient
            </button>
          </div>
        )}

        {/* ── SELECTED PATIENT ─────────────────────────────────────────────── */}
        {selected && !enrolled && (
          <div className="rounded-2xl border-2 border-teal-500/40 bg-[#0a1a1a] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Patient Found</p>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  DOB: {selected.dob || '—'} · {selected.gender || '—'}
                  {selected.phone ? ` · ${selected.phone}` : ''}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition">
                ✕ Clear
              </button>
            </div>
            <div className="bg-black border border-teal-500/20 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 mb-1">AarogyaPulse Health ID</p>
              <p className="font-mono text-2xl font-bold tracking-widest text-teal-400">{selected.health_id}</p>
            </div>
            <p className="text-sm text-gray-400">✅ This patient already has a Health ID. Read it out to them.</p>
          </div>
        )}

        {/* ── SEARCH + FORM ────────────────────────────────────────────────── */}
        {!enrolled && (
          <>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                placeholder="Search by Aadhaar number (12 digits) or Health ID…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-teal-500 outline-none transition"
              />
              <button type="submit" disabled={searching || !query.trim()}
                className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-5 py-3 rounded-xl text-sm font-semibold transition shrink-0">
                {searching ? 'Searching…' : 'Search'}
              </button>
            </form>

            {/* Results */}
            {results !== null && !searching && (
              <div className="space-y-3">
                {results.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#111113] p-6 text-center space-y-3">
                    <p className="text-gray-300 font-medium">No patient found.</p>
                    <p className="text-sm text-gray-500">Is this a new patient? Enrol them below.</p>
                    <button onClick={openForm}
                      className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
                      + Enrol new patient
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                    {results.map(p => (
                      <div key={p.id} className="border border-white/10 bg-[#111113] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-teal-500/40 transition">
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{p.health_id}</p>
                          <p className="text-xs text-gray-500">DOB: {p.dob || '—'} · {p.gender || '—'}</p>
                        </div>
                        <button onClick={() => handleSelect(p)}
                          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shrink-0">
                          Select
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Enrol button */}
            {results === null && !selected && !showForm && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">New patient?</span>
                <button onClick={openForm}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
                  + Enrol new patient
                </button>
              </div>
            )}

            {/* ── FORM ──────────────────────────────────────────────────────── */}
            {showForm && (
              <form onSubmit={handleEnrol} className="rounded-2xl border border-white/10 bg-[#111113] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">New Patient Enrolment</h2>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition">
                    ✕ Cancel
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Full name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Sunita Devi"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-teal-500 outline-none transition" />
                  {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Aadhaar */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Aadhaar number * (12 digits)</label>
                  <input name="aadhaar" value={form.aadhaar} onChange={handleFormChange}
                    placeholder="XXXXXXXXXXXX" maxLength={12} inputMode="numeric"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono tracking-widest focus:border-teal-500 outline-none transition" />
                  <p className="text-xs text-gray-600 mt-1">Demo only — use synthetic data, not real Aadhaar numbers.</p>
                  {formErrors.aadhaar && <p className="text-red-400 text-xs mt-1">{formErrors.aadhaar}</p>}
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Date of birth *</label>
                    <input name="dob" type="date" value={form.dob} onChange={handleFormChange}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition" />
                    {formErrors.dob && <p className="text-red-400 text-xs mt-1">{formErrors.dob}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleFormChange}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition">
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && <p className="text-red-400 text-xs mt-1">{formErrors.gender}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Mobile number (optional)</label>
                  <input name="phone" value={form.phone} onChange={handleFormChange}
                    placeholder="10-digit number" maxLength={10} inputMode="numeric"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-teal-500 outline-none transition" />
                  {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                {submitError && (
                  <div className="rounded-xl bg-red-950/40 border border-red-500/30 px-4 py-3 text-sm text-red-300">
                    {submitError}
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition">
                  {submitting ? 'Creating Health ID…' : 'Create Health ID & Enrol'}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}