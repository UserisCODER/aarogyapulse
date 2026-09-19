'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function PatientLoginPage() {
  const router = useRouter();
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!/^\d{12}$/.test(aadhaar)) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/patients/check-aadhaar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: aadhaar }),
      });

      const data = await res.json();

      if (res.ok && data.found) {
        // Save patient data to localStorage
        localStorage.setItem('patient', JSON.stringify(data.patient));
        router.push('/patient');
      } else {
        setError('No Health ID found for this Aadhaar number. Please visit your nearest Aadhaar Enrolment Centre to get enrolled.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 12h2l1.5-3 2.5 6 1.5-3h2.5" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">AarogyaPulse</span>
          </div>
          <h2 className="text-2xl font-bold">Patient Health Locker</h2>
          <p className="text-sm text-gray-400 mt-1">Enter your Aadhaar number to access your records</p>
        </div>

        <div className="p-8 rounded-2xl bg-[#111113] border border-white/10 shadow-2xl space-y-5">

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={aadhaar}
                onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
                inputMode="numeric"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-gray-600 font-mono tracking-widest focus:border-teal-500 outline-none transition"
              />
              <p className="text-xs text-gray-600 mt-1">
                Demo: use Aadhaar numbers from enrolled patients
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || aadhaar.length !== 12}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg"
            >
              {loading ? 'Checking...' : 'Access My Records'}
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center">
            <p className="text-xs text-gray-500">
              Not enrolled yet?{' '}
              <span className="text-teal-400">Visit your nearest Aadhaar Enrolment Centre</span>
            </p>
          </div>
        </div>

        {/* Back to staff login */}
        <p className="text-center text-xs text-gray-600">
          Are you a staff member?{' '}
          <a href="/login" className="text-teal-400 hover:text-teal-300 transition">
            Staff Portal →
          </a>
        </p>
      </div>
    </div>
  );
}