'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'mock-google-token' })
      });
      if (res.ok) {
        router.push('/patient/page');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#111113] border border-white/10 shadow-2xl text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Patient Sign In</h2>
          <p className="text-xs text-gray-400">Access your portable medical health locker instantly.</p>
        </div>
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 rounded-xl text-sm transition shadow-lg"
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}