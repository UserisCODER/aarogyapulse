"use client";

/**
 * A small hand-drawn SVG chart — no charting library, so nothing to install
 * and nothing to break offline. Plots systolic and diastolic BP over time.
 */
export default function VitalsChart({ series = [] }) {
  if (series.length < 2) {
    return (
      <div className="card p-6">
        <h3 className="font-bold tracking-tight">Blood pressure</h3>
        <p className="text-sm text-slate-600 mt-1">
          Two or more visits with recorded vitals are needed before a trend appears.
        </p>
      </div>
    );
  }

  const W = 560;
  const H = 180;
  const pad = { l: 34, r: 12, t: 16, b: 26 };
  const values = series.flatMap((d) => [d.systolic, d.diastolic]).filter(Boolean);
  const min = Math.min(...values) - 10;
  const max = Math.max(...values) + 10;

  const x = (i) =>
    pad.l + (i * (W - pad.l - pad.r)) / Math.max(series.length - 1, 1);
  const y = (v) =>
    pad.t + ((max - v) * (H - pad.t - pad.b)) / Math.max(max - min, 1);

  const line = (key) =>
    series.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[key])}`).join(" ");

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold tracking-tight">Blood pressure over time</h3>
        <p className="text-xs text-slate-500">
          Systolic <span className="text-gov-600 font-semibold">—</span> · Diastolic{" "}
          <span className="text-slate-400 font-semibold">—</span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full mt-3"
        role="img"
        aria-label="Blood pressure readings over time"
      >
        {[min, (min + max) / 2, max].map((v) => (
          <g key={v}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(v)}
              y2={y(v)}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text x="4" y={y(v) + 4} fontSize="10" fill="#94A3B8">
              {Math.round(v)}
            </text>
          </g>
        ))}

        <path d={line("diastolic")} fill="none" stroke="#94A3B8" strokeWidth="2" />
        <path d={line("systolic")} fill="none" stroke="#2563EB" strokeWidth="2.5" />

        {series.map((d, i) => (
          <g key={d.date}>
            <circle cx={x(i)} cy={y(d.systolic)} r="3.5" fill="#2563EB" />
            <circle cx={x(i)} cy={y(d.diastolic)} r="3.5" fill="#94A3B8" />
            <text
              x={x(i)}
              y={H - 8}
              fontSize="10"
              fill="#64748B"
              textAnchor="middle"
            >
              {d.date.slice(0, 7)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
