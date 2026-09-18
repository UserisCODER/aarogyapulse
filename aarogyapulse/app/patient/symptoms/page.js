// app/patient/symptoms/page.js
'use client';
import { useState } from 'react';

export default function KnowYourDisease() {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate quick NLP / clinical rule matching for hackathon demo
    setTimeout(() => {
      setAnalysis({
        possibleConditions: symptoms.toLowerCase().includes('fever') ? ['Viral Fever', 'Common Cold', 'Malaria (Screening recommended)'] : ['General Fatigue', 'Seasonal Allergy'],
        recommendation: 'Please consult an OPD General Physician immediately if symptoms persist over 48 hours.',
        department: 'General Medicine'
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-bold text-teal-800 mb-2">Know Your Disease?</h2>
      <p className="text-gray-600 mb-4">Describe your symptoms below in your own words for instant AI-assisted preliminary insights.</p>
      
      <form onSubmit={handleAnalyze} className="space-y-4">
        <textarea 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          rows="4"
          placeholder="e.g., mild fever, body ache, and headache for 2 days..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
        ></textarea>
        <button type="submit" className="btn-primary w-full py-2 rounded-lg">
          {loading ? 'Analyzing Symptoms...' : 'Analyze Symptoms'}
        </button>
      </form>

      {analysis && (
        <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <h3 className="font-bold text-teal-900">Preliminary Insights:</h3>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {analysis.possibleConditions.map((cond, i) => (
              <li key={i}>{cond}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-gray-600"><strong>Recommended Department:</strong> {analysis.department}</p>
          <p className="mt-1 text-sm text-teal-800">{analysis.recommendation}</p>
        </div>
      )}
    </div>
  );
}