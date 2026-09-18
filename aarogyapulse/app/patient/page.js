'use client';
import React, { useState, useEffect } from 'react';

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const healthId = '91-8209'; // Default sample Health ID

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Matches PDF endpoint: GET /api/patients/:healthId[cite: 2]
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${healthId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPatientData(data.patient || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-28">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Patient Health Locker</h1>
          <p className="text-sm text-gray-400">Secure portable medical history aligned with backend endpoints.</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading sovereign health records...</p>
        ) : (
          <div className="p-8 rounded-2xl bg-[#111113] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold">{patientData?.name || 'Ramesh Kumar'}</h3>
                <p className="text-xs text-gray-400">Health ID: {patientData?.health_id || patientData?.healthId || healthId}</p>
              </div>
              <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-full">Active Record</span>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-300">Patient Details</h4>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2 text-xs text-gray-300">
                <p><strong>Gender:</strong> {patientData?.gender || 'Male'}</p>
                <p><strong>Date of Birth:</strong> {patientData?.dob || '1990-01-01'}</p>
                <p><strong>Phone:</strong> {patientData?.phone || '9876543210'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}