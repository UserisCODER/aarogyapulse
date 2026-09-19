'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEPARTMENTS = ['General Medicine', 'Cardiology', 'Orthopaedics', 'Gynaecology', 'Paediatrics'];

export default function RecordsCounterPage() {
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
      if (u.role !== 'staff' && u.role !== 'admin') {
        router.replace('/login');
        return;
      }
      setUser(u);
      setAuthChecked(true);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // ── page state ────────────────────────────────────────────────────────────
  const [aadhaar, setAadhaar] = useState('');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(null);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [tokenLoading, setTokenLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!aadhaar) return;
    setLoading(true);
    setMessage('');
    setPatient(null);
    setToken(null);

    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/check-aadhaar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ aadhaar_number: aadhaar })
      });

      const data = await res.json();
      if (res.ok && data.found) {
        setPatient(data.patient);
        setMessage('');
      } else {
        setMessage(data.message || 'No Health ID found. Patient will be treated as walk-in.');
        setPatient(null);
      }
    } catch (err) {
      setMessage('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    if (!patient) return;
    setTokenLoading(true);
    setMessage('');

    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          aadhaar_number: aadhaar,
          department: department,
          is_walkin: false
        })
      });

      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setMessage('');
      } else {
        setMessage('Failed to generate token.');
      }
    } catch (err) {
      setMessage('Error generating token.');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ocrText = formData.get('ocr_text');
    const healthId = patient.health_id || patient.healthId;

    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${healthId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ocr_text: ocrText,
          file_url: 'https://mock-storage.com/doc.pdf'
        })
      });

      if (res.ok) {
        setMessage('✅ Document uploaded successfully!');
        e.target.reset();
      } else {
        setMessage('Document upload failed.');
      }
    } catch (err) {
      setMessage('Network error during upload.');
    }
  };

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
              <span className="text-base">🏥</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">AarogyaPulse</p>
              <p className="text-[10px] text-teal-400 uppercase tracking-wider">Hospital Records Counter</p>
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

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16 space-y-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Hospital Records Counter</h1>
          <p className="text-sm text-gray-400">Verify Aadhaar, generate queue token, and manage patient documents.</p>
        </div>

        {/* Step 1 - Check Aadhaar */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-white/10">
          <p className="text-xs font-semibold text-teal-400 mb-3">STEP 1 — VERIFY AADHAAR</p>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              placeholder="Enter Aadhaar number (e.g. 123456789012)..."
              className="flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-teal-500 outline-none"
            />
            <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-500 px-6 py-3 rounded-xl text-sm font-semibold transition">
              {loading ? 'Checking...' : 'Check Aadhaar'}
            </button>
          </form>
          {message && <p className="text-xs mt-3 text-amber-400">{message}</p>}
        </div>

        {patient && (
          <>
            {/* Patient Info */}
            <div className="p-6 rounded-2xl bg-[#161618] border border-white/10">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Health ID: <span className="text-teal-400">{patient.health_id}</span> · Phone: {patient.phone}
                  </p>
                  <p className="text-xs text-gray-400">
                    DOB: {patient.dob} · Gender: {patient.gender}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  ✓ Health ID Found
                </span>
              </div>

              {/* Step 2 - Generate Token */}
              <p className="text-xs font-semibold text-teal-400 mb-3">STEP 2 — GENERATE QUEUE TOKEN</p>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-300 mb-2">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerateToken}
                  disabled={tokenLoading || !!token}
                  className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  {tokenLoading ? 'Generating...' : token ? 'Token Generated' : 'Generate Token'}
                </button>
              </div>

              {/* Token Display */}
              {token && (
                <div className="mt-4 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-teal-400 font-semibold">QUEUE TOKEN</p>
                    <p className="text-3xl font-bold text-white mt-1">{token.token_number}</p>
                    <p className="text-xs text-gray-400 mt-1">{token.department} · {token.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Status</p>
                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-full capitalize">
                      {token.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3 - Upload Document */}
            <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 space-y-4">
              <p className="text-xs font-semibold text-teal-400 mb-3">STEP 3 — UPLOAD DOCUMENTS</p>
              <form onSubmit={handleDocumentUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">OCR Extracted Text / Notes</label>
                  <textarea
                    name="ocr_text"
                    required
                    rows={4}
                    placeholder="Enter notes or extracted prescription text..."
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white outline-none resize-none"
                  />
                </div>
                <button type="submit" className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-xl text-xs font-semibold transition">
                  Upload Scanned Document
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}