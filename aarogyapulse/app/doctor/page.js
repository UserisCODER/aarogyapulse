'use client';
import React, { useState, useEffect } from 'react';

export default function DoctorCabinPage() {
  const [timeline, setTimeline] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const healthId = 'ABHA-1234-5678';

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${healthId}/timeline`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTimeline(data.timeline || []);
        setPatient(data.patient || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching timeline:', err);
        setLoading(false);
      });
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getBadgeColor(type) {
    switch (type) {
      case 'medical_record': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'prescription': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'document': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'lab_report': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'medication': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'medical_record': return 'Medical Record';
      case 'prescription': return 'Prescription';
      case 'document': return 'Scanned Document';
      case 'lab_report': return 'Lab Report';
      case 'medication': return 'Medication';
      default: return type;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-28">
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Doctor Cabin</h1>
          <p className="text-sm text-gray-400">Complete patient history loaded before they sit down.</p>
        </div>

        {patient && (
          <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500 mb-1">Patient Name</p>
              <p className="font-semibold text-white">{patient.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Health ID</p>
              <p className="font-semibold text-teal-400">{patient.health_id}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Date of Birth</p>
              <p className="font-semibold text-white">{patient.dob || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Gender</p>
              <p className="font-semibold text-white">{patient.gender || '—'}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">
            Patient Timeline {timeline.length > 0 && `(${timeline.length} events)`}
          </h3>

          {loading && (
            <p className="text-xs text-gray-500">Loading timeline...</p>
          )}

          {!loading && timeline.length === 0 && (
            <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 text-center">
              <p className="text-xs text-gray-500">No timeline entries found for this patient.</p>
            </div>
          )}

          {timeline.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#111113] border border-white/10 space-y-3">
              
              {/* Header */}
              <div className="flex justify-between items-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(item.type)}`}>
                  {getTypeLabel(item.type)}
                </span>
                <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
              </div>

              {/* Diagnosis */}
              {item.diagnosis && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Diagnosis</p>
                  <p className="text-sm font-semibold text-white">{item.diagnosis}</p>
                </div>
              )}

              {/* Provider / Facility */}
              {item.provider && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Provider</p>
                  <p className="text-sm text-gray-300">{item.provider}</p>
                </div>
              )}

              {/* OCR Text for documents */}
              {item.ocr_text && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Scanned Content</p>
                  <p className="text-sm text-gray-300 bg-black/40 rounded-lg p-3 leading-relaxed">{item.ocr_text}</p>
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                  <p className="text-sm text-gray-300">{item.notes}</p>
                </div>
              )}

              {/* Record type badge */}
              {item.record_type && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Record Type</p>
                  <p className="text-sm text-gray-300 capitalize">{item.record_type}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}