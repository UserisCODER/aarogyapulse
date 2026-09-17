"use client";

import { motion } from "framer-motion";

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Timeline({ records = [], highlightDepartment }) {
  if (!records.length) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold">No history on this health ID yet</p>
        <p className="text-sm text-slate-600 mt-1">
          Scan a paper slip at the records counter to start the timeline.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-slate-200 ml-3">
      {records.map((r, i) => {
        const mine = highlightDepartment && r.department === highlightDepartment;
        return (
          <motion.li
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="ml-6 pb-6 last:pb-0"
          >
            <span
              className={`absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-white ${
                mine ? "bg-gov-500" : "bg-slate-300"
              }`}
            />
            <div className={`card p-4 ${mine ? "border-gov-100 bg-gov-50/40" : ""}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                <span className="text-sm font-semibold">{formatDate(r.date)}</span>
                <span className="chip bg-gov-50 text-gov-700">{r.department}</span>
                {r.source === "paper-ocr" && (
                  <span className="chip bg-slate-100 text-slate-600">
                    Digitised from paper
                  </span>
                )}
                {r.source === "doctor-entry" && (
                  <span className="chip bg-emerald-50 text-emerald-700">
                    Written in cabin
                  </span>
                )}
              </div>

              <p className="font-semibold text-[15px]">{r.diagnosis}</p>
              <p className="text-sm text-slate-600">
                {r.facility}
                {r.doctor && r.doctor !== "—" ? ` · ${r.doctor}` : ""}
              </p>

              {r.medicines?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {r.medicines.map((m, idx) => (
                    <li key={idx} className="text-sm text-slate-700">
                      <span className="font-medium">{m.name}</span> {m.dose} ·{" "}
                      {m.frequency} · {m.duration}
                    </li>
                  ))}
                </ul>
              )}

              {r.notes && (
                <p className="mt-3 text-sm text-slate-600 border-t border-slate-100 pt-2.5">
                  {r.notes}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
