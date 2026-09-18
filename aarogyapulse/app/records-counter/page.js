'use client';
import React, { useState } from 'react';

export default function RecordsCounterPage() {
  const [aadhaar, setAadhaar] = useState('');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!aadhaar) return;
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/check-aadhaar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ "aadhaar number": aadhaar }) // Matches PDF
      });
      const data = await res.json();
      if (res.ok && data.found) {
        setPatient(data.patient);
      } else {
        setMessage(data.message || 'Patient not found.');
        setPatient(null);
      }
    } catch (err) {
      setMessage('Error checking Aadhaar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ocrText = formData.get('ocr_text') || 'Scanned prescription slip';
    const fileUrl = 'https://mock-storage.com/doc.pdf';

    try {
      const token = localStorage.getItem('token');
      // Matches PDF endpoint: POST /api/patients/:healthId/documents[cite: 2]
      const healthId = patient.health_id || patient.healthId;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${healthId}/documents`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ocr_text: ocrText, file_url: fileUrl })
      });
      if (res.ok) {
        setMessage('Document uploaded successfully and pending verification!');
      } else {
        setMessage('Document upload failed.');
      }
    } catch (err) {
      setMessage('Network error during upload.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-28">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Hospital Records Counter</h1>
          <p className="text-sm text-gray-400">Check Aadhaar and upload scanned medical documents as per backend specs.</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111113] border border-white/10">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input 
              type="text" 
              value={aadhaar} 
              onChange={(e) => setAadhaar(e.target.value)} 
              placeholder="Enter Aadhaar number..." 
              className="flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-teal-500 outline-none"
            />
            <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-500 px-6 py-3 rounded-xl text-sm font-semibold transition">
              {loading ? 'Checking...' : 'Check Aadhaar'}
            </button>
          </form>
          {message && <p className="text-xs mt-3 text-amber-400">{message}</p>}
        </div>

        {patient && (
          <div className="p-6 rounded-2xl bg-[#161618] border border-white/10 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                <p className="text-xs text-gray-400">Health ID: {patient.health_id || patient.healthId} | Phone: {patient.phone}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-full">Linked & Verified</span>
            </div>

            <form onSubmit={handleDocumentUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">OCR Text / Document Notes</label>
                <input type="text" name="ocr_text" required placeholder="Enter extracted text or notes..." className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-xs text-white outline-none" />
              </div>
              <button type="submit" className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-xl text-xs font-semibold transition">
                Upload Scanned Document to Backend
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}