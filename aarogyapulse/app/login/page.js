'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // PDF expects email
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Save token in localStorage for subsequent authorized requests
      localStorage.setItem('token', data.token);

      if (data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'doctor') router.push('/doctor');
      else if (data.user.role === 'staff' || data.user.role === 'records') router.push('/records-counter');
      else router.push('/patient/page');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#111113] border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Staff & Portal Login</h2>
        <p className="text-xs text-gray-400 mb-6">Enter your credentials to access the AarogyaPulse grid.</p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-teal-500 outline-none" 
              placeholder="staff@aarogyapulse.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-teal-500 outline-none" 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 rounded-xl text-sm transition shadow-lg mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}