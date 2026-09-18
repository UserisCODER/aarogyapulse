'use client';
import React, { useState, useEffect } from 'react';

export default function DoctorCabinPage() {
  const [timeline, setTimeline] = useState([]);
  const [patient, setPatient] = useState(null);
  const healthId = '91-8209'; // Sample Health ID

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Matches PDF endpoint: GET /api/patients/:healthId/timeline[cite: 2]
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${healthId}/timeline`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTimeline(data.timeline || []);
        setPatient(data.patient || null);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-28">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Doctor Cabin Timeline Dashboard</h1>
          <p className="text-sm text-gray-400">Complete chronological patient timeline fetched directly from backend.</p>
        </div>

        {patient && (
          <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 flex justify-between items-center text-xs">
            <span>Patient: <strong>{patient.name}</strong></span>
            <span>Health ID: <strong>{patient.health_id || patient.healthId}</strong></span>
          </div>
        )}

        <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">Chronological Events</h3>
          {timeline.length === 0 ? (
            <p className="text-xs text-gray-500">No timeline entries found or waiting for backend sync.</p>
          ) : (
            timeline.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span className="text-teal-400 uppercase font-bold">{item.type}</span>
                  <span>{item.date}</span>
                </div>
                <p className="text-gray-200">{JSON.stringify(item.record || item)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}