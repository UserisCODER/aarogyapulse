"use client";

export default function PatientHeader({ patient, records = [] }) {
  const allergies = records
    .map((r) => r.allergy)
    .filter(Boolean)
    .join(", ");

  const conditions = [...new Set(records.map((r) => r.diagnosis))].slice(0, 3);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{patient.name}</h2>
          <p className="text-sm text-slate-600">
            {patient.age ? `${patient.age} yrs` : "Age not recorded"} ·{" "}
            {patient.gender} · {patient.village}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Health ID</p>
          <p className="font-mono text-sm font-semibold">{patient.abhaId}</p>
        </div>
      </div>

      {allergies && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
          <p className="text-sm font-semibold text-red-800">Allergy: {allergies}</p>
        </div>
      )}

      {conditions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {conditions.map((c) => (
            <span key={c} className="chip bg-slate-100 text-slate-700">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
