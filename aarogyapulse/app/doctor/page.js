'use client';
import React, { useState, useEffect } from 'react';

export default function DoctorCabinPage() {
  const [timeline, setTimeline] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { medicine_name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [prescriptionMessage, setPrescriptionMessage] = useState('');
  const [saving, setSaving] = useState(false);
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

  function setMed(i, key, value) {
    setMedicines(ms => ms.map((m, idx) => idx === i ? { ...m, [key]: value } : m));
  }

  function addMedicine() {
    setMedicines(ms => [...ms, { medicine_name: '', dosage: '', frequency: '', duration: '' }]);
  }

  function removeMedicine(i) {
    setMedicines(ms => ms.filter((_, idx) => idx !== i));
  }

  async function handlePrescriptionSave() {
    if (!notes.trim()) {
      setPrescriptionMessage('Please add consultation notes before saving.');
      return;
    }

    setSaving(true);
    setPrescriptionMessage('');

    try {
      const token = localStorage.getItem('token');

      // Step 1 — Upload prescription
      const prescRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${healthId}/prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });

      const prescData = await prescRes.json();

      if (!prescRes.ok) {
        setPrescriptionMessage('Failed to save prescription.');
        setSaving(false);
        return;
      }

      // Step 2 — Upload medications if any filled
      const filledMeds = medicines.filter(m => m.medicine_name.trim());
      if (filledMeds.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${healthId}/medications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            prescription_id: prescData.prescription.id,
            medications: filledMeds
          })
        });
      }

      setPrescriptionMessage('✅ Prescription saved to Health ID successfully!');
      setNotes('');
      setMedicines([{ medicine_name: '', dosage: '', frequency: '', duration: '' }]);

    } catch (err) {
      setPrescriptionMessage('Network error while saving prescription.');
    } finally {
      setSaving(false);
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

        {/* Timeline */}
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
              <div className="flex justify-between items-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(item.type)}`}>
                  {getTypeLabel(item.type)}
                </span>
                <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
              </div>
              {item.diagnosis && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Diagnosis</p>
                  <p className="text-sm font-semibold text-white">{item.diagnosis}</p>
                </div>
              )}
              {item.provider && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Provider</p>
                  <p className="text-sm text-gray-300">{item.provider}</p>
                </div>
              )}
              {item.ocr_text && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Scanned Content</p>
                  <p className="text-sm text-gray-300 bg-black/40 rounded-lg p-3 leading-relaxed">{item.ocr_text}</p>
                </div>
              )}
              {item.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                  <p className="text-sm text-gray-300">{item.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Prescription Upload */}
        {patient && (
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 space-y-6">
            <p className="text-xs font-semibold text-teal-400">TODAY'S PRESCRIPTION</p>
            <p className="text-xs text-gray-400 -mt-4">
              Saved to {patient?.name}'s Health ID — next doctor sees it automatically.
            </p>

            {/* Consultation Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Consultation Notes / Diagnosis
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Fever and cold, advised rest for 3 days..."
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none resize-none focus:border-teal-500"
              />
            </div>

            {/* Medicines */}
            <div>
              <p className="text-xs font-medium text-gray-300 mb-3">Medicines</p>
              <div className="space-y-3">
                {medicines.map((m, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <input
                      className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                      placeholder="Medicine name"
                      value={m.medicine_name}
                      onChange={(e) => setMed(i, 'medicine_name', e.target.value)}
                    />
                    <input
                      className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                      placeholder="Dosage e.g. 500mg"
                      value={m.dosage}
                      onChange={(e) => setMed(i, 'dosage', e.target.value)}
                    />
                    <input
                      className="rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                      placeholder="Frequency e.g. 1-0-1"
                      value={m.frequency}
                      onChange={(e) => setMed(i, 'frequency', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                        placeholder="Duration e.g. 5 days"
                        value={m.duration}
                        onChange={(e) => setMed(i, 'duration', e.target.value)}
                      />
                      {medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(i)}
                          className="text-red-400 hover:text-red-300 text-xs px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addMedicine}
                className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition"
              >
                + Add another medicine
              </button>
            </div>

            {prescriptionMessage && (
              <p className="text-xs text-amber-400">{prescriptionMessage}</p>
            )}

            <button
              onClick={handlePrescriptionSave}
              disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition"
            >
              {saving ? 'Saving...' : 'Save Prescription to Health ID'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}