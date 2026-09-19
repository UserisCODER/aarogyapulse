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

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      setError('API URL is missing in environment variables!');
      setLoading(false);
      return;
    }

    try {
      // Endpoint as per doc: POST /api/auth/login
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend returned non-JSON response. Check your Render URL.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Save token for protected routes
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Route based on role
      const role = data.user.role;
     if (role === 'admin') router.push('/admin');
     else if (role === 'doctor') router.push('/doctor');
     else if (role === 'staff') router.push('/records-counter');
     else if (role === 'aadhaar') router.push('/aadhaar-center');
     else router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#111113] border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">AarogyaPulse Portal Login</h2>
        <p className="text-xs text-gray-400 mb-6">Enter official credentials to access the grid.</p>

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
                

        <div className="border-t border-white/5 pt-4 mt-4 text-center">
          <p className="text-xs text-gray-500">
            Are you a patient?{' '}
            <a href="/patient/login" className="text-teal-400 hover:text-teal-300 transition">
              Sign in as Patient →
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}