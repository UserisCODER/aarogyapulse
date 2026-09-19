"use client";

import { useState } from "react";
import Link from "next/link";

export default function KnowYourDisease() {
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setAnalysis(data);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = {
    routine: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    soon: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    urgent: "text-red-400 border-red-500/30 bg-red-500/10",
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/" className="text-sm text-gray-400 hover:text-teal-400">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-3">
            Know Your Disease?
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Describe symptoms in your own words. Gemini gives a preliminary
            triage suggestion — not a diagnosis.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="card p-5 space-y-4">
          <div>
            <label className="label" htmlFor="symptoms">
              Your symptoms
            </label>
            <textarea
              id="symptoms"
              className="input min-h-[120px]"
              rows={4}
              placeholder="e.g. mild fever, body ache and headache for 2 days..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              maxLength={2000}
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || symptoms.trim().length < 5}
          >
            {loading ? "Analyzing with Symptom AI" : "Analyze Symptoms"}
          </button>
        </form>

        {error && (
          <div className="card p-4 border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {analysis && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-teal-300">
                Preliminary insights
              </h2>
              <span
                className={`chip capitalize ${
                  urgencyColor[analysis.urgency] || urgencyColor.routine
                }`}
              >
                {analysis.urgency}
              </span>
            </div>

            <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
              {analysis.possibleConditions.map((cond, i) => (
                <li key={i}>{cond}</li>
              ))}
            </ul>

            <p className="text-sm">
              <span className="text-gray-400">Recommended department: </span>
              <span className="text-teal-300 font-medium">
                {analysis.department}
              </span>
            </p>

            <p className="text-sm text-gray-300">{analysis.recommendation}</p>

            <p className="text-xs text-gray-500 border-t border-white/10 pt-3">
              {analysis.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}